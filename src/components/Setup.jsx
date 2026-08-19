import { useState } from 'react';
import { PROVIDERS, sendMessage } from '../lib/apiRouter';
import { TEST_CONNECTION_MESSAGE } from '../lib/prompts';
import LoadingSpinner from './LoadingSpinner';
import ProviderModelSelect from './ProviderModelSelect';
import ApiKeyField from './ApiKeyField';
import LoadAnswersCard from './LoadAnswersCard';
import { InfoIcon, CheckIcon, XIcon } from './icons';

const NICHES = [
  'Web Design',
  'Mobile App Development',
  'Copywriting & Content',
  'Social Media Management',
  'SEO & Digital Marketing',
  'Brand Identity & Logo Design',
  'Video Editing & Production',
  'Business Consulting',
  'Life & Executive Coaching',
  'Photography',
  'Other',
];

export default function Setup({ config, setConfig, onConnected, onLoadAnswers }) {
  const { provider, model, apiKey, niche, customNiche } = config;
  const providerInfo = PROVIDERS[provider];

  const [testStatus, setTestStatus] = useState('idle'); // idle | testing | success | error
  const [testError, setTestError] = useState('');

  function updateConfig(patch) {
    setConfig((prev) => ({ ...prev, ...patch }));
    setTestStatus('idle');
    setTestError('');
  }

  async function handleTestConnection() {
    setTestStatus('testing');
    setTestError('');
    try {
      await sendMessage({
        provider,
        model,
        apiKey,
        messages: [{ role: 'user', content: TEST_CONNECTION_MESSAGE }],
      });
      setTestStatus('success');
    } catch (err) {
      setTestStatus('error');
      setTestError(err.message || 'Connection failed.');
    }
  }

  const effectiveNiche = niche === 'Other' ? customNiche : niche;
  const canTest = providerInfo.needsKey ? Boolean(apiKey) && Boolean(model) : Boolean(model);
  const canProceed = testStatus === 'success' && Boolean(effectiveNiche);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
      <div className="text-center">
        <h1
          className="font-display text-5xl sm:text-7xl font-black tracking-tight pb-2 text-gradient-brand"
          style={{ lineHeight: 1.3, fontVariationSettings: '"opsz" 144, "SOFT" 0, "WONK" 1' }}
        >
          BriefSnap
        </h1>
        <p className="mt-6 text-sm sm:text-base font-medium text-accent2/90">
          Turn messy client conversations into clean project briefs — in 60 seconds.
        </p>
        <p className="mt-1.5 text-sm text-slate-500">
          Use your own AI key. No subscriptions. No servers. Just better client briefs.
        </p>
      </div>

      <div className="card flex flex-col gap-2 p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Connect your AI provider</h2>
          <span className="text-xs font-medium text-slate-400 bg-white/5 border border-white/10 rounded-full px-2.5 py-1">
            Bring your own key
          </span>
        </div>

        <ProviderModelSelect provider={provider} model={model} onChange={updateConfig} />

        {providerInfo.needsKey && (
          <ApiKeyField
            apiKey={apiKey}
            placeholder={providerInfo.keyPlaceholder}
            onChange={(v) => updateConfig({ apiKey: v })}
          />
        )}

        <p className="flex items-start gap-2 text-xs text-slate-300 bg-accent/10 border border-accent/20 rounded-lg px-3 py-2 leading-snug">
          <InfoIcon className="w-4 h-4 flex-none mt-0.5 text-accent2" />
          <span>{providerInfo.recommendation}</span>
        </p>

        <div>
          <label htmlFor="niche" className="field-label">
            Niche
          </label>
          <div className="flex gap-2">
            <select
              id="niche"
              value={niche}
              onChange={(e) => updateConfig({ niche: e.target.value })}
              className="field-input flex-1"
            >
              {NICHES.map((n) => (
                <option key={n} value={n} className="bg-surface text-ink">
                  {n}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={!canTest || testStatus === 'testing'}
              className="btn-dark px-3 py-1.5 text-xs flex-none whitespace-nowrap"
            >
              Test connection
            </button>
          </div>
          {niche === 'Other' && (
            <input
              type="text"
              value={customNiche}
              onChange={(e) => updateConfig({ customNiche: e.target.value })}
              placeholder="Describe your niche"
              aria-label="Custom niche"
              className="field-input mt-2"
            />
          )}
        </div>

        {testStatus === 'success' && (
          <span className="inline-flex self-start items-center gap-1.5 text-sm font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1">
            <CheckIcon className="w-3.5 h-3.5" />
            Connected — {providerInfo.label} is ready
          </span>
        )}

        {testStatus === 'testing' && <LoadingSpinner message="Testing connection..." />}
        {testStatus === 'error' && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3" role="alert">
            <XIcon className="w-4 h-4 flex-none mt-0.5 text-red-400" />
            <p className="text-sm text-red-300">{testError}</p>
          </div>
        )}

        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={onConnected}
            disabled={!canProceed}
            className="btn-primary px-3 py-1.5 text-xs"
          >
            Next →
          </button>
        </div>
      </div>

      <LoadAnswersCard onLoadAnswers={onLoadAnswers} />
    </div>
  );
}
