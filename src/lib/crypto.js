// Public-key encryption for client answers, using only the browser's WebCrypto.
//
// The freelancer's browser holds an ECDH P-256 keypair. The questionnaire link
// carries only the PUBLIC key. When a client submits, their browser generates a
// throwaway keypair, derives a shared secret with the freelancer's public key,
// and encrypts the answers with AES-GCM. The link they send back contains only
// ciphertext plus their throwaway public key, so it can be opened only with the
// freelancer's private key, which never leaves the freelancer's device.

import { packBytes, unpackBytes, bytesToB64u, b64uToBytes } from './compress';

const KEY_STORAGE = 'briefsnap_keypair_v1';
const CURVE = { name: 'ECDH', namedCurve: 'P-256' };
const enc8 = new TextEncoder();
const V2 = 2; // format byte; v1 blobs start with 0x04 (the raw EC point) instead

// Uncompressed EC point (0x04 || X || Y), base64url — the compact form used in links.
function jwkToPublicRaw(jwk) {
  const x = b64uToBytes(jwk.x);
  const y = b64uToBytes(jwk.y);
  const raw = new Uint8Array(1 + x.length + y.length);
  raw[0] = 4;
  raw.set(x, 1);
  raw.set(y, 1 + x.length);
  return bytesToB64u(raw);
}

function importPublicRaw(publicRaw) {
  return crypto.subtle.importKey('raw', b64uToBytes(publicRaw), CURVE, false, []);
}

function concat(...parts) {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}

async function deriveAesKey(privateKey, publicKey, usage, info) {
  const bits = await crypto.subtle.deriveBits({ name: 'ECDH', public: publicKey }, privateKey, 256);
  const hkdfKey = await crypto.subtle.importKey('raw', bits, 'HKDF', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info },
    hkdfKey,
    { name: 'AES-GCM', length: 256 },
    false,
    [usage]
  );
}

function readStoredKey() {
  try {
    const raw = localStorage.getItem(KEY_STORAGE);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && parsed.privateJwk && parsed.publicKey ? parsed : null;
  } catch {
    return null;
  }
}

function storeKey(record) {
  try {
    localStorage.setItem(KEY_STORAGE, JSON.stringify(record));
    return true;
  } catch {
    return false;
  }
}

export function hasStoredKey() {
  return Boolean(readStoredKey());
}

// Returns the freelancer's keypair, creating and saving one on first use.
// If localStorage is unavailable the key lives only for this page load.
let memoryKey = null;
export async function getOrCreateKeyPair() {
  const existing = readStoredKey() || memoryKey;
  if (existing) return existing;
  const pair = await crypto.subtle.generateKey(CURVE, true, ['deriveBits']);
  const privateJwk = await crypto.subtle.exportKey('jwk', pair.privateKey);
  const publicJwk = await crypto.subtle.exportKey('jwk', pair.publicKey);
  const record = { privateJwk, publicKey: jwkToPublicRaw(publicJwk) };
  memoryKey = record;
  storeKey(record);
  return record;
}

// Output is one base64url string: 0x02 | ephemeral public key (65) | iv (12) | ciphertext.
// The KDF is bound to both public keys and the header is authenticated (AAD), so a
// blob can't be re-pointed at another key or version. The plaintext is deflated
// first, since ciphertext can't be compressed afterwards.
export async function encryptAnswers(freelancerPublicKey, data) {
  const ephemeral = await crypto.subtle.generateKey(CURVE, true, ['deriveBits']);
  const epk = b64uToBytes(jwkToPublicRaw(await crypto.subtle.exportKey('jwk', ephemeral.publicKey)));
  const info = concat(enc8.encode('briefsnap-answers-v2'), epk, b64uToBytes(freelancerPublicKey));
  const aesKey = await deriveAesKey(ephemeral.privateKey, await importPublicRaw(freelancerPublicKey), 'encrypt', info);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const header = concat(Uint8Array.of(V2), epk);
  const packed = await packBytes(enc8.encode(JSON.stringify(data)));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: header }, aesKey, packed));
  return bytesToB64u(concat(header, iv, ct));
}

