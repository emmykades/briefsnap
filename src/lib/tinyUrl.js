// Optional TinyURL shortening for the long hash-encoded share links this app
// generates. Uses TinyURL's legacy api-create.php endpoint by opening it
// directly in a new tab, rather than fetching it: the endpoint doesn't send
// CORS headers, so a browser fetch() would be blocked (same is true of every
// other free, no-signup shortener we checked — is.gd/v.gd included), but a
// plain navigation isn't subject to CORS. That also means no API key or
// account is needed — the short link is returned as plain text on the page
// TinyURL opens, ready for the user to copy from there.

export function tinyUrlCreateLink(longUrl) {
  return `https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`;
}

// Copies the original long link to the clipboard and opens TinyURL in the same
// click, so the flow feels like one step. window.open is called synchronously
// (not awaited after the clipboard write) so browsers still treat it as a
// direct result of the click and don't block it as a popup.
export function copyAndOpenTinyUrlShortener(longUrl) {
  navigator.clipboard?.writeText(longUrl).catch(() => {
    // clipboard may be unavailable; the new tab still shows the short link
  });
  window.open(tinyUrlCreateLink(longUrl), '_blank', 'noopener,noreferrer');
}
