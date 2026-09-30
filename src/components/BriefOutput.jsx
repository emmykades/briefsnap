import { useMemo, useRef, useState } from 'react';
import { sendMessage } from '../lib/apiRouter';
import { briefSystemPrompt, kickoffAgendaPrompt } from '../lib/prompts';
import { BRIEF_SECTIONS, splitSections, formatAnswer, slugify, stripMarkdownBold } from '../lib/brief';
import { buildShareUrl } from '../lib/hashEncoder';
import { downloadTextFile } from '../lib/download';
import { DEFAULT_THEME_ID } from '../lib/themes';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import ConnectionFix from './ConnectionFix';
import QuickLinksNav from './QuickLinksNav';
import ThemePicker from './ThemePicker';
import FloatingShareButton from './FloatingShareButton';
import { PencilIcon, ChevronUpIcon, ChevronDownIcon, TrashIcon } from './icons';

function formatQA(questions, answers) {
  return questions
    .map((q, i) => `${i + 1}. ${q.question}\nAnswer: ${formatAnswer(answers[q.id]) || '(no answer provided)'}`)
    .join('\n\n');
}

const DEFAULT_BRIEF_INTRO = 'Shared with you by your freelancer via BriefSnap.';

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
  const [briefShareLink, setBriefShareLink] = useState('');
  const [briefLinkCopied, setBriefLinkCopied] = useState(false);

  // Single list driving everything section-related: which standard sections get
  // asked for (checkbox), their order, any custom sections the freelancer defined,
  // and what ends up in the preview and the share link. Custom sections carry a
  // description (what the AI should write) rather than typed-out content — the AI
  // generates their body the same way it does the standard sections. Regenerating
  // updates bodies in place instead of replacing this list, so reordering/custom
  // sections survive it.
  const [briefSections, setBriefSections] = useState(() =>
    BRIEF_SECTIONS.map((s, i) => ({ key: `std-${i}`, title: s.title, body: '', included: true, custom: false }))
  );
  const [editingSectionKey, setEditingSectionKey] = useState(null);
  const [sectionDraft, setSectionDraft] = useState({ title: '', description: '' });
  const customSectionIdRef = useRef(0);

  const defaultBriefTitle = `${niche} — Project Brief`;

  const formattedQA = useMemo(() => formatQA(questions, answers), [questions, answers]);
  // The sections that actually have content and are switched on — used for the
  // live preview, the quick-links nav, and the assembled share link alike.
  const visibleSections = useMemo(
    () => briefSections.filter((s) => (s.custom || s.included) && s.body.trim()),
    [briefSections]
  );

  function toggleSectionIncluded(key) {
    setBriefSections((prev) => prev.map((s) => (s.key === key ? { ...s, included: !s.included } : s)));
  }

  function moveSection(index, direction) {
    setBriefSections((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function addCustomSection() {
    const key = `custom-${customSectionIdRef.current++}`;
    setBriefSections((prev) => [...prev, { key, title: '', description: '', body: '', included: true, custom: true }]);
    setSectionDraft({ title: '', description: '' });
    setEditingSectionKey(key);
  }

  function startEditSection(section) {
    setSectionDraft({ title: section.title, description: section.description });
    setEditingSectionKey(section.key);
  }

  function saveSectionEdit() {
    const title = sectionDraft.title.trim();
    const description = sectionDraft.description.trim();
    if (!title || !description) return;
    // the old body was written for the previous description — clear it so a stale
    // section doesn't linger in the preview/link until the brief is regenerated
    setBriefSections((prev) =>
      prev.map((s) => (s.key === editingSectionKey ? { ...s, title, description, body: '' } : s))
    );
    setEditingSectionKey(null);
  }

  function cancelSectionEdit() {
    // a brand-new custom section that was never saved shouldn't leave a blank row behind
    setBriefSections((prev) => prev.filter((s) => !(s.key === editingSectionKey && s.custom && !s.description)));
    setEditingSectionKey(null);
  }

  function removeSection(key) {
    setBriefSections((prev) => prev.filter((s) => s.key !== key));
    if (editingSectionKey === key) setEditingSectionKey(null);
  }

  const quickLinks = useMemo(() => {
    const items = [{ id: 'client-answers', label: 'Client Answers' }];
    if (briefStatus === 'success') {
      items.push({ id: 'client-brief', label: 'Client Brief' });
      visibleSections.forEach((section, i) => {
        if (section.title) {
          items.push({ id: `section-${slugify(section.title)}`, label: section.title, indent: true });
        } else if (visibleSections.length === 1) {
          // untitled single-blob brief still deserves an anchor
          items.push({ id: `section-${i}`, label: 'Brief', indent: true });
        }
      });
    }
    if (agendaStatus === 'success') {
      items.push({ id: 'kickoff-agenda', label: 'Kickoff Agenda' });
    }
    return items;
  }, [briefStatus, agendaStatus, visibleSections]);

  // Sections to actually ask the AI for: checked standard ones (using their fixed
  // description) plus any custom ones that have a title and description set.
  function sectionsToGenerate() {
    return briefSections
      .filter((s) => (s.custom ? s.title.trim() && s.description.trim() : s.included))
      .map((s) => ({
        title: s.title,
        description: s.custom ? s.description : BRIEF_SECTIONS.find((b) => b.title === s.title)?.description || '',
      }));
  }

  async function generateBrief() {
    setBriefStatus('loading');
    setBriefError('');
    setEditingBrief(false);
    const requestedSections = sectionsToGenerate();
    const customTitles = briefSections.filter((s) => s.custom).map((s) => s.title);
    try {
      const reply = await sendMessage({
        provider: config.provider,
        model: config.model,
        apiKey: config.apiKey,
        messages: [{ role: 'system', content: briefSystemPrompt(niche, formattedQA, requestedSections) }],
      });
      setBriefText(reply);
      const parsed = splitSections(reply, customTitles);
      setBriefSections((prev) =>
        prev.map((s) => {
          const match = parsed.find((p) => p.title && p.title.toLowerCase() === s.title.toLowerCase());
          return { ...s, body: match ? match.body : '' };
        })
      );
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
      setAgendaText(stripMarkdownBold(reply));
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
    const customTitles = briefSections.filter((s) => s.custom).map((s) => s.title);
    const parsed = splitSections(briefDraft, customTitles);
    setBriefSections((prev) =>
      prev.map((s) => {
        const match = parsed.find((p) => p.title && p.title.toLowerCase() === s.title.toLowerCase());
        return { ...s, body: match ? match.body : '' };
      })
    );
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
    const finalBriefText = visibleSections.length
      ? visibleSections.map((s) => (s.title ? `${s.title}\n${s.body}` : s.body)).join('\n\n')
      : briefText;
    const shareUrl = await buildShareUrl({
      v: 1,
      type: 'brief',
      niche,
      briefText: finalBriefText,
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
    setBriefShareLink(shareUrl);
    onCopyToast("Link copied. Send this to your client — they don't need an account.");
  }

  async function handleCopyBriefLink() {
    try {
      await navigator.clipboard.writeText(briefShareLink);
      setBriefLinkCopied(true);
      setTimeout(() => setBriefLinkCopied(false), 2000);
    } catch {
      // clipboard may be unavailable; the URL is still visible for manual copy
    }
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
    downloadTextFile(`${safeFilenamePart(niche)}-client-answers-${date}.txt`, formattedQA);
  }

  function downloadBrief() {
    const date = new Date().toISOString().slice(0, 10);
    downloadTextFile(`${safeFilenamePart(niche)}-project-brief-${date}.txt`, briefText);
  }

  return (
    <div className="w-full max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-8 items-start">
      <div className="w-full max-w-2xl flex flex-col gap-8">
        <div id="client-answers" className="card flex flex-col gap-4">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-normal text-ink">Review client answers</h2>
            <p className="mt-1 text-sm text-muted">Check the responses below before generating the brief.</p>
          </div>
          <div className="overflow-hidden rounded-lg border border-line bg-canvas">
            <table className="w-full text-sm text-left">
              <tbody className="divide-y divide-line">
                {questions.map((q, i) => (
                  <tr key={q.id || i}>
                    <td className="p-3.5 align-top font-medium text-ink w-1/2">{q.question}</td>
                    <td className="p-3.5 align-top text-ink">
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
                          <div>
                            <span className="whitespace-pre-wrap">{formatAnswer(answers[q.id]) || '—'}</span>
                          {answers[`${q.id}__extra`] && (
                            <span className="block mt-1 text-xs text-muted whitespace-pre-wrap">
                              Client's own details: {answers[`${q.id}__extra`]}
                            </span>
                          )}
                          </div>
                          <button
                            type="button"
                            onClick={() => startEditAnswer(q.id)}
                            title="Edit answer"
                            className="flex-none text-muted hover:text-accent transition"
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
          <div className="border-t border-line pt-4 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={downloadAnswers} className="btn-secondary">
              Download answers
            </button>
            {briefStatus === 'idle' && (
              <button
                type="button"
                onClick={generateBrief}
                disabled={sectionsToGenerate().length === 0}
                className="btn-primary"
              >
                Generate project brief
              </button>
            )}
          </div>
        </div>

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
            <div className="card flex flex-col gap-4">
              <h2 id="client-brief" className="text-3xl sm:text-4xl font-normal text-ink text-center">
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
                    {visibleSections.map((section, i) => (
                      <div
                        key={section.key}
                        id={`section-${section.title ? slugify(section.title) : i}`}
                        className="card border-l-2 border-l-accent py-4 sm:py-5"
                      >
                        {section.title && <h3 className="text-2xl font-normal text-ink mb-1">{section.title}</h3>}
                        <p className="text-sm text-ink whitespace-pre-wrap leading-relaxed">{section.body}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-line pt-4 flex flex-col gap-3">
                    <h3 className="text-3xl font-normal text-ink text-center">Customize this brief</h3>

                    <div className="flex flex-col gap-2">
                      <span className="field-label">Brief sections (reorder, uncheck, or edit — then regenerate or share)</span>
                      <div className="flex flex-col gap-1.5">
                        {briefSections.map((s, i) =>
                          editingSectionKey === s.key ? (
                            <div key={s.key} className="card py-3 flex flex-col gap-2">
                              <input
                                type="text"
                                value={sectionDraft.title}
                                onChange={(e) => setSectionDraft((d) => ({ ...d, title: e.target.value }))}
                                placeholder="Section title"
                                className="field-input"
                              />
                              <textarea
                                rows={2}
                                value={sectionDraft.description}
                                onChange={(e) => setSectionDraft((d) => ({ ...d, description: e.target.value }))}
                                placeholder="Describe what you want the AI to write in this section"
                                autoFocus
                                className="field-input"
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={cancelSectionEdit}
                                  className="btn-secondary px-2.5 py-1 text-xs"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={saveSectionEdit}
                                  disabled={!sectionDraft.title.trim() || !sectionDraft.description.trim()}
                                  className="btn-primary px-2.5 py-1 text-xs"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div
                              key={s.key}
                              className="flex items-center justify-between gap-2 text-sm text-ink rounded-md border border-line bg-surface px-3 py-2"
                            >
                              <span className="flex items-center gap-2 min-w-0">
                                {!s.custom && (
                                  <input
                                    type="checkbox"
                                    checked={s.included}
                                    onChange={() => toggleSectionIncluded(s.key)}
                                    className="text-accent focus:ring-accent/60 flex-none"
                                  />
                                )}
                                <span className="flex flex-col min-w-0">
                                  <span className="flex items-center gap-1.5">
                                    <span className="truncate">{s.title || 'Untitled section'}</span>
                                    {s.custom && <span className="flex-none text-xs text-muted">(custom)</span>}
                                  </span>
                                  {s.custom && s.description && (
                                    <span className="truncate text-xs text-muted">{s.description}</span>
                                  )}
                                </span>
                              </span>
                              <div className="flex-none flex items-center gap-2">
                                <div className="flex flex-col -my-1">
                                  <button
                                    type="button"
                                    onClick={() => moveSection(i, -1)}
                                    disabled={i === 0}
                                    title="Move up"
                                    className="text-muted hover:text-accent transition disabled:opacity-20 disabled:hover:text-muted"
                                  >
                                    <ChevronUpIcon className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => moveSection(i, 1)}
                                    disabled={i === briefSections.length - 1}
                                    title="Move down"
                                    className="text-muted hover:text-accent transition disabled:opacity-20 disabled:hover:text-muted"
                                  >
                                    <ChevronDownIcon className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                {s.custom && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => startEditSection(s)}
                                      title="Edit section"
                                      className="text-muted hover:text-accent transition"
                                    >
                                      <PencilIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => removeSection(s.key)}
                                      title="Remove section"
                                      className="text-muted hover:text-red-600 transition"
                                    >
                                      <TrashIcon className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                      <button type="button" onClick={addCustomSection} className="btn-secondary self-start">
                        + Add custom section
                      </button>
                    </div>

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
                      <label className="flex items-center gap-2 text-sm text-ink">
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

                  <div className="border-t border-line pt-4 flex flex-wrap justify-center gap-3">
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
                    <button
                      type="button"
                      onClick={generateBrief}
                      disabled={sectionsToGenerate().length === 0}
                      className="btn-dark"
                    >
                      Regenerate brief
                    </button>
                    {agendaStatus === 'idle' && (
                      <button type="button" onClick={generateAgenda} className="btn-dark">
                        Generate kickoff call agenda
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            {agendaStatus === 'loading' && (
              <div className="card">
                <LoadingSpinner message="Generating kickoff call agenda..." />
              </div>
            )}
            {agendaStatus === 'error' && (
              <div className="flex flex-col gap-3">
                <ErrorMessage message={agendaError} onRetry={generateAgenda} />
                <ConnectionFix config={config} setConfig={setConfig} onFixed={generateAgenda} />
              </div>
            )}
            {agendaStatus === 'success' && (
              <div id="kickoff-agenda" className="card border-l-2 border-l-accent flex flex-col gap-3">
                <h3 className="text-2xl font-normal text-ink">Kickoff Call Agenda</h3>
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
                    <p className="text-sm text-ink whitespace-pre-wrap leading-relaxed">{agendaText}</p>
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

      {briefShareLink && (
        <div className="card flex flex-col gap-3">
          <div className="text-center">
            <h3 className="text-2xl sm:text-3xl font-normal text-ink">Shareable client brief link</h3>
            <p className="mt-1 text-sm text-muted">Send this to your client — they don't need an account.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              readOnly
              value={briefShareLink}
              onFocus={(e) => e.target.select()}
              className="field-input flex-1 text-ink"
              aria-label="Client brief link"
            />
            <button type="button" onClick={handleCopyBriefLink} className="btn-primary flex-none">
              {briefLinkCopied ? 'Copied!' : 'Copy link'}
            </button>
          </div>
        </div>
      )}

      {briefStatus === 'success' && (
        <FloatingShareButton onClick={handleCreateBriefLink}>Create shareable client brief link →</FloatingShareButton>
      )}
    </div>
  );
}
