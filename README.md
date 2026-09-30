# BriefSnap

BriefSnap is an AI-powered client onboarding tool for freelancers. It generates a
tailored intake questionnaire for your niche, sends it to a client as a shareable
link, and turns their answers into a polished, structured project brief — using
your own AI API key. There is no backend and no database: the entire app is a
static single-page site that runs in your browser.

## Why the source is public

BriefSnap is sold as a hosted, one-time-purchase product, but the source is
public here for transparency. The app has no server, so it is architecturally
incapable of storing or forwarding your API key anywhere — every request goes
directly from your browser to the AI provider you choose. You don't have to
take that on faith: read [`src/lib/apiRouter.js`](src/lib/apiRouter.js) and
[`src/components/Setup.jsx`](src/components/Setup.jsx) yourself to verify that
the key lives only in React state for the duration of your session and is
never logged, persisted, or sent anywhere but the provider's own API.

## How client answers are protected

- Your questionnaire link carries only your **public** key. The matching private
  key is created in your browser and stays on your device (see
  [`src/lib/crypto.js`](src/lib/crypto.js)).
- When a client submits, their browser encrypts the answers (ECDH P-256 +
  AES-GCM) before a link is ever shown. The link they send back is ciphertext;
  anyone who intercepts it, or sees it in chat previews or browser history,
  cannot read it.
- Clients can also download the same ciphertext as an encrypted `.briefsnap` file
  and send that instead of a link, for people who want answers kept out of URLs.
  You open it from the "Already have client answers?" card.
- The ciphertext binds both public keys and the format version into the key
  derivation and authentication, and the app opens the answers link with its
  address-bar copy removed so ciphertext doesn't linger in history.
- The production build ships a strict Content-Security-Policy that only allows
  connections to the supported AI providers, and sends no referrer.
- Answers decrypt but are still untrusted input: anyone with your questionnaire
  link can submit. They are shown as plain text, and shape-checked before use.
- When you open the link, your browser decrypts it locally. If you then use AI
  to write the brief, the decrypted answers go straight from your browser to the
  AI provider you chose, using your own API key. BriefSnap never sees them.
- Back up your key from the first screen. Without it, encrypted answers cannot
  be opened by anyone.
- Known limits: the private key sits in this browser's storage (and in the backup
  file, unencrypted, so store it privately); anyone with access to your device
  or a malicious browser extension could read it. Client answers are also sent
  to your chosen AI provider when you generate a brief, under that provider's
  terms.
- Link shortening is offered only for the questionnaire link (questions and a
  public key), never for links that contain answers or briefs.

## Get BriefSnap

This repository is published for source-code transparency and security
auditing — not as a self-hosting guide. BriefSnap is available as a hosted
product for a one-time purchase.

## License

See [LICENSE](LICENSE). This code is source-available for reading and
auditing only. Running, deploying, copying, modifying, or redistributing the
Software — including self-hosting it as a free alternative to purchasing
BriefSnap — requires a separate written license from the copyright holder.
