/**
 * AgentStateMachine
 * Owns the current AgentState and emits state_changed events.
 * This is the single source of truth for "what is ANIRUDH doing right now?"
 */

import type { AgentState, AgentEvent, Letter, LetterStatus } from '@shared/types';
import { STATE_TO_LETTER, STATE_LABEL } from '@shared/types';
import { AgentEventBus } from '@agent/events/eventBus';

export interface StateMachineSnapshot {
  state: AgentState;
  letter: Letter | null;
  label: string;
  status: LetterStatus;
  startedAt: number | null;
}

export class AgentStateMachine {
  private state: AgentState = 'idle';
  private status: LetterStatus = 'idle';
  private startedAt: number | null = null;
  private taskId: string | null = null;

  constructor(private readonly bus: AgentEventBus) {}

  get current(): AgentState {
    return this.state;
  }

  get currentStatus(): LetterStatus {
    return this.status;
  }

  get currentLetter(): Letter | null {
    return STATE_TO_LETTER[this.state];
  }

  snapshot(): StateMachineSnapshot {
    return {
      state: this.state,
      letter: this.currentLetter,
      label: STATE_LABEL[this.state],
      status: this.status,
      startedAt: this.startedAt,
    };
  }

  /** Transition to a new state. Emits state_changed. */
  setState(next: AgentState, message?: string): void {
    const prev = this.state;
    if (prev === next) return;
    this.state = next;
    this.startedAt = Date.now();
    this.bus.emit({
      type: 'state_changed',
      state: next,
      message: message ?? `Transitioned from ${STATE_LABEL[prev]} to ${STATE_LABEL[next]}`,
      timestamp: Date.now(),
    });
  }

  /** Begin a task. */
  startTask(taskId: string): void {
    this.taskId = taskId;
    this.state = 'waiting';
    this.status = 'active';
    this.startedAt = Date.now();
    this.bus.emit({
      type: 'task_started',
      state: 'waiting',
      message: `Task started: ${taskId}`,
      timestamp: Date.now(),
    });
  }

  /** Mark the current capability as completed. */
  markCompleted(): void {
    this.status = 'completed';
  }

  /** Mark the current capability as errored. */
  markError(): void {
    this.status = 'error';
  }

  /** Finalize the task as successful. */
  completeTask(message?: string): void {
    this.state = 'success';
    this.status = 'completed';
    this.bus.emit({
      type: 'task_completed',
      state: 'success',
      message: message ?? 'Task completed successfully',
      timestamp: Date.now(),
    });
    // Return to idle shortly after so the pet can accept the next task.
    setTimeout(() => {
      this.state = 'idle';
      this.status = 'idle';
      this.taskId = null;
    }, 2500);
  }

  /** Finalize the task as failed. */
  failTask(message?: string): void {
    this.state = 'error';
    this.status = 'error';
    this.bus.emit({
      type: 'task_failed',
      state: 'error',
      message: message ?? 'Task failed',
      timestamp: Date.now(),
    });
    setTimeout(() => {
      this.state = 'idle';
      this.status = 'idle';
      this.taskId = null;
    }, 4000);
  }
}