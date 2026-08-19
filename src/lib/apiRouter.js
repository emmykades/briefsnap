// The API key is passed directly from browser to the AI provider.
// This file contains no logging, no persistence, and no third-party calls.
// You can verify this by reading the source: https://github.com/emmykades/briefsnap

export const PROVIDERS = {
  openai: {
    label: 'OpenAI',
    defaultModel: 'gpt-4o-mini',
    models: [
      'gpt-4o-mini',
      'gpt-4o',
      'gpt-4.1-nano',
      'gpt-4.1-mini',
      'gpt-4.1',
      'o4-mini',
      'o3-mini',
      'o3',
      'gpt-3.5-turbo',
    ],
    needsKey: true,
    keyPlaceholder: 'sk-...',
    recommendation:
      'Works with any valid OpenAI API key. Recommended: gpt-4o-mini for speed and cost, or gpt-4o for higher-quality briefs.',
  },
  anthropic: {
    label: 'Anthropic (Claude)',
    defaultModel: 'claude-sonnet-4-6',
    models: [
      'claude-sonnet-4-6',
      'claude-opus-4-6',
      'claude-haiku-4-6',
      'claude-3-7-sonnet-latest',
      'claude-3-5-sonnet-latest',
      'claude-3-5-haiku-latest',
    ],
    needsKey: true,
    keyPlaceholder: 'sk-ant-...',
    recommendation:
      "Works with any valid Anthropic API key. Browsers can't call Anthropic's API directly (CORS) — use OpenRouter with a Claude model instead for the same models with no restriction.",
  },
  gemini: {
    label: 'Google Gemini',
    defaultModel: 'gemini-1.5-flash',
    models: [
      'gemini-1.5-flash',
      'gemini-1.5-flash-8b',
      'gemini-1.5-pro',
      'gemini-2.0-flash',
      'gemini-2.0-flash-lite',
      'gemini-2.5-flash',
      'gemini-2.5-pro',
    ],
    needsKey: true,
    keyPlaceholder: 'AIza...',
    recommendation:
      'Works with any Google AI Studio API key. Recommended: gemini-1.5-flash for speed, or gemini-1.5-pro for higher-quality briefs.',
  },
  openrouter: {
    label: 'OpenRouter',
    defaultModel: 'anthropic/claude-3-haiku',
    models: [
      'anthropic/claude-3-haiku',
      'anthropic/claude-3.5-sonnet',
      'anthropic/claude-3.5-haiku',
      'openai/gpt-4o',
      'openai/gpt-4o-mini',
      'openai/gpt-4.1',
      'google/gemini-pro-1.5',
      'google/gemini-2.0-flash-001',
      'meta-llama/llama-3.3-70b-instruct',
      'meta-llama/llama-3.1-405b-instruct',
      'deepseek/deepseek-chat',
      'mistralai/mistral-large',
      'x-ai/grok-4',
    ],
    needsKey: true,
    keyPlaceholder: 'sk-or-...',
    recommendation:
      'Works with any valid OpenRouter API key. Pick a model or choose Custom to type any slug, e.g. anthropic/claude-3.5-sonnet, openai/gpt-4o, or google/gemini-pro-1.5.',
  },
  xai: {
    label: 'xAI (Grok)',
    defaultModel: 'grok-4',
    models: ['grok-4', 'grok-4-fast', 'grok-3', 'grok-3-mini', 'grok-2-latest'],
    needsKey: true,
    keyPlaceholder: 'xai-...',
    recommendation:
      'Works with any valid xAI API key. Recommended: grok-4, or grok-4-fast for a cheaper/faster brief.',
  },
  groq: {
    label: 'Groq',
    defaultModel: 'openai/gpt-oss-20b',
    models: [
      'openai/gpt-oss-20b',
      'openai/gpt-oss-120b',
      'groq/compound',
      'groq/compound-mini',
      'qwen/qwen3.6-27b',
      'minimaxai/minimax-m2.7',
    ],
    needsKey: true,
    keyPlaceholder: 'gsk_...',
    recommendation:
      'Works with any valid Groq API key. Very fast inference. Recommended: gpt-oss-20b for speed, gpt-oss-120b for higher quality. (Groq retires models often — pick a model or choose Custom if these change again.)',
  },
  mistral: {
    label: 'Mistral',
    defaultModel: 'mistral-large-latest',
    models: [
      'mistral-large-latest',
      'mistral-medium-latest',
      'mistral-small-latest',
      'ministral-8b-latest',
      'open-mixtral-8x22b',
      'codestral-latest',
      'pixtral-large-latest',
    ],
    needsKey: true,
    keyPlaceholder: 'Your Mistral API key',
    recommendation: 'Works with any valid Mistral API key. Recommended: mistral-large-latest.',
  },
  deepseek: {
    label: 'DeepSeek',
    defaultModel: 'deepseek-chat',
    models: ['deepseek-chat', 'deepseek-reasoner', 'deepseek-coder'],
    needsKey: true,
    keyPlaceholder: 'sk-...',
    recommendation: 'Works with any valid DeepSeek API key. Recommended: deepseek-chat (or deepseek-reasoner).',
  },
  perplexity: {
    label: 'Perplexity',
    defaultModel: 'sonar',
    models: ['sonar', 'sonar-pro', 'sonar-reasoning', 'sonar-reasoning-pro', 'sonar-deep-research'],
    needsKey: true,
    keyPlaceholder: 'pplx-...',
    recommendation: 'Works with any valid Perplexity API key. Recommended: sonar, or sonar-pro for higher quality.',
  },
  together: {
    label: 'Together AI',
    defaultModel: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    models: [
      'meta-llama/Llama-3.3-70B-Instruct-Turbo',
      'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
      'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo',
      'mistralai/Mixtral-8x7B-Instruct-v0.1',
      'Qwen/Qwen2.5-72B-Instruct-Turbo',
      'deepseek-ai/DeepSeek-V3',
      'google/gemma-2-27b-it',
    ],
    needsKey: true,
    keyPlaceholder: 'Your Together API key',
    recommendation:
      'Works with any valid Together API key. Pick a model or choose Custom to type any hosted model slug.',
  },
  fireworks: {
    label: 'Fireworks AI',
    defaultModel: 'accounts/fireworks/models/llama-v3p1-70b-instruct',
    models: [
      'accounts/fireworks/models/llama-v3p1-70b-instruct',
      'accounts/fireworks/models/llama-v3p1-8b-instruct',
      'accounts/fireworks/models/llama-v3p1-405b-instruct',
      'accounts/fireworks/models/mixtral-8x7b-instruct',
      'accounts/fireworks/models/deepseek-v3',
      'accounts/fireworks/models/qwen2p5-72b-instruct',
    ],
    needsKey: true,
    keyPlaceholder: 'Your Fireworks API key',
    recommendation:
      'Works with any valid Fireworks API key. Pick a model or choose Custom to type any hosted model slug.',
  },
  cerebras: {
    label: 'Cerebras',
    defaultModel: 'llama-3.3-70b',
    models: ['llama-3.3-70b', 'llama3.1-8b', 'llama-4-scout-17b-16e-instruct', 'qwen-3-32b'],
    needsKey: true,
    keyPlaceholder: 'csk-...',
    recommendation: 'Works with any valid Cerebras API key. Pick a model or choose Custom to type any hosted model.',
  },
  cohere: {
    label: 'Cohere',
    defaultModel: 'command-r-plus',
    models: ['command-r-plus', 'command-r', 'command-r7b', 'command-a-03-2025', 'command-light'],
    needsKey: true,
    keyPlaceholder: 'Your Cohere API key',
    recommendation: 'Works with any valid Cohere API key. Recommended: command-r-plus.',
  },
  ollama: {
    label: 'Ollama (local)',
    defaultModel: 'llama3',
    models: ['llama3', 'llama3.1', 'llama3.2', 'mistral', 'mixtral', 'qwen2.5', 'phi3', 'gemma2', 'deepseek-r1', 'codellama'],
    needsKey: false,
    keyPlaceholder: '',
    recommendation:
      'No API key needed. Pick a model you have pulled locally, or choose Custom to type any other model name. Smaller local models may produce simpler output.',
  },
};

