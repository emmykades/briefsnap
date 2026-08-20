import { CheckIcon } from './icons';

const STEPS = [
  { label: 'Setup', step: 1 },
  { label: 'Questionnaire', step: 2 },
  { label: 'Brief', step: 4 },
];

export default function StepIndicator({ currentStep, canJump, onStepClick }) {
  return (
    <ol className="flex items-center justify-between max-w-2xl mx-auto mb-6" aria-label="Progress">
      {STEPS.map(({ label, step: stepNumber }, index) => {
        const isComplete = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        const clickable = !isCurrent && Boolean(canJump?.(stepNumber));
        const Tag = clickable ? 'button' : 'div';
        return (
          <li key={label} className="flex-1 flex items-center last:flex-none">
            <Tag
              type={clickable ? 'button' : undefined}
              onClick={clickable ? () => onStepClick(stepNumber) : undefined}
              className={
                'flex flex-col items-center gap-1.5 rounded-lg py-1 px-1.5 -mx-1.5 transition ' +
                (clickable ? 'cursor-pointer hover:bg-white/[0.06]' : 'cursor-default')
              }
            >
              <div
                className={
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ' +
                  (isComplete
                    ? 'bg-gradient-to-br from-accent to-accent2 text-white shadow-[0_0_16px_-2px_rgba(91,127,255,0.8)]'
                    : isCurrent
                    ? 'bg-gradient-to-br from-accent to-accent2 text-white shadow-[0_0_16px_-2px_rgba(91,127,255,0.8)] animate-glowPulse'
                    : 'bg-white/[0.04] text-slate-500 border border-white/10')
                }
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isComplete ? <CheckIcon className="w-4 h-4" /> : index + 1}
              </div>
              <span
                className={
                  'text-xs whitespace-nowrap ' + (isCurrent ? 'text-ink font-semibold' : 'text-slate-500')
                }
              >
                {label}
              </span>
            </Tag>
            {index !== STEPS.length - 1 && (
              <div
                className={
                  'flex-1 h-px mx-2 rounded-full ' +
                  (isComplete ? 'bg-gradient-to-r from-accent to-accent2' : 'bg-white/10')
                }
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
