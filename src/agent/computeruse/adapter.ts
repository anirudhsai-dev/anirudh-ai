/**
 * AgentComputerUse placeholder
 * Future integration for Browser Use / OpenHands / custom Computer Use agent.
 */

export interface ComputerAction {
  type: 'click' | 'type' | 'scroll' | 'navigate' | 'screenshot';
  target?: string;
  text?: string;
  x?: number;
  y?: number;
}

export class ComputerUseAdapter {
  async execute(action: ComputerAction): Promise<void> {
    console.log('[ComputerUse] Would execute', action);
    // Future: integrate real computer use SDK
  }
}