import { useState } from 'react';
import { TYPE_LABELS, CHOICE_TYPES } from '../lib/questionTypes';
import { PencilIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon } from './icons';

export default function QuestionCard({
  index,
  question,
  onSave,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  forceEdit,
}) {
  const [editing, setEditing] = useState(Boolean(forceEdit));
  const [draft, setDraft] = useState(question);
  // Captured once: a question opened straight into edit mode (via "+ Add question")
  // hasn't been saved yet, so Cancel should remove it rather than leave a blank card.
  const [isNew] = useState(Boolean(forceEdit));

  function startEdit() {
    setDraft(question);
    setEditing(true);
  }

  function updateDraft(patch) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  function changeType(nextType) {
    setDraft((prev) => ({
      ...prev,
      type: nextType,
      options: CHOICE_TYPES.includes(nextType) ? (prev.options?.length ? prev.options : ['']) : undefined,
    }));
  }

  function updateOption(oi, value) {
    setDraft((prev) => ({ ...prev, options: prev.options.map((o, i) => (i === oi ? value : o)) }));
  }

  function removeOption(oi) {
    setDraft((prev) => ({ ...prev, options: prev.options.filter((_, i) => i !== oi) }));
  }

  function addOption() {
    setDraft((prev) => ({ ...prev, options: [...(prev.options || []), ''] }));
  }

  function saveEdit() {
    onSave(draft);
    setEditing(false);
  }

  function handleCancel() {
    if (isNew) {
      onDelete();
    } else {
      setEditing(false);
    }
  }

  if (editing) {
    return (
      <li className="card py-4 sm:py-4 flex flex-col gap-3">
        <div>
          <label className="field-label">Question</label>
          <input
            type="text"
            value={draft.question}
            onChange={(e) => updateDraft({ question: e.target.value })}
            className="field-input"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">Type</label>
            <select value={draft.type} onChange={(e) => changeType(e.target.value)} className="field-input">
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value} className="bg-surface text-ink">
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={Boolean(draft.required)}
                onChange={(e) => updateDraft({ required: e.target.checked })}
                className="text-accent focus:ring-accent/60"
              />
              Required
            </label>
          </div>
        </div>

        {CHOICE_TYPES.includes(draft.type) ? (
          <div>
            <label className="field-label">Options</label>
            <div className="flex flex-col gap-1.5">
              {(draft.options || []).map((opt, oi) => (
                <div key={oi} className="flex gap-1.5">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => updateOption(oi, e.target.value)}
                    className="field-input flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(oi)}
                    title="Remove option"
                    className="btn-secondary px-2.5 flex-none"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addOption} className="btn-secondary px-3 py-1.5 text-xs mt-1.5">
              + Add option
            </button>
            <p className="mt-1.5 text-xs text-slate-500 italic">
              An "Other" free-text option is always added automatically.
            </p>
          </div>
        ) : (
          <div>
            <label className="field-label">Placeholder example</label>
            <input
              type="text"
              value={draft.placeholder || ''}
              onChange={(e) => updateDraft({ placeholder: e.target.value })}
              className="field-input"
            />
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={handleCancel} className="btn-secondary px-3 py-1.5 text-xs">
            Cancel
          </button>
          <button
            type="button"
            onClick={saveEdit}
            disabled={!draft.question.trim()}
            className="btn-primary px-3 py-1.5 text-xs"
          >
            Save
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="card py-4 sm:py-4">
      <div className="flex items-start gap-3">
        <span className="flex-none w-6 h-6 rounded-full bg-accent/15 text-accent2 text-xs font-semibold flex items-center justify-center mt-0.5">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-ink">
              {question.question} {question.required && <span className="text-red-400">*</span>}
            </p>
            <div className="flex-none flex items-center gap-2">
              <div className="flex flex-col -my-1">
                <button
                  type="button"
                  onClick={onMoveUp}
                  disabled={!canMoveUp}
                  title="Move up"
                  className="text-slate-500 hover:text-accent2 transition disabled:opacity-20 disabled:hover:text-slate-500"
                >
                  <ChevronUpIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={onMoveDown}
                  disabled={!canMoveDown}
                  title="Move down"
                  className="text-slate-500 hover:text-accent2 transition disabled:opacity-20 disabled:hover:text-slate-500"
                >
                  <ChevronDownIcon className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                type="button"
                onClick={startEdit}
                title="Edit question"
                className="text-slate-500 hover:text-accent2 transition"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onDelete}
                title="Remove question"
                className="text-slate-500 hover:text-red-400 transition"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
          <span className="inline-block mt-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
            {TYPE_LABELS[question.type] || question.type}
          </span>
          {CHOICE_TYPES.includes(question.type) && Array.isArray(question.options) && (
            <ul className="mt-2.5 flex flex-col gap-1.5">
              {question.options.map((opt, oi) => (
                <li key={oi} className="text-sm text-slate-300 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full border border-white/20 inline-block" />
                  {opt}
                </li>
              ))}
              <li className="text-sm text-slate-500 italic flex items-center gap-2">
                <span className="w-3 h-3 rounded-full border border-white/20 inline-block" />
                Other (free text)
              </li>
            </ul>
          )}
          {!CHOICE_TYPES.includes(question.type) && question.placeholder && (
            <p className="mt-2 text-sm text-slate-500 italic">{question.placeholder}</p>
          )}
        </div>
      </div>
    </li>
  );
}
