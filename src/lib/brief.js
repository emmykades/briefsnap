// Single source of truth for the brief's section titles and what each should
// contain — used to build the AI prompt (prompts.js) and to recognize section
// headings back out of the generated text (splitSections below).
export const BRIEF_SECTIONS = [
  { title: 'Project Overview', description: 'A 2–3 sentence executive summary of the project.' },
  {
    title: 'Goals and Success Metrics',
    description: 'Bulleted list. Each goal should be specific and measurable where possible.',
  },
  { title: 'Target Audience', description: "Who the end product is for. Be specific using the client's words." },
  { title: 'Scope of Work', description: 'Bulleted list of all deliverables explicitly or implicitly mentioned.' },
  { title: 'Suggested Timeline', description: 'Break the project into phases with rough time estimates per phase.' },
  { title: 'Budget', description: "State the client's stated budget range. Flag if it seems misaligned with scope." },
  {
    title: 'Existing Assets and Resources',
    description: 'What the client already has that the freelancer can use.',
  },
  {
    title: 'Approval Process',
    description: 'Who signs off, how many revision rounds are implied, decision-making structure.',
  },
  {
    title: 'Red Flags and Risks',
    description:
      'Be direct. List anything in the answers that could cause problems: vague goals, unrealistic timelines, budget mismatches, unclear ownership, scope creep signals. If nothing concerning, write "None identified."',
  },
  {
    title: 'Recommended Next Steps',
    description: 'Exactly 3 concrete actions the freelancer should take immediately after reading this brief.',
  },
];

export function formatAnswer(value) {
  return Array.isArray(value) ? value.join(', ') : value || '';
}

export function stripMarkdownBold(text) {
  return text.replace(/\*\*(.+?)\*\*/g, '$1');
}

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// extraTitles lets callers recognize custom (user-named) section headings too —
// splitSections only knows the fixed BRIEF_SECTIONS titles otherwise.
export function splitSections(briefText, extraTitles = []) {
  const lines = briefText.split('\n');
  const sections = [];
  let current = null;
  const allTitles = [...BRIEF_SECTIONS.map((s) => s.title), ...extraTitles.filter(Boolean)];
  const headingNames = allTitles.map(escapeRegExp).join('|');
  const headingPattern = new RegExp(`^(?:\\d{1,2}[.)]\\s*)?(${headingNames})\\s*$`, 'i');

  for (const line of lines) {
    const match = line.trim().match(headingPattern);
    if (match) {
      current = { title: match[1], body: [] };
      sections.push(current);
    } else if (current) {
      current.body.push(line);
    } else {
      if (!sections.length) sections.push({ title: null, body: [] });
      sections[sections.length - 1].body.push(line);
    }
  }

  if (!sections.length) return [{ title: null, body: briefText }];
  return sections.map((s) => ({ title: s.title, body: s.body.join('\n').trim() }));
}
