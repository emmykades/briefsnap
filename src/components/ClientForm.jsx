import { useMemo, useState } from 'react';
import { buildShareUrl } from '../lib/hashEncoder';
import { getTheme, themeGradientText, themePrimaryButtonStyle } from '../lib/themes';
import { CheckIcon } from './icons';

export default function ClientForm({ niche, questions, formTitle, formIntro, theme }) {
  const t = getTheme(theme);
  const title = formTitle?.trim() || `${niche} Project — Client Questionnaire`;
  const intro =
    formIntro?.trim() ||
    "Answer the questions below as completely as you can — it helps your freelancer scope the project accurately.";

  const [answers, setAnswers] = useState({});
  const [otherEnabled, setOtherEnabled] = useState({});
  const [otherText, setOtherText] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  function setAnswer(id, value) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function toggleCheckboxOption(id, opt) {
    setAnswers((prev) => {
      const current = Array.isArray(prev[id]) ? prev[id] : [];
      const next = current.includes(opt) ? current.filter((o) => o !== opt) : [...current, opt];
      return { ...prev, [id]: next };
    });
  }

  // Merges the "Other" free text into checkbox answers only at read time —
  // avoids keeping the array and the text field in sync while the user types.
  function getEffectiveAnswer(q) {
    if (q.type === 'checkboxes') {
      const base = Array.isArray(answers[q.id]) ? answers[q.id] : [];
      const otherVal = otherEnabled[q.id] ? (otherText[q.id] || '').trim() : '';
      return otherVal ? [...base, otherVal] : base;
    }
    return answers[q.id];
  }

  function isAnswered(q) {
    const value = getEffectiveAnswer(q);
    return Array.isArray(value) ? value.length > 0 : typeof value === 'string' && value.trim().length > 0;
  }

  const requiredQuestions = useMemo(() => questions.filter((q) => q.required), [questions]);
  const answeredRequiredCount = requiredQuestions.filter(isAnswered).length;
  const progressPct = requiredQuestions.length
    ? Math.round((answeredRequiredCount / requiredQuestions.length) * 100)
    : 100;
  const canSubmit = answeredRequiredCount === requiredQuestions.length;

  const shareUrl = useMemo(() => {
    if (!submitted) return '';
    const finalAnswers = {};
    questions.forEach((q) => {
      finalAnswers[q.id] = getEffectiveAnswer(q);
    });
    return buildShareUrl({ v: 1, type: 'answers', niche, questions, answers: finalAnswers, theme });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted, niche, questions, answers, otherEnabled, otherText, theme]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard may be unavailable; the URL is still visible for manual copy
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-lg w-full card text-center flex flex-col gap-4">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
            <CheckIcon className="w-6 h-6" />
          </span>
          <h1 className="text-2xl font-bold text-ink">Done!</h1>
          <p className="text-slate-400">Copy the link below and send it back to your freelancer.</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              onFocus={(e) => e.target.select()}
              className="field-input flex-1 text-slate-300"
              aria-label="Answers link"
            />
            <button type="button" onClick={handleCopy} className="btn-primary" style={themePrimaryButtonStyle(t)}>
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10 sm:py-14">
      <div className="max-w-2xl mx-auto flex flex-col gap-8">
        <div className="text-center">
          <h1
            className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent"
            style={themeGradientText(t)}
          >
            {title}
          </h1>
          <p className="mt-2 text-sm text-slate-400 whitespace-pre-wrap">{intro}</p>
          <div className="mt-5 h-2 bg-white/5 border border-white/10 rounded-full overflow-hidden" aria-hidden="true">
            <div
              className="h-full transition-all rounded-full"
              style={{ width: `${progressPct}%`, ...themeGradientText(t) }}
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-500">{progressPct}% of required questions answered</p>
        </div>

        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (canSubmit) setSubmitted(true);
          }}
        >
          {questions.map((q, i) => (
            <div key={q.id || i} className="card py-5">
              <label htmlFor={q.id} className="field-label">
                {i + 1}. {q.question} {q.required && <span className="text-red-400">*</span>}
              </label>
              {q.type === 'short_text' && (
                <input
                  id={q.id}
                  type="text"
                  placeholder={q.placeholder}
                  value={answers[q.id] || ''}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                  required={q.required}
                  className="field-input"
                />
              )}
              {q.type === 'long_text' && (
                <textarea
                  id={q.id}
                  placeholder={q.placeholder}
                  rows={3}
                  value={answers[q.id] || ''}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                  required={q.required}
                  className="field-input"
                />
              )}
              {q.type === 'multiple_choice' && Array.isArray(q.options) && (
                <div role="radiogroup" aria-labelledby={q.id} className="flex flex-col gap-2 mt-1">
                  {q.options.map((opt, oi) => (
                    <label
                      key={oi}
                      className="flex items-center gap-2 text-sm text-slate-300 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 cursor-pointer hover:bg-white/[0.06] transition"
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={opt}
                        checked={!otherEnabled[q.id] && answers[q.id] === opt}
                        onChange={() => {
                          setOtherEnabled((prev) => ({ ...prev, [q.id]: false }));
                          setAnswer(q.id, opt);
                        }}
                        required={q.required}
                        className="text-accent focus:ring-accent/60"
                        style={{ accentColor: t.accent }}
                      />
                      {opt}
                    </label>
                  ))}
                  <label className="flex items-center gap-2 text-sm text-slate-300 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 cursor-pointer hover:bg-white/[0.06] transition">
                    <input
                      type="radio"
                      name={q.id}
                      checked={Boolean(otherEnabled[q.id])}
                      onChange={() => {
                        setOtherEnabled((prev) => ({ ...prev, [q.id]: true }));
                        setAnswer(q.id, otherText[q.id] || '');
                      }}
                      className="text-accent focus:ring-accent/60"
                      style={{ accentColor: t.accent }}
                    />
                    Other
                  </label>
                  {otherEnabled[q.id] && (
                    <input
                      type="text"
                      placeholder="Please specify"
                      value={otherText[q.id] || ''}
                      onChange={(e) => {
                        setOtherText((prev) => ({ ...prev, [q.id]: e.target.value }));
                        setAnswer(q.id, e.target.value);
                      }}
                      required={q.required}
                      className="field-input"
                    />
                  )}
                </div>
              )}
              {q.type === 'checkboxes' && Array.isArray(q.options) && (
                <div className="flex flex-col gap-2 mt-1">
                  {q.options.map((opt, oi) => (
                    <label
                      key={oi}
                      className="flex items-center gap-2 text-sm text-slate-300 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 cursor-pointer hover:bg-white/[0.06] transition"
                    >
                      <input
                        type="checkbox"
                        checked={Array.isArray(answers[q.id]) && answers[q.id].includes(opt)}
                        onChange={() => toggleCheckboxOption(q.id, opt)}
                        className="text-accent focus:ring-accent/60"
                        style={{ accentColor: t.accent }}
                      />
                      {opt}
                    </label>
                  ))}
                  <label className="flex items-center gap-2 text-sm text-slate-300 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 cursor-pointer hover:bg-white/[0.06] transition">
                    <input
                      type="checkbox"
                      checked={Boolean(otherEnabled[q.id])}
                      onChange={(e) => setOtherEnabled((prev) => ({ ...prev, [q.id]: e.target.checked }))}
                      className="text-accent focus:ring-accent/60"
                      style={{ accentColor: t.accent }}
                    />
                    Other
                  </label>
                  {otherEnabled[q.id] && (
                    <input
                      type="text"
                      placeholder="Please specify"
                      value={otherText[q.id] || ''}
                      onChange={(e) => setOtherText((prev) => ({ ...prev, [q.id]: e.target.value }))}
                      className="field-input"
                    />
                  )}
                </div>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={!canSubmit}
            className="btn-primary self-center"
            style={themePrimaryButtonStyle(t)}
          >
            Submit answers
          </button>
        </form>
      </div>
    </div>
  );
}
