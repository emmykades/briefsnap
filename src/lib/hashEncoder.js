// Encodes/decodes app state into the URL hash so BriefSnap can pass a
// questionnaire, client answers or a brief between browsers with no backend.
// State is JSON, deflate-compressed, then base64url: as short as a link with
// no server can be. Encrypted answers use their own `e=` param (see crypto.js).
// Shape: { v, type: 'questionnaire' | 'answers' | 'brief', ... }
import { packBytes, unpackBytes, bytesToB64u, b64uToBytes } from './compress';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export async function encodeState(state) {
  return bytesToB64u(await packBytes(encoder.encode(JSON.stringify(state))));
}

export async function decodeState(encoded) {
  try {
    return JSON.parse(decoder.decode(await unpackBytes(b64uToBytes(encoded))));
  } catch {
    return null;
  }
}

// Reads a URL hash (with or without the leading '#'). Returns null if empty
// or unreadable; encrypted answers come back as { type: 'answers', enc }.
export async function parseHashState(hash) {
  const params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
  const e = params.get('e');
  if (e) return { v: 2, type: 'answers', enc: e };
  const legacy = params.get('s'); // plain base64 JSON from before compression
  if (legacy) {
    try {
      const b64 = legacy.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(decodeURIComponent(escape(atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4)))));
    } catch {
      return null;
    }
  }
  const z = params.get('z');
  if (z) return decodeState(z);
  return null;
}

export async function buildShareUrl(state) {
  const url = new URL(window.location.href);
  url.search = ''; // never carry the freelancer's access key into a client link
  url.hash = state.enc ? `e=${state.enc}` : `z=${await encodeState(state)}`;
  return url.toString();
}
