import { useState } from 'react';
import { parseHashState } from '../lib/hashEncoder';
import { resolveAnswersState } from '../lib/crypto';

export default function LoadAnswersCard({ onLoadAnswers }) {
  const [loadLinkInput, setLoadLinkInput] = useState('');
  const [loadLinkError, setLoadLinkError] = useState('');

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
      if (err.message === 'NO_KEY') {
        setLoadLinkError('This link is encrypted and there is no key on this device. Restore your key backup first.');
        return;
      }
      if (err.message === 'WRONG_KEY') {
        setLoadLinkError('This link was not encrypted for the key on this device. Restore the key backup that matches the link you sent.');
        return;
      }
      setLoadLinkError('That does not look like a valid link. Paste the full URL your client sent back.');
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
      {loadLinkError && <p className="text-sm text-red-700">{loadLinkError}</p>}
    </div>
  );
}
