/**
 * LLM Planner Demo
 * Demonstrates using the LLM-driven task planner
 */

import { LLMTaskPlanner } from '@agent/orchestrator/orchestrator';
import { FreeLLMAPIProvider } from '@agent/providers/freellmapi';
import { ModelRouter } from '@agent/providers/router';
import { DEFAULT_SETTINGS } from '@shared/types';
import { DEFAULT_MODEL_ROUTING } from '@shared/types';

async function demo() {
  console.log('ANIRUDH LLM Task Planner Demo\n');
  
  // Mock settings with a model configured
  const settings = {
    ...DEFAULT_SETTINGS,
    modelRouting: {
      ...DEFAULT_MODEL_ROUTING,
      analyzing: 'auto', // Use FreeLLMAPI auto routing
      navigating: 'auto',
      interacting: 'auto',
      reasoning: 'auto',
      understanding: 'auto',
      doing: 'auto',
      helping: 'auto',
      fallback: 'auto:fast',
    },
    freellmapi: {
      apiKey: process.env.FREELLMAPI_API_KEY || '',
      baseUrl: 'http://127.0.0.1:31415/v1',
    },
  };

  const provider = new FreeLLMAPIProvider({
    apiKey: settings.freellmapi.apiKey,
    baseUrl: settings.freellmapi.baseUrl,
  });

  const router = new ModelRouter(settings.modelRouting);
  const planner = new LLMTaskPlanner(provider, settings, router);

  const testTasks = [
    'Research the latest information about quantum computing and summarize it',
    'Find me the best restaurants near me and explain why',
    'Reason about the pros and cons of remote work',
    'Help me understand what machine learning is',
  ];

  for (const task of testTasks) {
    console.log(`\nTask: "${task}"`);
    try {
      const plan = await planner.plan(task);
      console.log(`Plan: ${plan.join(' → ')}`);
    } catch (e) {
      console.error(`Error planning: ${e}`);
    }
    console.log('---');
  }
}

demo().catch(console.error);
