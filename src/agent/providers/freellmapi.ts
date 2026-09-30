/**
 * FreeLLMAPIProvider
 * Implements AIProvider against an OpenAI-compatible endpoint.
 * FreeLLMAPI exposes an OpenAI-compatible REST API:
 *   GET  <baseUrl>/models          → list available models
 *   POST <baseUrl>/chat/completions → generate (optionally stream)
 *
 * The API key is never logged, never exposed to the renderer.
 * All calls go through this class; the orchestrator never touches fetch directly.
 */

import type {
  AIProvider,
  AIRequest,
  AIMessage,
  AIResponse,
  AIStreamEvent,
  ModelInfo,
} from '@shared/types';

interface FreeLLMModelRaw {
  id?: string;
  name?: string;
  description?: string;
  context_length?: number;
  owned_by?: string;
}

interface FreeLLMModelsResponse {
  data?: FreeLLMModelRaw[];
}

interface ChatCompletionChunk {
  choices?: Array<{
    delta?: { content?: string };
    finish_reason?: string | null;
  }>;
}

interface ChatCompletionResponse {
  id?: string;
  model?: string;
  choices?: Array<{
    message?: { content?: string };
    finish_reason?: string | null;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

export interface FreeLLMAPIProviderOptions {
  apiKey: string;
  baseUrl: string;
  fetchImpl?: typeof fetch;
}

export class FreeLLMAPIProvider implements AIProvider {
  readonly name = 'FreeLLMAPI';
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly fetch: typeof fetch;

  constructor(options: FreeLLMAPIProviderOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.fetch = options.fetchImpl ?? fetch;
  }

  private headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  private throwIfError(status: number, body: string, context: string): void {
    if (status >= 400) {
      let message = `${context}: HTTP ${status}`;
      try {
        const parsed = JSON.parse(body) as { error?: { message?: string } };
        if (parsed?.error?.message) message = `${context}: ${parsed.error.message}`;
      } catch {
        // ignore parse failure
      }
      const err = new Error(message);
      (err as Error & { status?: number }).status = status;
      throw err;
    }
  }

  async listModels(): Promise<ModelInfo[]> {
    if (!this.apiKey) {
      throw new Error('FreeLLMAPI: API key is not configured');
    }
    const res = await this.fetch(`${this.baseUrl}/models`, {
      headers: this.headers(),
    });
    const text = await res.text();
    this.throwIfError(res.status, text, 'FreeLLMAPI listModels');
    const json = JSON.parse(text) as FreeLLMModelsResponse;
    const data = json.data ?? [];
    return data.map((m) => ({
      id: m.id ?? m.name ?? 'unknown',
      name: m.name ?? m.id,
      description: m.description,
      contextLength: m.context_length,
      provider: m.owned_by ?? 'freellmapi',
    }));
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    const body = this.buildRequestBody(request);
    const res = await this.fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(body),
    });
    const text = await res.text();
    this.throwIfError(res.status, text, 'FreeLLMAPI generate');
    const json = JSON.parse(text) as ChatCompletionResponse;
    const content = json.choices?.[0]?.message?.content ?? '';
    return {
      text: content,
      model: json.model ?? request.model,
      finishReason: json.choices?.[0]?.finish_reason ?? undefined,
      usage: json.usage
        ? {
            promptTokens: json.usage.prompt_tokens,
            completionTokens: json.usage.completion_tokens,
            totalTokens: json.usage.total_tokens,
          }
        : undefined,
    };
  }

  async *stream(request: AIRequest): AsyncIterable<AIStreamEvent> {
    const body = this.buildRequestBody({ ...request, stream: true });
    const res = await this.fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(body),
    });

    if (!res.ok || !res.body) {
      const text = await res.text?.() ?? '';
      this.throwIfError(res.status, text, 'FreeLLMAPI stream');
      throw new Error('FreeLLMAPI stream: no response body');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';
    let finishReason: string | undefined;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;
          const data = trimmed.slice(5).trim();
          if (data === '[DONE]') {
            finishReason = 'stop';
            continue;
          }
          try {
            const chunk = JSON.parse(data) as ChatCompletionChunk;
            const token = chunk.choices?.[0]?.delta?.content;
            if (token) {
              fullText += token;
              yield { type: 'token', token };
            }
            if (chunk.choices?.[0]?.finish_reason) {
              finishReason = chunk.choices[0].finish_reason;
            }
          } catch {
            // ignore malformed SSE lines
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    yield {
      type: 'complete',
      response: {
        text: fullText,
        model: request.model,
        finishReason,
      },
    };
  }

  private buildRequestBody(request: AIRequest): Record<string, unknown> {
    const body: Record<string, unknown> = {
      model: request.model,
      stream: Boolean(request.stream),
    };
    if (request.messages && request.messages.length > 0) {
      body.messages = request.messages;
    } else {
      const messages: AIMessage[] = [];
      if (request.systemPrompt) {
        messages.push({ role: 'system', content: request.systemPrompt });
      }
      messages.push({ role: 'user', content: request.prompt });
      body.messages = messages;
    }
    if (request.temperature !== undefined) body.temperature = request.temperature;
    if (request.maxTokens !== undefined) body.max_tokens = request.maxTokens;
    return body;
  }
}