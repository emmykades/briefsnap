import { useState } from 'react';
import { EyeIcon, EyeOffIcon } from './icons';

export default function ApiKeyField({ apiKey, placeholder, onChange }) {
  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor="apiKey" className="field-label mb-0">
          Your API key
        </label>
        <span className="text-xs font-medium text-red-600">Never stored or shared</span>
      </div>
      <div className="relative">
        <input
          id="apiKey"
          type={showApiKey ? 'text' : 'password'}
          autoComplete="off"
          value={apiKey}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="field-input pr-9"
        />
        <button
          type="button"
          onClick={() => setShowApiKey((v) => !v)}
          title={showApiKey ? 'Hide API key' : 'Show API key'}
          aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
          className="absolute inset-y-0 right-0 flex items-center px-2.5 text-muted hover:text-ink"
        >
          {showApiKey ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
