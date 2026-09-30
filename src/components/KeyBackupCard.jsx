import { useRef, useState } from 'react';
import { exportKeyBackup, importKeyBackup } from '../lib/crypto';
import { downloadTextFile } from '../lib/download';

export default function KeyBackupCard() {
  const fileRef = useRef(null);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  function report(text, error = false) {
    setMessage(text);
    setIsError(error);
  }

  async function handleDownload() {
    try {
      downloadTextFile('briefsnap-key-backup.json', await exportKeyBackup(), 'application/json');
      report('Backup downloaded. Keep it somewhere private, like a password manager.');
    } catch {
      report('Could not create a backup in this browser.', true);
    }
  }

  async function handleRestore(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      importKeyBackup(await file.text());
      report('Key restored. You can now open answers encrypted for it.');
    } catch (err) {
      report(err.message || 'Could not restore that file.', true);
    }
  }

  return (
    <div className="card flex flex-col items-center gap-3 text-center">
      <h3 className="text-2xl sm:text-3xl font-normal text-ink">Your encryption key</h3>
      <p className="text-sm text-muted">
        Client answers are encrypted so only this device can read them. Back up your key: if you clear your browser
        data or switch devices without it, answers sent to you can't be opened by anyone, including us.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" onClick={handleDownload} className="btn-secondary px-3 py-1.5 text-xs">
          Download key backup
        </button>
        <button
          type="button"
          onClick={() => fileRef.current && fileRef.current.click()}
          className="btn-secondary px-3 py-1.5 text-xs"
        >
          Restore from backup
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" onChange={handleRestore} className="hidden" />
      </div>
      {message && (
        <p className={`text-sm ${isError ? 'text-red-700' : 'text-emerald-700'}`} role={isError ? 'alert' : 'status'}>
          {message}
        </p>
      )}
    </div>
  );
}
