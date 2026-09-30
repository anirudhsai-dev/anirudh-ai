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
      analyzing: 'gpt-4o-mini', // Configure your model here
      navigating: 'gpt-4o-mini',
      interacting: 'gpt-4o-mini',
      reasoning: 'gpt-4o-mini',
      understanding: 'gpt-4o-mini',
      doing: 'gpt-4o-mini',
      helping: 'gpt-4o-mini',
      fallback: 'gpt-4o-mini',
    },
    freellmapi: {
      apiKey: process.env.FREELLMAPI_API_KEY || '',
      baseUrl: 'https://api.freellmapi.com/v1',
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
