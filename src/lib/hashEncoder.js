// Encodes/decodes app state into the URL hash so BriefSnap can pass a
// questionnaire (and later, client answers) between browsers with no backend.
// Shape: { v: 1, type: 'questionnaire' | 'answers', niche, questions, answers? }

function base64UrlEncode(str) {
  const base64 = btoa(unescape(encodeURIComponent(str)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str) {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  return decodeURIComponent(escape(atob(padded)));
}

export function encodeState(state) {
  const json = JSON.stringify(state);
  return base64UrlEncode(json);
}

export function decodeState(encoded) {
  try {
    const json = base64UrlDecode(encoded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function readStateFromHash() {
  const hash = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash;
  const params = new URLSearchParams(hash);
  const s = params.get('s');
  if (!s) return null;
  return decodeState(s);
}

export function buildShareUrl(state) {
  const encoded = encodeState(state);
  const url = new URL(window.location.href);
  url.hash = `s=${encoded}`;
  return url.toString();
}
