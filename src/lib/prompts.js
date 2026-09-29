import { BRIEF_SECTIONS } from './brief';

export const TEST_CONNECTION_MESSAGE = 'Reply with the word OK and nothing else.';

export function questionnaireSystemPrompt(niche, questionCount = 12, additionalInfo = '') {
  return `You are an expert freelance project manager with 15 years of experience onboarding clients across ${niche} projects. Generate a professional client intake questionnaire for a freelancer about to start a new ${niche} project.

Produce exactly ${questionCount} questions. Cover these areas, combining or dropping the least important ones if ${questionCount} is too few to cover all of them, and adding more depth to each area if ${questionCount} allows for it:
1. Project overview and goals
2. Target audience
3. Deliverables and scope
4. Timeline and deadlines
5. Budget range
6. Existing assets and references
7. Approval process and stakeholders
8. Communication preferences
9. Definition of success
10. Known constraints, concerns, or red flags
${additionalInfo.trim() ? `\nThe freelancer also gave this additional guidance for the questionnaire — prioritize it:\n"""\n${additionalInfo.trim()}\n"""\n` : ''}
Most clients cannot describe what they want, but they can easily react to concrete examples. So wherever the answer is a matter of taste, style, tone, direction or approach (look and feel, brand personality, how formal or playful, layout or feature priorities, reference styles), do NOT ask an open-ended question. Instead write a "multiple_choice" question with exactly 3 concrete, clearly different options the client can react to. Each option must be specific and vivid (for example "Warm and friendly: rounded shapes, soft colors, casual wording") rather than generic (for example "Modern"). Use plain text or the other choice types only for factual details a client must simply state (name, deadline, budget, existing assets, who approves). Aim for roughly half of the questions to be 3-option reaction questions.

Return ONLY a valid JSON array. No markdown, no explanation, no code fences.
Each object must have exactly these fields:
{
  "id": "q1",
  "question": "...",
  "type": "short_text" | "long_text" | "multiple_choice" | "checkboxes",
  "options": ["option1", "option2"] (only present when type is "multiple_choice" or "checkboxes"),
  "required": true | false,
  "placeholder": "e.g. ..." (a concrete example answer to show as placeholder, omit for multiple_choice/checkboxes)
}

Use "multiple_choice" when the client should pick exactly one option (e.g. budget range). Use "checkboxes" when more than one selection could reasonably apply (e.g. which deliverables are needed). Do not add your own "Other" option to any options array — the form adds one automatically with a free-text field, and every choice question also lets the client add extra detail if they already know exactly what they want.`;
}

// sections: [{ title, description }] — description says what that section should
// cover. Pass the standard BRIEF_SECTIONS entries and/or freelancer-defined custom
// ones (title + a plain-English description of what the AI should write there).
export function briefSystemPrompt(niche, formattedQA, sections) {
  const sectionsToUse = Array.isArray(sections) && sections.length ? sections : BRIEF_SECTIONS;
  const sectionList = sectionsToUse.map((s, i) => `${i + 1}. ${s.title}\n   ${s.description}`).join('\n\n');

  return `You are a senior project manager producing a formal project brief for a freelancer.
Below are the client's answers to an intake questionnaire for a ${niche} project.

Questions and answers:
${formattedQA}

Produce a complete, professional project brief with exactly these ${sectionsToUse.length} sections.
Use the client's actual words and specifics — do not be generic.

${sectionList}

Format each section with a clear heading. Use plain text, not markdown symbols.
Write in third person (referring to "the client"). Be specific, not generic.`;
}

export function kickoffAgendaPrompt(briefText) {
  return `Based on this project brief, write a structured 30-minute kickoff call agenda. Include: welcome and introductions (2 min), project overview confirmation (5 min), scope and deliverables walkthrough (8 min), timeline and milestones (5 min), communication and approval process (5 min), open questions (4 min), next steps and close (1 min). For each section include 2–3 specific talking points drawn from the brief. Output plain text, no markdown.

Project brief:
${briefText}`;
}
