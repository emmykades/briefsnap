// Deflate helpers used to keep share links short. First byte marks the format
// (1 = deflate-raw, 0 = uncompressed) so browsers without CompressionStream
// still produce links that every browser can read.
async function run(stream, bytes) {
  const out = new Blob([bytes]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(out).arrayBuffer());
}

export async function packBytes(bytes) {
  if (typeof CompressionStream === 'function') {
    try {
      const z = await run(new CompressionStream('deflate-raw'), bytes);
      if (z.length < bytes.length) return Uint8Array.from([1, ...z]);
    } catch {
      // fall through to uncompressed
    }
  }
  return Uint8Array.from([0, ...bytes]);
}

export async function unpackBytes(packed) {
  const body = packed.slice(1);
  if (packed[0] === 0) return body;
  return run(new DecompressionStream('deflate-raw'), body);
}

export function bytesToB64u(bytes) {
  let bin = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function b64uToBytes(str) {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}
