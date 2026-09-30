import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Production-only Content-Security-Policy (dev needs inline scripts for HMR). It stops
// injected scripts from running or sending the stored private key or an API key anywhere
// except the AI providers below. ponytail: keep connect-src in step with apiRouter.js.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  [
    "connect-src 'self'",
    'https://api.openai.com https://api.x.ai https://api.groq.com https://api.mistral.ai',
    'https://api.deepseek.com https://api.perplexity.ai https://api.together.xyz',
    'https://api.fireworks.ai https://api.cerebras.ai https://api.cohere.com',
    'https://api.anthropic.com https://generativelanguage.googleapis.com https://openrouter.ai',
    'http://localhost:11434',
  ].join(' '),
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ');

const securityMeta = {
  name: 'security-meta',
  apply: 'build',
  transformIndexHtml: () => [
    { tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP }, injectTo: 'head-prepend' },
    { tag: 'meta', attrs: { name: 'referrer', content: 'no-referrer' }, injectTo: 'head-prepend' },
  ],
};

export default defineConfig({
  plugins: [react(), securityMeta],
});
