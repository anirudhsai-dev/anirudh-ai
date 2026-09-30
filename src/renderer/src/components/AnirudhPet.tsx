import React from 'react';
import { LetterBase } from './letters/LetterBase';
import type { AgentState } from '@shared/types';

const capabilityToLetter: Record<AgentState, string | null> = {
  analyzing: 'A',
  navigating: 'N',
  interacting: 'I',
  reasoning: 'R',
  understanding: 'U',
  doing: 'D',
  helping: 'H',
  idle: null,
  waiting: null,
  success: null,
  error: null,
};

export const AnirudhPet: React.FC<{
  state: AgentState;
  status: 'idle' | 'active' | 'completed' | 'error';
  model?: string;
  message?: string;
  settings: { 
    size: number; 
    opacity: number; 
    glowIntensity: number; 
    animationSpeed: number; 
    theme: string;
    showTaskStatus?: boolean;
    showModelName?: boolean;
  };
}> = ({ state, status, model, message, settings }) => {
  const activeLetter = capabilityToLetter[state];
  const letters = ['A','N','I','R','U','D','H'];
  
  const stateLabels: Record<AgentState, string> = {
    analyzing: 'Analyzing',
    navigating: 'Navigating',
    interacting: 'Interacting',
    reasoning: 'Reasoning',
    understanding: 'Understanding',
    doing: 'Executing',
    helping: 'Helping',
    idle: 'Idle',
    waiting: 'Waiting',
    success: 'Success',
    error: 'Error',
  };

  return (
    <div 
      className={`anirudh-pet theme-${settings.theme}`}
      style={{ 
        opacity: settings.opacity,
        '--font-size': `${settings.size}px`,
        '--glow-intensity': settings.glowIntensity,
        '--animation-speed': `${settings.animationSpeed}`,
      } as React.CSSProperties}
    >
      <div className="letters">
        {letters.map(l => (
          <LetterBase key={l} glyph={l} active={activeLetter === l} status={status} />
        ))}
      </div>
      <div className="status-panel">
        <div className="state">{stateLabels[state] || state}</div>
        {model && settings.showModelName && <div className="model">Model: {model}</div>}
        {message && settings.showTaskStatus && <div className="message">{message}</div>}
      </div>
    </div>
  );
};