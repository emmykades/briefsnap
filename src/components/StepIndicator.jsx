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
                'flex flex-col items-center gap-1.5 rounded-md py-1 px-1.5 -mx-1.5 transition ' +
                (clickable ? 'cursor-pointer hover:bg-canvas' : 'cursor-default')
              }
            >
              <div
                className={
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ' +
                  (isComplete
                    ? 'bg-accent text-white'
                    : isCurrent
                    ? 'bg-accent text-white ring-2 ring-accent/25 ring-offset-2 ring-offset-canvas'
                    : 'bg-surface text-muted border border-line')
                }
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isComplete ? <CheckIcon className="w-4 h-4" /> : index + 1}
              </div>
              <span
                className={
                  'text-xs whitespace-nowrap ' + (isCurrent ? 'text-ink font-semibold' : 'text-muted')
                }
              >
                {label}
              </span>
            </Tag>
            {index !== STEPS.length - 1 && (
              <div
                className={'flex-1 h-px mx-2 rounded-full ' + (isComplete ? 'bg-accent' : 'bg-line')}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
