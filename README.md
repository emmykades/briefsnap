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

## Get BriefSnap

This repository is published for source-code transparency and security
auditing — not as a self-hosting guide. BriefSnap is available as a hosted
product for a one-time purchase.

## License

See [LICENSE](LICENSE). This code is source-available for reading and
auditing only. Running, deploying, copying, modifying, or redistributing the
Software — including self-hosting it as a free alternative to purchasing
BriefSnap — requires a separate written license from the copyright holder.
