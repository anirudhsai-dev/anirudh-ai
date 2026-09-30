/**
 * Shared type definitions for ANIRUDH.
 * These types are used across the Electron main process, preload, and renderer.
 */

// ---------------------------------------------------------------------------
// Agent State Machine
// ---------------------------------------------------------------------------

export type AgentState =
  | 'idle'
  | 'analyzing'
  | 'navigating'
  | 'interacting'
  | 'reasoning'
  | 'understanding'
  | 'doing'
  | 'helping'
  | 'waiting'
  | 'success'
  | 'error';

export type Letter = 'A' | 'N' | 'I' | 'R' | 'U' | 'D' | 'H';

export type LetterStatus = 'idle' | 'active' | 'completed' | 'error';

/** Map an AgentState to the ANIRUDH letter it activates. */
export const STATE_TO_LETTER: Record<AgentState, Letter | null> = {
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

export const STATE_LABEL: Record<AgentState, string> = {
  analyzing: 'Analyzing',
  navigating: 'Navigating',
  interacting: 'Interacting',
  reasoning: 'Reasoning',
  understanding: 'Understanding',
  doing: 'Doing',
  helping: 'Helping',
  idle: 'Idle',
  waiting: 'Waiting',
  success: 'Done',
  error: 'Error',
};

export const CAPABILITY_STATES: AgentState[] = [
  'analyzing',
  'navigating',
  'interacting',
  'reasoning',
  'understanding',
  'doing',
  'helping',
];

// ---------------------------------------------------------------------------
// AI Provider Abstraction
// ---------------------------------------------------------------------------

export interface ModelInfo {
  id: string;
  name?: string;
  description?: string;
  contextLength?: number;
  provider?: string;
}

export interface AIRequest {
  prompt: string;
  systemPrompt?: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  /** Optional context/messages for multi-turn. */
  messages?: AIMessage[];
  /** Capability this request is serving. */
  capability?: AgentState;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  text: string;
  model: string;
  finishReason?: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export type AIStreamEvent =
  | { type: 'token'; token: string }
  | { type: 'complete'; response: AIResponse }
  | { type: 'error'; error: string };

/**
 * The AIProvider interface is the contract every backend must implement.
 * The orchestrator only ever talks to AIProvider — never directly to FreeLLMAPI.
 */
export interface AIProvider {
  readonly name: string;
  listModels(): Promise<ModelInfo[]>;
  generate(request: AIRequest): Promise<AIResponse>;
  stream?(request: AIRequest): AsyncIterable<AIStreamEvent>;
}

// ---------------------------------------------------------------------------
// Model Routing
// ---------------------------------------------------------------------------

export type CapabilityKey =
  | 'analyzing'
  | 'navigating'
  | 'interacting'
  | 'reasoning'
  | 'understanding'
  | 'doing'
  | 'helping';

export interface ModelRouting {
  analyzing: string;
  navigating: string;
  interacting: string;
  reasoning: string;
  understanding: string;
  doing: string;
  helping: string;
  fallback: string;
}

export const DEFAULT_MODEL_ROUTING: ModelRouting = {
  analyzing: '',
  navigating: '',
  interacting: '',
  reasoning: '',
  understanding: '',
  doing: '',
  helping: '',
  fallback: '',
};

// ---------------------------------------------------------------------------
// Agent Events
// ---------------------------------------------------------------------------

export type AgentEventType =
  | 'task_started'
  | 'state_changed'
  | 'model_selected'
  | 'model_started'
  | 'model_streaming'
  | 'model_completed'
  | 'task_completed'
  | 'task_failed'
  | 'message';

export interface AgentEvent {
  type: AgentEventType;
  state?: AgentState;
  model?: string;
  message?: string;
  progress?: number;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Settings / Configuration
// ---------------------------------------------------------------------------

export interface AppSettings {
  freellmapi: {
    apiKey: string;
    baseUrl: string;
  };
  modelRouting: ModelRouting;
  generation: {
    temperature: number;
    maxTokens: number;
  };
  appearance: {
    size: number;
    opacity: number;
    glowIntensity: number;
    animationSpeed: number;
    theme: 'dark' | 'light' | 'neon';
  };
  behavior: {
    alwaysOnTop: boolean;
    startupWithOs: boolean;
    clickThrough: boolean;
    showTaskStatus: boolean;
    showModelName: boolean;
    showProgress: boolean;
  };
  position?: { x: number; y: number };
}

export const DEFAULT_SETTINGS: AppSettings = {
  freellmapi: {
    apiKey: '',
    baseUrl: 'https://freellmapi.example.com/v1',
  },
  modelRouting: { ...DEFAULT_MODEL_ROUTING },
  generation: {
    temperature: 0.7,
    maxTokens: 2048,
  },
  appearance: {
    size: 120,
    opacity: 0.92,
    glowIntensity: 0.8,
    animationSpeed: 1.0,
    theme: 'neon',
  },
  behavior: {
    alwaysOnTop: true,
    startupWithOs: true,
    clickThrough: false,
    showTaskStatus: true,
    showModelName: false,
    showProgress: true,
  },
};

// ---------------------------------------------------------------------------
// IPC Message types (renderer <-> main)
// ---------------------------------------------------------------------------

export interface IpcMessage {
  type: string;
  payload?: unknown;
}