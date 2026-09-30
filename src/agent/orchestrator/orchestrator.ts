/**
 * AgentOrchestrator
 * Coordinates task execution across capabilities, model selection, and event emission.
 * It never holds API keys; it receives them through the provider.
 */

import type {
  AIProvider,
  AIRequest,
  AgentState,
  AppSettings,
} from '@shared/types';
import { AgentEventBus } from '@agent/events/eventBus';
import { AgentStateMachine } from '@agent/state/stateMachine';
import { ModelRouter } from '@agent/providers/router';

export interface OrchestrationOptions {
  settings: AppSettings;
  provider: AIProvider;
}

export type TaskPlanner = (task: string, stateMachine: AgentStateMachine) => Promise<AgentState[]>;

/** Default heuristic planner for MVP fallback. */
const defaultPlanner: TaskPlanner = async (task, sm) => {
  const lowered = task.toLowerCase();
  const plan: AgentState[] = [];

  if (/research|latest|information|summarize|summary/.test(lowered)) {
    plan.push('analyzing', 'navigating', 'interacting', 'reasoning', 'understanding', 'doing', 'helping');
  } else if (/reason|compare|explain/.test(lowered)) {
    plan.push('understanding', 'reasoning', 'helping');
  } else if (/find|fetch|browse|navigate/.test(lowered)) {
    plan.push('navigating', 'interacting', 'helping');
  } else {
    plan.push('analyzing', 'understanding', 'helping');
  }
  return plan;
};

/** LLM-driven planner that uses the analyzing model to generate a capability plan. */
export class LLMTaskPlanner {
  constructor(
    private provider: AIProvider,
    private settings: AppSettings,
    private router: ModelRouter,
  ) {}

  async plan(userTask: string): Promise<AgentState[]> {
    const model = this.router.getModelForState('analyzing');
    if (!model) {
      throw new Error('No model configured for analyzing capability');
    }

    const systemPrompt = `You are ANIRUDH's task planner.
Your job is to analyze a user task and return a JSON object with a "plan" array containing the sequence of capabilities to execute.

Available capabilities (use these exact strings):
- analyzing
- navigating
- interacting
- reasoning
- understanding
- doing
- helping

Rules:
1. Return ONLY a JSON object with a "plan" array of capability names
2. The plan should be logical and complete for the user's task
3. Never include "idle", "waiting", "success", or "error"
4. Keep the plan concise (typically 3-7 steps)
5. If the task is simple, you can have fewer steps
6. The plan should start with analyzing and end with helping

Example:
User task: "Find the latest news about AI"
Response: {"plan": ["analyzing", "navigating", "interacting", "reasoning", "understanding", "helping"]}

Now analyze the task and return your plan.`;

    const request = {
      model,
      prompt: `User task: ${userTask}\n\nGenerate the capability plan as JSON.`,
      systemPrompt,
      temperature: 0.3,
      maxTokens: 256,
      capability: 'analyzing' as AgentState,
    };

    const response = await this.provider.generate(request);
    const text = response.text.trim();

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(`LLM planner returned invalid JSON: ${text.slice(0, 200)}`);
    }

    let planData;
    try {
      planData = JSON.parse(jsonMatch[0]);
    } catch (e) {
      throw new Error(`Failed to parse LLM planner JSON: ${e}`);
    }

    if (!Array.isArray(planData.plan)) {
      throw new Error('LLM planner response missing "plan" array');
    }

    // Validate capabilities
    const validStates: AgentState[] = [
      'analyzing', 'navigating', 'interacting', 'reasoning',
      'understanding', 'doing', 'helping'
    ];

    const plan = planData.plan
      .filter((s: string) => validStates.includes(s as AgentState))
      .map((s: string) => s as AgentState);

    if (plan.length === 0) {
      throw new Error('LLM planner returned empty or invalid plan');
    }

    // Ensure plan ends with helping
    if (plan[plan.length - 1] !== 'helping') {
      plan.push('helping');
    }

    return plan;
  }
}

export class AgentOrchestrator {
  private readonly router: ModelRouter;
  private readonly stateMachine: AgentStateMachine;
  private readonly bus: AgentEventBus;
  private planner: TaskPlanner;
  private llmPlanner: LLMTaskPlanner;

  constructor(options: OrchestrationOptions) {
    this.bus = new AgentEventBus();
    this.stateMachine = new AgentStateMachine(this.bus);
    this.router = new ModelRouter(options.settings.modelRouting);
    this.provider = options.provider;
    this.settings = options.settings;
    this.llmPlanner = new LLMTaskPlanner(this.provider, this.settings, this.router);
    // Use LLM planner by default, fallback to heuristic on error
    this.planner = async (task, sm) => {
      try {
        return await this.llmPlanner.plan(task);
      } catch (e) {
        console.warn('LLM planning failed, falling back to heuristic:', e);
        return await defaultPlanner(task, sm);
      }
    };
  }

  readonly provider: AIProvider;
  readonly settings: AppSettings;

  get stateMachinePublic(): AgentStateMachine {
    return this.stateMachine;
  }

  get eventBus(): AgentEventBus {
    return this.bus;
  }

  setPlanner(planner: TaskPlanner) {
    this.planner = planner;
  }

