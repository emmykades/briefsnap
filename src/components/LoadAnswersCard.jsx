import { useRef, useState } from 'react';
import { parseHashState } from '../lib/hashEncoder';
import { resolveAnswersState, parseAnswersFile, answersErrorMessage } from '../lib/crypto';

export default function LoadAnswersCard({ onLoadAnswers }) {
  const [loadLinkInput, setLoadLinkInput] = useState('');
  const [loadLinkError, setLoadLinkError] = useState('');
  const fileRef = useRef(null);

  async function handleLoadAnswersLink() {
    setLoadLinkError('');
    try {
      const url = new URL(loadLinkInput.trim());
      const state = await parseHashState(url.hash);
      if (!state || state.type !== 'answers') {
        setLoadLinkError('That link does not contain client answers. Paste the exact link your client sent back.');
        return;
      }
      onLoadAnswers(await resolveAnswersState(state));
    } catch (err) {
      setLoadLinkError(answersErrorMessage(err));
    }
  }

  async function handleFile(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setLoadLinkError('');
    try {
      if (file.size > 5_000_000) throw new Error('BAD_FILE');
      onLoadAnswers(await resolveAnswersState(parseAnswersFile(await file.text())));
    } catch (err) {
      setLoadLinkError(answersErrorMessage(err));
    }
  }

  return (
    <div className="card flex flex-col items-center gap-4 text-center">
      <label htmlFor="loadAnswers" className="text-2xl sm:text-3xl font-normal text-ink">
        Already have client answers?
      </label>
      <div className="flex gap-2 w-full">
        <input
          id="loadAnswers"
          type="text"
          value={loadLinkInput}
          onChange={(e) => setLoadLinkInput(e.target.value)}
          placeholder="Paste the link your client sent back"
          className="field-input flex-1"
        />
        <button
          type="button"
          onClick={handleLoadAnswersLink}
          disabled={!loadLinkInput.trim()}
          className="btn-secondary px-3 py-1.5 text-xs flex-none whitespace-nowrap"
        >
          Load
        </button>
      </div>
      <button
        type="button"
        onClick={() => fileRef.current && fileRef.current.click()}
        className="text-xs text-muted underline hover:text-ink"
      >
        Or open an encrypted answers file
      </button>
      <input ref={fileRef} type="file" accept=".briefsnap,application/json" onChange={handleFile} className="hidden" />
      {loadLinkError && <p className="text-sm text-red-700">{loadLinkError}</p>}
    </div>
  );
}
