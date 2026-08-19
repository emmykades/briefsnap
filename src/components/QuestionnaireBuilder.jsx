import { useState } from 'react';
import { sendMessage } from '../lib/apiRouter';
import { questionnaireSystemPrompt } from '../lib/prompts';
import { buildShareUrl } from '../lib/hashEncoder';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import LoadAnswersCard from './LoadAnswersCard';
import QuestionCard from './QuestionCard';
import ThemePicker from './ThemePicker';
import FloatingShareButton from './FloatingShareButton';
import { DEFAULT_THEME_ID } from '../lib/themes';
import { SparkleIcon } from './icons';

function parseQuestionnaire(raw) {
  let text = raw.trim();
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) text = fenceMatch[1].trim();
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) throw new Error('Not an array');
  return parsed;
}

const DEFAULT_FORM_INTRO =
  "Answer the questions below as completely as you can — it helps your freelancer scope the project accurately.";

export default function QuestionnaireBuilder({ config, questions, setQuestions, options, setOptions, onShareLinkCopied, onLoadAnswers }) {
  const [status, setStatus] = useState(questions ? 'success' : 'idle'); // idle | loading | success | parse_error | error
  const [errorMessage, setErrorMessage] = useState('');
  const [newQuestionId, setNewQuestionId] = useState(null);

  const niche = config.niche === 'Other' ? config.customNiche : config.niche;
  const { count, additionalInfo, formTitle, formIntro, theme = DEFAULT_THEME_ID } = options;
  const defaultFormTitle = `${niche} Project — Client Questionnaire`;

  function updateOptions(patch) {
    setOptions((prev) => ({ ...prev, ...patch }));
  }

  function addQuestion() {
    const id = `q_manual_${Date.now()}`;
    setQuestions((prev) => [...prev, { id, question: '', type: 'short_text', required: false, placeholder: '' }]);
    setNewQuestionId(id);
  }

  function deleteQuestion(id) {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }

  function moveQuestion(index, direction) {
    setQuestions((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function generate() {
    setStatus('loading');
    setErrorMessage('');
    try {
      const safeCount = Math.min(25, Math.max(5, Number(count) || 12));
      const reply = await sendMessage({
        provider: config.provider,
        model: config.model,
        apiKey: config.apiKey,
        messages: [{ role: 'system', content: questionnaireSystemPrompt(niche, safeCount, additionalInfo) }],
      });
      try {
        const parsed = parseQuestionnaire(reply);
        setQuestions(parsed);
        setStatus('success');
      } catch {
        setStatus('parse_error');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Something went wrong.');
      setStatus('error');
    }
  }

  async function handleCreateLink() {
    const shareUrl = buildShareUrl({
      v: 1,
      type: 'questionnaire',
      niche,
      questions,
      formTitle: formTitle?.trim() || defaultFormTitle,
      formIntro: formIntro?.trim() || DEFAULT_FORM_INTRO,
      theme,
    });
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // clipboard may be unavailable; the link is still shown for manual copy below
    }
    onShareLinkCopied(shareUrl);
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-ink">Generate questionnaire</h2>
        <p className="mt-1 text-sm text-slate-400">
          for <span className="font-medium text-ink">{niche}</span> — {count} tailored intake questions.
        </p>
      </div>

      <div className="card flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-ink">Customize this questionnaire</h3>

        <div>
          <label htmlFor="questionCount" className="field-label">
            Number of questions <span className="text-slate-500 font-normal">(5–25)</span>
          </label>
          <input
            id="questionCount"
            type="number"
            min={5}
            max={25}
            value={count}
            onChange={(e) => updateOptions({ count: e.target.value })}
            className="field-input w-24"
          />
        </div>
        <div>
          <label htmlFor="additionalInfo" className="field-label">
            Additional info for the AI (optional)
          </label>
          <textarea
            id="additionalInfo"
            rows={2}
            value={additionalInfo}
            onChange={(e) => updateOptions({ additionalInfo: e.target.value })}
            placeholder="e.g. this is a rush project, skip budget questions, focus on scope and timeline..."
            className="field-input"
          />
        </div>

        <div className="border-t border-white/10 pt-3">
          <label htmlFor="formTitle" className="field-label">
            Title shown to your client (optional)
          </label>
          <input
            id="formTitle"
            type="text"
            value={formTitle}
            onChange={(e) => updateOptions({ formTitle: e.target.value })}
            placeholder={defaultFormTitle}
            className="field-input"
          />
        </div>
        <div>
          <label htmlFor="formIntro" className="field-label">
            Intro message shown to your client (optional)
          </label>
          <textarea
            id="formIntro"
            rows={2}
            value={formIntro}
            onChange={(e) => updateOptions({ formIntro: e.target.value })}
            placeholder={DEFAULT_FORM_INTRO}
            className="field-input"
          />
        </div>

        <ThemePicker value={theme} onChange={(id) => updateOptions({ theme: id })} />
      </div>

      {status === 'idle' && (
        <button type="button" onClick={generate} className="btn-primary mx-auto">
          Generate questionnaire for {niche}
        </button>
      )}

      {status === 'loading' && (
        <div className="card">
          <LoadingSpinner message="Generating your questionnaire..." />
        </div>
      )}

      {status === 'error' && <ErrorMessage message={errorMessage} onRetry={generate} />}

      {status === 'parse_error' && (
        <ErrorMessage
          message="The AI returned an unexpected format. Try regenerating or switch to a more capable model."
          onRetry={generate}
        />
      )}

      {status === 'success' && questions && (
        <>
          <ol className="flex flex-col gap-3">
            {questions.map((q, i) => (
              <QuestionCard
                key={q.id || i}
                index={i}
                question={q}
                forceEdit={q.id === newQuestionId}
                onSave={(updated) => setQuestions((prev) => prev.map((pq, idx) => (idx === i ? updated : pq)))}
                onDelete={() => deleteQuestion(q.id)}
                onMoveUp={() => moveQuestion(i, -1)}
                onMoveDown={() => moveQuestion(i, 1)}
                canMoveUp={i > 0}
                canMoveDown={i < questions.length - 1}
              />
            ))}
          </ol>

          <button type="button" onClick={addQuestion} className="btn-secondary self-center">
            + Add question
          </button>

          <button type="button" onClick={generate} className="btn-secondary self-center">
            Regenerate
          </button>

          <p className="flex items-start gap-2 text-xs text-slate-500">
            <SparkleIcon className="w-4 h-4 flex-none mt-0.5 text-accent2" />
            <span>
              Output quality depends on the model you're using. For best results, use GPT-4o, Claude
              Sonnet, or Gemini 1.5 Pro. Smaller or local models will still work but may produce simpler
              output.
            </span>
          </p>

          <FloatingShareButton onClick={handleCreateLink}>Create shareable client link →</FloatingShareButton>
        </>
      )}

      <LoadAnswersCard onLoadAnswers={onLoadAnswers} />
    </div>
  );
}
