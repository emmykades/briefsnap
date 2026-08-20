import { useState } from 'react';
import { PROVIDERS } from '../lib/apiRouter';

// onChange receives a config patch, e.g. { model: 'x' } or { provider: 'y', model: 'z', apiKey: '' }.
export default function ProviderModelSelect({ provider, model, onChange }) {
  const providerInfo = PROVIDERS[provider];
  const [customModel, setCustomModel] = useState(!providerInfo.models?.includes(model));

  function handleProviderChange(nextProvider) {
    setCustomModel(false);
    onChange({ provider: nextProvider, model: PROVIDERS[nextProvider].defaultModel, apiKey: '' });
  }

  function handleModelSelect(value) {
    if (value === '__custom__') {
      setCustomModel(true);
      onChange({ model: '' });
    } else {
      onChange({ model: value });
    }
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label htmlFor="provider" className="field-label">
          AI Provider
        </label>
        <select
          id="provider"
          value={provider}
          onChange={(e) => handleProviderChange(e.target.value)}
          className="field-input"
        >
          {Object.entries(PROVIDERS).map(([key, info]) => (
            <option key={key} value={key} className="bg-surface text-ink">
              {info.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="model" className="field-label">
          Model
        </label>
        {customModel ? (
          <div className="flex gap-1.5">
            <input
              id="model"
              type="text"
              autoFocus
              value={model}
              onChange={(e) => onChange({ model: e.target.value })}
              placeholder="Type exact model name"
              className="field-input"
            />
            {providerInfo.models && (
              <button
                type="button"
                onClick={() => {
                  setCustomModel(false);
                  onChange({ model: providerInfo.defaultModel });
                }}
                title="Choose from list"
                className="btn-secondary px-2.5 flex-none"
              >
                ↺
              </button>
            )}
          </div>
        ) : (
          <select
            id="model"
            value={model}
            onChange={(e) => handleModelSelect(e.target.value)}
            className="field-input"
          >
            {providerInfo.models?.map((m) => (
              <option key={m} value={m} className="bg-surface text-ink">
                {m}
              </option>
            ))}
            <option value="__custom__" className="bg-surface text-ink">
              Custom…
            </option>
          </select>
        )}
      </div>
    </div>
  );
}
