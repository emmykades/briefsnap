import { CheckIcon } from './icons';

const POINTS = [
  {
    title: 'Answers are encrypted before they leave your client’s browser.',
    body: 'Your client link carries only a public key. The link they send back is unreadable ciphertext, so chat previews, browser history and screenshots reveal nothing. Prefer no link at all? Your client can send an encrypted file instead.',
  },
  {
    title: 'Only your device can open them.',
    body: 'The private key is created in your browser and never leaves it. We can’t read your clients’ answers, and neither can anyone else. Back the key up on this page.',
  },
  {
    title: 'Your AI key goes straight to your AI provider.',
    body: 'BriefSnap has no server. When you generate a brief, your browser sends the decrypted answers directly to the provider you chose, using your own key. We never see either one.',
  },
  {
    title: 'You can check all of this.',
    body: 'The source is public, so anyone can read how the keys and links work.',
  },
];

export default function PrivacyCard({ sourceUrl }) {
  return (
    <div className="card flex flex-col gap-4 p-6 sm:p-8">
      <h2 className="text-3xl sm:text-4xl font-normal text-ink text-center">Your clients’ answers stay private</h2>
      <ul className="flex flex-col gap-3">
        {POINTS.map((p) => (
          <li key={p.title} className="flex items-start gap-2.5">
            <CheckIcon className="w-4 h-4 flex-none mt-1 text-emerald-700" />
            <p className="text-sm text-muted">
              <span className="font-medium text-ink">{p.title}</span> {p.body}
              {p.title.startsWith('You can check') && sourceUrl && (
                <>
                  {' '}
                  <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="text-ink underline hover:text-accent">
                    Read the source
                  </a>
                  .
                </>
              )}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
