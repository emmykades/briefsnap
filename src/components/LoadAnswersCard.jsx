import { useState } from 'react';
import { decodeState } from '../lib/hashEncoder';

export default function LoadAnswersCard({ onLoadAnswers }) {
  const [loadLinkInput, setLoadLinkInput] = useState('');
  const [loadLinkError, setLoadLinkError] = useState('');

  function handleLoadAnswersLink() {
    setLoadLinkError('');
    try {
      const url = new URL(loadLinkInput.trim());
      const hash = url.hash.startsWith('#') ? url.hash.slice(1) : url.hash;
      const params = new URLSearchParams(hash);
      const s = params.get('s');
      const state = s ? decodeState(s) : null;
      if (!state || state.type !== 'answers') {
        setLoadLinkError('That link does not contain client answers. Paste the exact link your client sent back.');
        return;
      }
      onLoadAnswers(state);
    } catch {
      setLoadLinkError('That does not look like a valid link. Paste the full URL your client sent back.');
    }
  }

  return (
    <div className="card">
      <label htmlFor="loadAnswers" className="field-label mb-2">
        Already have client answers?
      </label>
      <div className="flex gap-2">
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
      {loadLinkError && <p className="mt-2 text-sm text-red-300">{loadLinkError}</p>}
    </div>
  );
}
