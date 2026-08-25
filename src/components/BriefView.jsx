import { useMemo, useState } from 'react';
import { splitSections } from '../lib/brief';
import { getTheme, themeTextStyle } from '../lib/themes';

export default function BriefView({ niche, briefText, agendaText, theme, title, intro }) {
  const t = getTheme(theme);
  const resolvedTitle = title?.trim() || `${niche} — Project Brief`;
  const resolvedIntro = intro?.trim() || 'Shared with you by your freelancer via BriefSnap.';
  const sections = useMemo(() => splitSections(briefText), [briefText]);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(briefText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard may be unavailable; the brief is still readable on the page
    }
  }

  return (
    <div className="min-h-screen px-4 py-10 sm:py-14">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-normal" style={themeTextStyle(t)}>
            {resolvedTitle}
          </h1>
          <p className="mt-2 text-sm text-muted whitespace-pre-wrap">{resolvedIntro}</p>
        </div>

        <div className="flex flex-col gap-4">
          {sections.map((section, i) => (
            <div key={i} className="card border-l-2 py-4 sm:py-5" style={{ borderLeftColor: t.accent }}>
              {section.title && <h3 className="text-2xl font-normal text-ink mb-1">{section.title}</h3>}
              <p className="text-sm text-ink whitespace-pre-wrap leading-relaxed">{section.body}</p>
            </div>
          ))}
        </div>

        <button type="button" onClick={handleCopy} className="btn-secondary self-center">
          {copied ? 'Copied!' : 'Copy brief'}
        </button>

        {agendaText && (
          <div className="card border-l-2 flex flex-col gap-3" style={{ borderLeftColor: t.accent }}>
            <h3 className="text-2xl font-normal text-ink">Kickoff Call Agenda</h3>
            <p className="text-sm text-ink whitespace-pre-wrap leading-relaxed">{agendaText}</p>
          </div>
        )}
      </div>
    </div>
  );
}