  async executeTask(userTask: string): Promise<void> {
    const taskId = `task_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`;
    this.stateMachine.startTask(taskId);

    try {
      this.bus.emit({
        type: 'message',
        message: `Planning task: ${userTask}`,
        timestamp: Date.now(),
      });

      const plan = await this.planner(userTask, this.stateMachine);
      
      this.bus.emit({
        type: 'message',
        message: `Plan generated: ${plan.join(' → ')}`,
        timestamp: Date.now(),
      });

      for (const state of plan) {
        await this.runCapability(state, userTask);
        if (this.stateMachine.current === 'error') {
          throw new Error('Task aborted due to capability error');
        }
      }
      this.stateMachine.completeTask(`Completed: ${userTask}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.stateMachine.failTask(message);
    }
  }

  private async runCapability(state: AgentState, userTask: string): Promise<void> {
    if (!['analyzing','navigating','interacting','reasoning','understanding','doing','helping'].includes(state)) {
      return;
    }
    this.stateMachine.setState(state, `Starting ${state}`);
    this.bus.emit({ type: 'model_selected', state, model: this.router.getModelForState(state as any), message: `Model selected for ${state}`, timestamp: Date.now() });

    const model = this.router.getModelForState(state as any);
    if (!model) {
      throw new Error(`No model configured for state ${state}`);
    }

    const request: AIRequest = {
      model,
      prompt: this.buildPromptForState(state, userTask),
      systemPrompt: this.buildSystemPromptForState(state),
      temperature: this.settings.generation.temperature,
      maxTokens: this.settings.generation.maxTokens,
      capability: state,
    };

    this.bus.emit({ type: 'model_started', state, model, timestamp: Date.now() });

    try {
      if (this.provider.stream) {
        let fullText = '';
        for await (const evt of this.provider.stream(request)) {
          if (evt.type === 'token') {
            fullText += evt.token;
            this.bus.emit({ type: 'model_streaming', state, model, message: fullText.slice(-200), timestamp: Date.now() });
          } else if (evt.type === 'complete') {
            this.bus.emit({ type: 'model_completed', state, model, message: evt.response.text.slice(0, 200), timestamp: Date.now() });
            this.stateMachine.markCompleted();
            break;
          } else if (evt.type === 'error') {
            throw new Error(evt.error);
          }
        }
      } else {
        const response = await this.provider.generate(request);
        this.bus.emit({ type: 'model_completed', state, model, message: response.text.slice(0, 200), timestamp: Date.now() });
        this.stateMachine.markCompleted();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Model error';
      this.bus.emit({ type: 'task_failed', state, model, message, timestamp: Date.now() });
      // Try fallback chain (preferred already failed → try the rest).
      const fallbacked = await this.tryFallback(state, request, model);
      if (fallbacked) {
        return;
      }
      this.stateMachine.markError();
      throw err;
    }
  }

  /**
   * Attempt the configured fallback models for a capability.
   * Returns true if a fallback succeeded (capability marked completed).
   * Emits model_selected/model_started/model_completed events on success.
   */
  private async tryFallback(
    state: AgentState,
    request: AIRequest,
    failedModel: string,
  ): Promise<boolean> {
    const chain = this.router.getFallbackChain(state as any).filter((m) => m !== failedModel);
    for (const fallback of chain) {
      this.bus.emit({ type: 'model_selected', state, model: fallback, message: 'Trying fallback model', timestamp: Date.now() });
      this.bus.emit({ type: 'model_started', state, model: fallback, timestamp: Date.now() });
      try {
        if (this.provider.stream) {
          let fullText = '';
          for await (const evt of this.provider.stream({ ...request, model: fallback })) {
            if (evt.type === 'token') {
              fullText += evt.token;
              this.bus.emit({ type: 'model_streaming', state, model: fallback, message: fullText.slice(-200), timestamp: Date.now() });
            } else if (evt.type === 'complete') {
              this.bus.emit({ type: 'model_completed', state, model: fallback, message: evt.response.text.slice(0, 200), timestamp: Date.now() });
              break;
            } else if (evt.type === 'error') {
              throw new Error(evt.error);
            }
          }
        } else {
          const response = await this.provider.generate({ ...request, model: fallback });
          this.bus.emit({ type: 'model_completed', state, model: fallback, message: response.text.slice(0, 200), timestamp: Date.now() });
        }
        this.stateMachine.markCompleted();
        return true;
      } catch {
        // This fallback failed — try the next one in the chain.
        continue;
      }
    }
    return false;
  }

  private buildSystemPromptForState(state: AgentState): string {
    const map: Record<AgentState, string> = {
      analyzing: 'You are an analyst. Extract key facts and objectives from the user task.',
      navigating: 'You are a navigator. Plan where to search or browse to find information.',
      interacting: 'You are an interface assistant. Describe how to interact with web/desktop UI.',
      reasoning: 'You are a reasoner. Compare information and draw conclusions.',
      understanding: 'You are an interpreter. Summarize what you learned.',
      doing: 'You are an executor. Produce the final requested output.',
      helping: 'You are a helper. Present results clearly to the user.',
      idle: '',
      waiting: '',
      success: '',
      error: '',
    };
    return map[state] ?? '';
  }

  private buildPromptForState(state: AgentState, userTask: string): string {
    return `Task: ${userTask}\nCurrent capability: ${state}. Act accordingly and produce a concise output for this step.`;
  }
}