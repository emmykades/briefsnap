// Color themes for the client-facing pages only (the questionnaire form and the
// brief view a client opens). The freelancer's own BriefSnap UI always stays the
// default blue — these just let a freelancer brand the link they send out.
export const THEMES = [
  { id: 'blue', label: 'Blue', accent: '#5B7FFF', accent2: '#22D3EE' },
  { id: 'purple', label: 'Purple', accent: '#8B5CF6', accent2: '#EC4899' },
  { id: 'emerald', label: 'Emerald', accent: '#10B981', accent2: '#22D3EE' },
  { id: 'amber', label: 'Amber', accent: '#F59E0B', accent2: '#F97316' },
  { id: 'rose', label: 'Rose', accent: '#F43F5E', accent2: '#F97316' },
  { id: 'indigo', label: 'Indigo', accent: '#6366F1', accent2: '#A855F7' },
  { id: 'teal', label: 'Teal', accent: '#14B8A6', accent2: '#3B82F6' },
  { id: 'slate', label: 'Slate', accent: '#64748B', accent2: '#94A3B8' },
];

export const DEFAULT_THEME_ID = 'blue';

export function getTheme(id) {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function themeRgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function themeGradientText(theme) {
  return { backgroundImage: `linear-gradient(90deg, ${theme.accent}, ${theme.accent2})` };
}

export function themeGradientBg(theme) {
  return { backgroundImage: `linear-gradient(90deg, ${theme.accent}, ${theme.accent2})` };
}

export function themePrimaryButtonStyle(theme) {
  return {
    backgroundImage: `linear-gradient(90deg, ${theme.accent}, ${theme.accent2})`,
    boxShadow: `0 0 24px -6px ${themeRgba(theme.accent, 0.7)}`,
  };
}
