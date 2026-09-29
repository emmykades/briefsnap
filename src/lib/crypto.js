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
const HKDF_INFO = new TextEncoder().encode('briefsnap-answers-v1');

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

async function deriveAesKey(privateKey, publicKey, usage) {
  const bits = await crypto.subtle.deriveBits({ name: 'ECDH', public: publicKey }, privateKey, 256);
  const hkdfKey = await crypto.subtle.importKey('raw', bits, 'HKDF', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info: HKDF_INFO },
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

// Output is one base64url string: ephemeral public key (65 bytes) | iv (12) | ciphertext.
// The plaintext is deflated first, since ciphertext can't be compressed afterwards.
export async function encryptAnswers(freelancerPublicKey, data) {
  const ephemeral = await crypto.subtle.generateKey(CURVE, true, ['deriveBits']);
  const epk = b64uToBytes(jwkToPublicRaw(await crypto.subtle.exportKey('jwk', ephemeral.publicKey)));
  const aesKey = await deriveAesKey(ephemeral.privateKey, await importPublicRaw(freelancerPublicKey), 'encrypt');
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const packed = await packBytes(new TextEncoder().encode(JSON.stringify(data)));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, packed));
  const out = new Uint8Array(epk.length + iv.length + ct.length);
  out.set(epk, 0);
  out.set(iv, epk.length);
  out.set(ct, epk.length + iv.length);
  return bytesToB64u(out);
}

// Throws if there is no key on this device, or the key doesn't match the link.
export async function decryptAnswers(enc) {
  const record = readStoredKey() || memoryKey;
  if (!record) throw new Error('NO_KEY');
  try {
    const bytes = b64uToBytes(enc);
    const epk = bytesToB64u(bytes.slice(0, 65));
    const iv = bytes.slice(65, 77);
    const ct = bytes.slice(77);
    const privateKey = await crypto.subtle.importKey('jwk', record.privateJwk, CURVE, false, ['deriveBits']);
    const aesKey = await deriveAesKey(privateKey, await importPublicRaw(epk), 'decrypt');
    const packed = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, aesKey, ct));
    return JSON.parse(new TextDecoder().decode(await unpackBytes(packed)));
  } catch {
    throw new Error('WRONG_KEY');
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
