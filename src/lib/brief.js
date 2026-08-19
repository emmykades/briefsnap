export function formatAnswer(value) {
  return Array.isArray(value) ? value.join(', ') : value || '';
}

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function splitSections(briefText) {
  const lines = briefText.split('\n');
  const sections = [];
  let current = null;
  const headingPattern = /^(?:\d{1,2}[.)]\s*)?(Project Overview|Goals and Success Metrics|Target Audience|Scope of Work|Suggested Timeline|Budget|Existing Assets and Resources|Approval Process|Red Flags and Risks|Recommended Next Steps)\s*$/i;

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