class ApiRouterError extends Error {}

// Shared by every provider that speaks the OpenAI chat-completions dialect
// (OpenAI, xAI, Groq, Mistral, DeepSeek, Perplexity, Together, Fireworks, Cerebras, OpenRouter).
async function callOpenAICompatible({ label, url, model, apiKey, messages, extraHeaders }) {
  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        ...extraHeaders,
      },
      body: JSON.stringify({ model, messages }),
    });
  } catch {
    throw new ApiRouterError(
      `Could not reach ${label}'s API. This may be a CORS restriction (some providers block direct browser requests) or a network issue.`
    );
  }
  const rawBody = await res.text();
  let data = null;
  try {
    data = JSON.parse(rawBody);
  } catch {
    // Some providers (or the CDN in front of them) return a plain-text/HTML
    // error body instead of JSON — rawBody below is the fallback for that.
  }
  if (!res.ok) {
    const message =
      (typeof data?.error === 'string' && data.error) ||
      data?.error?.message ||
      data?.message ||
      (rawBody && rawBody.trim().slice(0, 300)) ||
      `${label} request failed (${res.status})`;
    throw new ApiRouterError(message);
  }
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== 'string') {
    throw new ApiRouterError(`${label} returned an unexpected response shape.`);
  }
  return text;
}

