// Color themes for the client-facing pages only (the questionnaire form and the
// brief view a client opens). The freelancer's own BriefSnap UI always stays the
// default ink/accent palette — these just let a freelancer brand the link they send out.
export const THEMES = [
  { id: 'blue', label: 'Blue', accent: '#1F4FD8' },
  { id: 'purple', label: 'Purple', accent: '#7C3AED' },
  { id: 'emerald', label: 'Emerald', accent: '#0D9488' },
  { id: 'amber', label: 'Amber', accent: '#B45309' },
  { id: 'rose', label: 'Rose', accent: '#BE123C' },
  { id: 'indigo', label: 'Indigo', accent: '#4338CA' },
  { id: 'teal', label: 'Teal', accent: '#0F766E' },
  { id: 'slate', label: 'Slate', accent: '#44403C' },
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

export function themeTextStyle(theme) {
  return { color: theme.accent };
}

export function themePrimaryButtonStyle(theme) {
  return { backgroundColor: theme.accent };
}