// Throws NO_KEY (no key on this device), WRONG_KEY (not encrypted for this key) or
// BAD_DATA (decrypts, but isn't a valid answers payload). Anyone holding the public
// questionnaire link can produce a valid ciphertext, so the payload is untrusted.
export async function decryptAnswers(enc) {
  const record = readStoredKey() || memoryKey;
  if (!record) throw new Error('NO_KEY');
  let data;
  try {
    const bytes = b64uToBytes(enc);
    const v2 = bytes[0] === V2;
    const o = v2 ? 1 : 0; // v1 (legacy links) has no format byte and no AAD
    const epkBytes = bytes.slice(o, o + 65);
    const iv = bytes.slice(o + 65, o + 77);
    const ct = bytes.slice(o + 77);
    const info = v2
      ? concat(enc8.encode('briefsnap-answers-v2'), epkBytes, b64uToBytes(record.publicKey))
      : enc8.encode('briefsnap-answers-v1');
    const privateKey = await crypto.subtle.importKey('jwk', record.privateJwk, CURVE, false, ['deriveBits']);
    const aesKey = await deriveAesKey(privateKey, await importPublicRaw(bytesToB64u(epkBytes)), 'decrypt', info);
    const params = { name: 'AES-GCM', iv };
    if (v2) params.additionalData = bytes.slice(0, o + 65);
    const packed = new Uint8Array(await crypto.subtle.decrypt(params, aesKey, ct));
    data = JSON.parse(new TextDecoder().decode(await unpackBytes(packed)));
  } catch {
    throw new Error('WRONG_KEY');
  }
  const plain = (v) => v && typeof v === 'object' && !Array.isArray(v);
  if (!plain(data) || !Array.isArray(data.questions) || !plain(data.answers) || typeof data.niche !== 'string') {
    throw new Error('BAD_DATA');
  }
  return data;
}

// The encrypted-file alternative to a link: same ciphertext, no URL involved.
export function answersFileContents(enc) {
  return JSON.stringify({ briefsnapAnswers: 1, enc });
}

export function parseAnswersFile(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = null;
  }
  if (!parsed || parsed.briefsnapAnswers !== 1 || typeof parsed.enc !== 'string') {
    throw new Error('BAD_FILE');
  }
  return { v: 2, type: 'answers', enc: parsed.enc };
}

// Plain-English text for the errors above, shared by every place answers are opened.
export function answersErrorMessage(err) {
  switch (err.message) {
    case 'NO_KEY':
      return 'These answers are encrypted and there is no key on this device. Restore your key backup first.';
    case 'WRONG_KEY':
      return 'These answers were not encrypted for the key on this device. Restore the key backup that matches the questionnaire you sent.';
    case 'BAD_DATA':
      return 'These answers decrypted but are not in a format BriefSnap understands.';
    case 'BAD_FILE':
      return 'That is not a BriefSnap answers file.';
    default:
      return 'That does not look like a valid link. Paste the full URL your client sent back.';
  }
}

export async function exportKeyBackup() {
  const record = await getOrCreateKeyPair();
  return JSON.stringify({ briefsnapKey: 1, privateJwk: record.privateJwk }, null, 2);
}

export function importKeyBackup(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('That file is not a BriefSnap key backup.');
  }
  const jwk = parsed && parsed.briefsnapKey === 1 ? parsed.privateJwk : null;
  if (!jwk || jwk.kty !== 'EC' || jwk.crv !== 'P-256' || !jwk.d || !jwk.x || !jwk.y) {
    throw new Error('That file is not a BriefSnap key backup.');
  }
  const record = { privateJwk: jwk, publicKey: jwkToPublicRaw(jwk) };
  memoryKey = record;
  storeKey(record);
}

// Accepts a decoded answers link (encrypted or legacy plaintext) and returns
// the plain answers state, or throws NO_KEY / WRONG_KEY.
export async function resolveAnswersState(state) {
  if (!state.enc) return state;
  const data = await decryptAnswers(state.enc);
  return { v: 1, type: 'answers', ...data };
}