async function callOpenAI({ model, apiKey, messages }) {
  return callOpenAICompatible({
    label: 'OpenAI',
    url: 'https://api.openai.com/v1/chat/completions',
    model,
    apiKey,
    messages,
  });
}

async function callXai({ model, apiKey, messages }) {
  return callOpenAICompatible({
    label: 'xAI',
    url: 'https://api.x.ai/v1/chat/completions',
    model,
    apiKey,
    messages,
  });
}

async function callGroq({ model, apiKey, messages }) {
  return callOpenAICompatible({
    label: 'Groq',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model,
    apiKey,
    messages,
  });
}

async function callMistral({ model, apiKey, messages }) {
  return callOpenAICompatible({
    label: 'Mistral',
    url: 'https://api.mistral.ai/v1/chat/completions',
    model,
    apiKey,
    messages,
  });
}

async function callDeepSeek({ model, apiKey, messages }) {
  return callOpenAICompatible({
    label: 'DeepSeek',
    url: 'https://api.deepseek.com/chat/completions',
    model,
    apiKey,
    messages,
  });
}

async function callPerplexity({ model, apiKey, messages }) {
  return callOpenAICompatible({
    label: 'Perplexity',
    url: 'https://api.perplexity.ai/chat/completions',
    model,
    apiKey,
    messages,
  });
}

async function callTogether({ model, apiKey, messages }) {
  return callOpenAICompatible({
    label: 'Together AI',
    url: 'https://api.together.xyz/v1/chat/completions',
    model,
    apiKey,
    messages,
  });
}

async function callFireworks({ model, apiKey, messages }) {
  return callOpenAICompatible({
    label: 'Fireworks AI',
    url: 'https://api.fireworks.ai/inference/v1/chat/completions',
    model,
    apiKey,
    messages,
  });
}

async function callCerebras({ model, apiKey, messages }) {
  return callOpenAICompatible({
    label: 'Cerebras',
    url: 'https://api.cerebras.ai/v1/chat/completions',
    model,
    apiKey,
    messages,
  });
}

