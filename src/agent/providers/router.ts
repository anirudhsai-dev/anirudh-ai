/**
 * ModelRouter
 * Resolves a capability state to a concrete model id using the user's routing config.
 * Supports a configurable fallback chain so degraded models never break the agent.
 */

import type { CapabilityKey, ModelRouting } from '@shared/types';

export class ModelRouter {
  constructor(private readonly routing: ModelRouting) {}

  /** Resolve the model id for a given capability. */
  getModelForState(state: CapabilityKey): string {
    return this.routing[state] ?? this.routing.fallback ?? '';
  }

  /** Build the ordered fallback chain for a capability (preferred → fallback). */
  getFallbackChain(state: CapabilityKey): string[] {
    const chain: string[] = [];
    const preferred = this.routing[state];
    if (preferred) chain.push(preferred);
    if (this.routing.fallback && this.routing.fallback !== preferred) {
      chain.push(this.routing.fallback);
    }
    return chain;
  }

  /** Validate that every configured model id is non-empty. */
  isValid(): boolean {
    const keys: CapabilityKey[] = [
      'analyzing', 'navigating', 'interacting', 'reasoning',
      'understanding', 'doing', 'helping',
    ];
    return keys.every((k) => Boolean(this.routing[k]));
  }
}

export function routingFromPartial(
  partial: Partial<ModelRouting> | null | undefined,
): ModelRouting {
  const base: ModelRouting = {
    analyzing: '', navigating: '', interacting: '', reasoning: '',
    understanding: '', doing: '', helping: '', fallback: '',
  };
  if (!partial) return base;
  return { ...base, ...partial };
}