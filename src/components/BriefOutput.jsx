import { useMemo, useState } from 'react';
import { sendMessage } from '../lib/apiRouter';
import { briefSystemPrompt, kickoffAgendaPrompt } from '../lib/prompts';
import { splitSections, formatAnswer, slugify } from '../lib/brief';
import { buildShareUrl } from '../lib/hashEncoder';
import { DEFAULT_THEME_ID } from '../lib/themes';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import ConnectionFix from './ConnectionFix';
import QuickLinksNav from './QuickLinksNav';
import ThemePicker from './ThemePicker';
import FloatingShareButton from './FloatingShareButton';
import { PencilIcon } from './icons';

function formatQA(questions, answers) {
  return questions
    .map((q, i) => `${i + 1}. ${q.question}\nAnswer: ${formatAnswer(answers[q.id]) || '(no answer provided)'}`)
    .join('\n\n');
}

const DEFAULT_BRIEF_INTRO = 'Shared with you by your freelancer via BriefSnap.';

function triggerDownload(filename, text) {
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function BriefOutput({ config, setConfig, niche, questions, answers, theme, setAnswersState, onCopyToast }) {
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [answerDraft, setAnswerDraft] = useState('');

  const [briefStatus, setBriefStatus] = useState('idle'); // idle | loading | success | error
  const [briefText, setBriefText] = useState('');
  const [briefError, setBriefError] = useState('');
  const [editingBrief, setEditingBrief] = useState(false);
  const [briefDraft, setBriefDraft] = useState('');

  const [agendaStatus, setAgendaStatus] = useState('idle');
  const [agendaText, setAgendaText] = useState('');
  const [agendaError, setAgendaError] = useState('');
  const [editingAgenda, setEditingAgenda] = useState(false);
  const [agendaDraft, setAgendaDraft] = useState('');

  const [briefLinkTitle, setBriefLinkTitle] = useState('');
  const [briefLinkIntro, setBriefLinkIntro] = useState('');
  const [briefLinkTheme, setBriefLinkTheme] = useState(theme || DEFAULT_THEME_ID);
  const [includeAgenda, setIncludeAgenda] = useState(true);

  const defaultBriefTitle = `${niche} — Project Brief`;

  const formattedQA = useMemo(() => formatQA(questions, answers), [questions, answers]);
  const sections = useMemo(() => (briefText ? splitSections(briefText) : []), [briefText]);

  const quickLinks = useMemo(() => {
    const items = [{ id: 'client-answers', label: 'Client Answers' }];
    if (briefStatus === 'success') {
      items.push({ id: 'client-brief', label: 'Client Brief' });
      sections.forEach((section, i) => {
        if (section.title) {
          items.push({ id: `section-${slugify(section.title)}`, label: section.title, indent: true });
        } else if (sections.length === 1) {
          // untitled single-blob brief still deserves an anchor
          items.push({ id: `section-${i}`, label: 'Brief', indent: true });
        }
      });
    }
    if (agendaStatus === 'success') {
      items.push({ id: 'kickoff-agenda', label: 'Kickoff Agenda' });
    }
    return items;
  }, [briefStatus, agendaStatus, sections]);

  async function generateBrief() {
    setBriefStatus('loading');
    setBriefError('');
    setEditingBrief(false);
    try {
      const reply = await sendMessage({
        provider: config.provider,
        model: config.model,
        apiKey: config.apiKey,
        messages: [{ role: 'system', content: briefSystemPrompt(niche, formattedQA) }],
      });
      setBriefText(reply);
      setBriefStatus('success');
    } catch (err) {
      setBriefError(err.message || 'Something went wrong.');
      setBriefStatus('error');
    }
  }

  async function generateAgenda() {
    setAgendaStatus('loading');
    setAgendaError('');
    setEditingAgenda(false);
    try {
      const reply = await sendMessage({
        provider: config.provider,
        model: config.model,
        apiKey: config.apiKey,
        messages: [{ role: 'user', content: kickoffAgendaPrompt(briefText) }],
      });
      setAgendaText(reply);
      setAgendaStatus('success');
    } catch (err) {
      setAgendaError(err.message || 'Something went wrong.');
      setAgendaStatus('error');
    }
  }

  function startEditAnswer(qId) {
    setAnswerDraft(formatAnswer(answers[qId]));
    setEditingAnswerId(qId);
  }

  function saveAnswerEdit(qId) {
    setAnswersState((prev) => ({ ...prev, answers: { ...prev.answers, [qId]: answerDraft } }));
    setEditingAnswerId(null);
  }

  function startEditBrief() {
    setBriefDraft(briefText);
    setEditingBrief(true);
  }

  function saveBriefEdit() {
    setBriefText(briefDraft);
    setEditingBrief(false);
  }

  function startEditAgenda() {
    setAgendaDraft(agendaText);
    setEditingAgenda(true);
  }

  function saveAgendaEdit() {
    setAgendaText(agendaDraft);
    setEditingAgenda(false);
  }

  async function handleCreateBriefLink() {
    const shareUrl = buildShareUrl({
      v: 1,
      type: 'brief',
      niche,
      briefText,
      briefTitle: briefLinkTitle.trim() || defaultBriefTitle,
      briefIntro: briefLinkIntro.trim() || DEFAULT_BRIEF_INTRO,
      theme: briefLinkTheme,
      ...(includeAgenda && agendaStatus === 'success' ? { agendaText } : {}),
    });
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // clipboard may be unavailable; onCopyToast still confirms the link was generated
    }
    onCopyToast("Link copied. Send this to your client — they don't need an account.");
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      onCopyToast('Copied to clipboard');
    } catch {
      onCopyToast('Could not copy — select and copy manually');
    }
  }

  function safeFilenamePart(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  function downloadAnswers() {
    const date = new Date().toISOString().slice(0, 10);
    triggerDownload(`${safeFilenamePart(niche)}-client-answers-${date}.txt`, formattedQA);
  }

  function downloadBrief() {
    const date = new Date().toISOString().slice(0, 10);
    triggerDownload(`${safeFilenamePart(niche)}-project-brief-${date}.txt`, briefText);
  }

  return (
    <div className="w-full max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-8 items-start">
      <div className="w-full max-w-2xl flex flex-col gap-8">
        <div id="client-answers" className="flex flex-col gap-3">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-ink">Review client answers</h2>
            <p className="mt-1 text-sm text-slate-400">Check the responses below before generating the brief.</p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
            <table className="w-full text-sm text-left">
              <tbody className="divide-y divide-white/10">
                {questions.map((q, i) => (
                  <tr key={q.id || i}>
                    <td className="p-3.5 align-top font-medium text-ink w-1/2">{q.question}</td>
                    <td className="p-3.5 align-top text-slate-300">
                      {editingAnswerId === q.id ? (
                        <div className="flex flex-col gap-2">
                          <textarea
                            value={answerDraft}
                            onChange={(e) => setAnswerDraft(e.target.value)}
                            rows={2}
                            autoFocus
                            className="field-input text-sm"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingAnswerId(null)}
                              className="btn-secondary px-2.5 py-1 text-xs"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => saveAnswerEdit(q.id)}
                              className="btn-primary px-2.5 py-1 text-xs"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-2">
                          <span className="whitespace-pre-wrap">{formatAnswer(answers[q.id]) || '—'}</span>
                          <button
                            type="button"
                            onClick={() => startEditAnswer(q.id)}
                            title="Edit answer"
                            className="flex-none text-slate-500 hover:text-accent2 transition"
                          >
                            <PencilIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" onClick={downloadAnswers} className="btn-secondary self-center">
            Download answers
          </button>
        </div>

        {briefStatus === 'idle' && (
          <button type="button" onClick={generateBrief} className="btn-primary mx-auto">
            Generate project brief
          </button>
        )}

        {briefStatus === 'loading' && (
          <div className="card">
            <LoadingSpinner message="Building your brief..." />
          </div>
        )}
        {briefStatus === 'error' && (
          <div className="flex flex-col gap-3">
            <ErrorMessage message={briefError} onRetry={generateBrief} />
            <ConnectionFix config={config} setConfig={setConfig} onFixed={generateBrief} />
          </div>
        )}

        {briefStatus === 'success' && (
          <div className="flex flex-col gap-6">
            <h2 id="client-brief" className="text-xl font-semibold text-ink text-center">
              Client Brief
            </h2>

            {editingBrief ? (
              <div className="flex flex-col gap-3">
                <textarea
                  value={briefDraft}
                  onChange={(e) => setBriefDraft(e.target.value)}
                  rows={18}
                  className="field-input font-mono text-xs leading-relaxed"
                />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setEditingBrief(false)} className="btn-secondary px-3 py-1.5 text-xs">
                    Cancel
                  </button>
                  <button type="button" onClick={saveBriefEdit} className="btn-primary px-3 py-1.5 text-xs">
                    Save changes
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-4">
                  {sections.map((section, i) => (
                    <div
                      key={i}
                      id={`section-${section.title ? slugify(section.title) : i}`}
                      className="card border-l-2 border-l-accent py-4 sm:py-5"
                    >
                      {section.title && <h3 className="text-sm font-semibold text-ink mb-2">{section.title}</h3>}
                      <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{section.body}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                  <button type="button" onClick={() => copyText(briefText)} className="btn-secondary">
                    Copy brief
                  </button>
                  <button type="button" onClick={downloadBrief} className="btn-secondary">
                    Download as .txt
                  </button>
                  <button type="button" onClick={startEditBrief} className="btn-secondary">
                    <PencilIcon className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button type="button" onClick={generateBrief} className="btn-dark">
                    Regenerate brief
                  </button>
                </div>
              </>
            )}

            <div className="card flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-ink">Customize this shared brief</h3>

              <div>
                <label htmlFor="briefLinkTitle" className="field-label">
                  Title shown to your client (optional)
                </label>
                <input
                  id="briefLinkTitle"
                  type="text"
                  value={briefLinkTitle}
                  onChange={(e) => setBriefLinkTitle(e.target.value)}
                  placeholder={defaultBriefTitle}
                  className="field-input"
                />
              </div>
              <div>
                <label htmlFor="briefLinkIntro" className="field-label">
                  Intro message shown to your client (optional)
                </label>
                <textarea
                  id="briefLinkIntro"
                  rows={2}
                  value={briefLinkIntro}
                  onChange={(e) => setBriefLinkIntro(e.target.value)}
                  placeholder={DEFAULT_BRIEF_INTRO}
                  className="field-input"
                />
              </div>

              <ThemePicker value={briefLinkTheme} onChange={setBriefLinkTheme} />

              {agendaStatus === 'success' && (
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={includeAgenda}
                    onChange={(e) => setIncludeAgenda(e.target.checked)}
                    className="text-accent focus:ring-accent/60"
                  />
                  Include the kickoff call agenda in this link
                </label>
              )}
            </div>

            {agendaStatus === 'idle' && (
              <button type="button" onClick={generateAgenda} className="btn-dark mx-auto">
                Generate kickoff agenda
              </button>
            )}
            {agendaStatus === 'loading' && (
              <div className="card">
                <LoadingSpinner message="Generating kickoff agenda..." />
              </div>
            )}
            {agendaStatus === 'error' && (
              <div className="flex flex-col gap-3">
                <ErrorMessage message={agendaError} onRetry={generateAgenda} />
                <ConnectionFix config={config} setConfig={setConfig} onFixed={generateAgenda} />
              </div>
            )}
            {agendaStatus === 'success' && (
              <div id="kickoff-agenda" className="card border-l-2 border-l-accent2 flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-ink">Kickoff Call Agenda</h3>
                {editingAgenda ? (
                  <>
                    <textarea
                      value={agendaDraft}
                      onChange={(e) => setAgendaDraft(e.target.value)}
                      rows={10}
                      className="field-input text-xs leading-relaxed"
                    />
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setEditingAgenda(false)} className="btn-secondary px-3 py-1.5 text-xs">
                        Cancel
                      </button>
                      <button type="button" onClick={saveAgendaEdit} className="btn-primary px-3 py-1.5 text-xs">
                        Save changes
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{agendaText}</p>
                    <div className="flex flex-wrap gap-2 self-start">
                      <button type="button" onClick={() => copyText(agendaText)} className="btn-secondary">
                        Copy agenda
                      </button>
                      <button type="button" onClick={startEditAgenda} className="btn-secondary">
                        <PencilIcon className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button type="button" onClick={generateAgenda} className="btn-dark">
                        Regenerate
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <QuickLinksNav items={quickLinks} />

      {briefStatus === 'success' && (
        <FloatingShareButton onClick={handleCreateBriefLink}>Create shareable client link →</FloatingShareButton>
      )}
    </div>
  );
}
