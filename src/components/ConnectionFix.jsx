import { useState } from 'react';
import { PROVIDERS, sendMessage } from '../lib/apiRouter';
import { TEST_CONNECTION_MESSAGE } from '../lib/prompts';
import ProviderModelSelect from './ProviderModelSelect';
import ApiKeyField from './ApiKeyField';
import LoadingSpinner from './LoadingSpinner';
import { XIcon } from './icons';

// Lets the user fix their provider/model/key inline after a generation call fails,
// then automatically retries the action that failed instead of sending them back to Setup.
export default function ConnectionFix({ config, setConfig, onFixed }) {
  const providerInfo = PROVIDERS[config.provider];
  const [status, setStatus] = useState('idle'); // idle | testing | success | error
  const [error, setError] = useState('');

  function patchConfig(patch) {
    setConfig((prev) => ({ ...prev, ...patch }));
    setStatus('idle');
    setError('');
  }

  async function handleTestAndRetry() {
    setStatus('testing');
    setError('');
    try {
      await sendMessage({
        provider: config.provider,
        model: config.model,
        apiKey: config.apiKey,
        messages: [{ role: 'user', content: TEST_CONNECTION_MESSAGE }],
      });
      setStatus('success');
      onFixed();
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Connection failed.');
    }
  }

  const canTest = providerInfo.needsKey ? Boolean(config.apiKey) && Boolean(config.model) : Boolean(config.model);

  return (
    <div className="card flex flex-col gap-3">
      <p className="text-sm font-semibold text-ink">Fix your AI connection</p>

      <ProviderModelSelect provider={config.provider} model={config.model} onChange={patchConfig} />

      {providerInfo.needsKey && (
        <ApiKeyField
          apiKey={config.apiKey}
          placeholder={providerInfo.keyPlaceholder}
          onChange={(v) => patchConfig({ apiKey: v })}
        />
      )}

      <button
        type="button"
        onClick={handleTestAndRetry}
        disabled={!canTest || status === 'testing'}
        className="btn-primary self-start"
      >
        Test connection & retry
      </button>

      {status === 'testing' && <LoadingSpinner message="Testing connection..." />}
      {status === 'error' && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3" role="alert">
          <XIcon className="w-4 h-4 flex-none mt-0.5 text-red-400" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}
    </div>
  );
}
