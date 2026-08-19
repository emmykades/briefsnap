import { THEMES } from '../lib/themes';

export default function ThemePicker({ value, onChange }) {
  return (
    <div>
      <label className="field-label">Client link color theme</label>
      <div className="flex flex-wrap gap-2 mt-1">
        {THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            title={t.label}
            aria-label={t.label}
            aria-pressed={value === t.id}
            className={
              'w-8 h-8 rounded-full border-2 transition ' +
              (value === t.id ? 'border-white scale-110' : 'border-white/20 hover:border-white/50')
            }
            style={{ backgroundImage: `linear-gradient(135deg, ${t.accent}, ${t.accent2})` }}
          />
        ))}
      </div>
    </div>
  );
}