async function callCohere({ model, apiKey, messages }) {
  const systemMessages = messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n\n');
  const conversation = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));

  let res;
  try {
    res = await fetch('https://api.cohere.com/v2/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: systemMessages ? [{ role: 'system', content: systemMessages }, ...conversation] : conversation,
      }),
    });
  } catch {
    throw new ApiRouterError(
      "Could not reach Cohere's API. This may be a CORS restriction (some providers block direct browser requests) or a network issue."
    );
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiRouterError(data?.message || `Cohere request failed (${res.status})`);
  }
  const text = data?.message?.content?.map((c) => c.text).join('');
  if (typeof text !== 'string' || !text) {
    throw new ApiRouterError('Cohere returned an unexpected response shape.');
  }
  return text;
}

async function callAnthropic({ model, apiKey, messages }) {
  const systemMessages = messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n\n');
  const conversation = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({ role: m.role, content: m.content }));

  let res;
  try {
    res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        system: systemMessages || undefined,
        messages: conversation,
      }),
    });
  } catch {
    throw new ApiRouterError(
      "Anthropic's API blocks direct browser requests. Use OpenRouter with a Claude model instead — it's the same model, fully supported."
    );
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiRouterError(data?.error?.message || `Anthropic request failed (${res.status})`);
  }
  const text = data?.content?.[0]?.text;
  if (typeof text !== 'string') {
    throw new ApiRouterError('Anthropic returned an unexpected response shape.');
  }
  return text;
}

async function callGemini({ model, apiKey, messages }) {
  const systemMessages = messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n\n');
  const conversation = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: conversation,
      systemInstruction: systemMessages ? { parts: [{ text: systemMessages }] } : undefined,
    }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiRouterError(data?.error?.message || `Gemini request failed (${res.status})`);
  }
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('');
  if (typeof text !== 'string' || !text) {
    throw new ApiRouterError('Gemini returned an unexpected response shape.');
  }
  return text;
}

async function callOpenRouter({ model, apiKey, messages }) {
  return callOpenAICompatible({
    label: 'OpenRouter',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    model,
    apiKey,
    messages,
    extraHeaders: {
      'HTTP-Referer': 'https://briefsnap.app',
      'X-Title': 'BriefSnap',
    },
  });
}

async function callOllama({ model, messages }) {
  let res;
  try {
    res = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, stream: false }),
    });
  } catch {
    throw new ApiRouterError(
      'Could not reach Ollama at localhost:11434. Make sure Ollama is running locally.'
    );
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiRouterError(data?.error || `Ollama request failed (${res.status})`);
  }
  const text = data?.message?.content;
  if (typeof text !== 'string') {
    throw new ApiRouterError('Ollama returned an unexpected response shape.');
  }
  return text;
}

// messages: [{ role: 'system' | 'user' | 'assistant', content: string }]
// Returns a plain string with the assistant's reply, normalized across providers.
export async function sendMessage({ provider, model, apiKey, messages }) {
  switch (provider) {
    case 'openai':
      return callOpenAI({ model, apiKey, messages });
    case 'anthropic':
      return callAnthropic({ model, apiKey, messages });
    case 'gemini':
      return callGemini({ model, apiKey, messages });
    case 'openrouter':
      return callOpenRouter({ model, apiKey, messages });
    case 'xai':
      return callXai({ model, apiKey, messages });
    case 'groq':
      return callGroq({ model, apiKey, messages });
    case 'mistral':
      return callMistral({ model, apiKey, messages });
    case 'deepseek':
      return callDeepSeek({ model, apiKey, messages });
    case 'perplexity':
      return callPerplexity({ model, apiKey, messages });
    case 'together':
      return callTogether({ model, apiKey, messages });
    case 'fireworks':
      return callFireworks({ model, apiKey, messages });
    case 'cerebras':
      return callCerebras({ model, apiKey, messages });
    case 'cohere':
      return callCohere({ model, apiKey, messages });
    case 'ollama':
      return callOllama({ model, messages });
    default:
      throw new ApiRouterError(`Unknown provider: ${provider}`);
  }
}
