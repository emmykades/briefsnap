import { useEffect, useState } from 'react';
import { PROVIDERS } from './lib/apiRouter';
import { readStateFromHash } from './lib/hashEncoder';
import { GITHUB_URL } from './lib/constants';
import { checkAccess } from './lib/access';
import Background from './components/Background';
import StepIndicator from './components/StepIndicator';
import Setup from './components/Setup';
import QuestionnaireBuilder from './components/QuestionnaireBuilder';
import ClientForm from './components/ClientForm';
import BriefView from './components/BriefView';
import BriefOutput from './components/BriefOutput';
import LockedScreen from './components/LockedScreen';
import Toast from './components/Toast';
import { DEFAULT_THEME_ID } from './lib/themes';

const DEFAULT_CONFIG = {
  provider: 'openai',
  model: PROVIDERS.openai.defaultModel,
  apiKey: '',
  niche: 'Web Design',
  customNiche: '',
};

export default function App() {
  const [hashState, setHashState] = useState(() => readStateFromHash());

  useEffect(() => {
    function onHashChange() {
      setHashState(readStateFromHash());
    }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Client is filling out the questionnaire — bare form, no BriefSnap chrome.
  if (hashState && hashState.type === 'questionnaire') {
    return (
      <>
        <Background />
        <ClientForm
          niche={hashState.niche}
          questions={hashState.questions}
          formTitle={hashState.formTitle}
          formIntro={hashState.formIntro}
          theme={hashState.theme}
        />
      </>
    );
  }

  // Client is viewing the finished brief — bare view, no BriefSnap chrome.
  if (hashState && hashState.type === 'brief') {
    return (
      <>
        <Background />
        <BriefView
          niche={hashState.niche}
          briefText={hashState.briefText}
          agendaText={hashState.agendaText}
          theme={hashState.theme}
          title={hashState.briefTitle}
          intro={hashState.briefIntro}
        />
      </>
    );
  }

  // The tool itself (Setup/Questionnaire/Brief builder) requires the access key.
  // Client-facing pages above (questionnaire, brief) never require it.
  if (!checkAccess()) {
    return (
      <>
        <Background />
        <LockedScreen />
      </>
    );
  }

  return (
    <>
      <Background />
      <FreelancerApp initialAnswersState={hashState && hashState.type === 'answers' ? hashState : null} />
    </>
  );
}

function FreelancerApp({ initialAnswersState }) {
  const [step, setStep] = useState(initialAnswersState ? 4 : 1);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [questions, setQuestions] = useState(initialAnswersState ? initialAnswersState.questions : null);
  const [answersState, setAnswersState] = useState(initialAnswersState);
  const [questionnaireOptions, setQuestionnaireOptions] = useState({
    count: 12,
    additionalInfo: '',
    formTitle: '',
    formIntro: '',
    theme: DEFAULT_THEME_ID,
  });
  const [toastMessage, setToastMessage] = useState('');

  function showToast(message) {
    setToastMessage(message);
  }

  function handleConnected() {
    setStep(2);
  }

  function handleShareLinkCopied() {
    showToast("Link copied. Send this to your client — they don't need an account.");
  }

  function handleLoadAnswers(state) {
    setQuestions(state.questions);
    setAnswersState(state);
    setStep(4);
  }

  function canJumpTo(stepNumber) {
    if (stepNumber === 4) return Boolean(answersState);
    return true;
  }

  function handleStepClick(stepNumber) {
    if (canJumpTo(stepNumber)) setStep(stepNumber);
  }

  const niche = config.niche === 'Other' ? config.customNiche : config.niche;
  const effectiveNiche = answersState ? answersState.niche : niche;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 px-4 py-6 flex flex-col">
        <StepIndicator currentStep={step} canJump={canJumpTo} onStepClick={handleStepClick} />

        <div className={step === 1 ? 'flex-1 flex items-center justify-center py-2' : ''}>
          {step === 1 && (
            <Setup
              config={config}
              setConfig={setConfig}
              onConnected={handleConnected}
              onLoadAnswers={handleLoadAnswers}
            />
          )}

          {step === 2 && (
            <QuestionnaireBuilder
              config={config}
              questions={questions}
              setQuestions={setQuestions}
              options={questionnaireOptions}
              setOptions={setQuestionnaireOptions}
              onShareLinkCopied={handleShareLinkCopied}
              onLoadAnswers={handleLoadAnswers}
            />
          )}

          {step === 4 && answersState && (
            <BriefOutput
              config={config}
              setConfig={setConfig}
              niche={effectiveNiche}
              questions={answersState.questions}
              answers={answersState.answers}
              theme={answersState.theme}
              setAnswersState={setAnswersState}
              onCopyToast={showToast}
            />
          )}
        </div>
      </div>

      <footer className="border-t border-white/10 px-4 py-6">
        <p className="max-w-2xl mx-auto text-center text-xs text-slate-500">
          BriefSnap has no server and no database — everything runs in your browser.{' '}
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 underline hover:text-accent2"
          >
            View source on GitHub
          </a>
        </p>
        <p className="mt-1.5 max-w-2xl mx-auto text-center text-xs text-slate-500">
          Questions or ideas to make this better?{' '}
          <a href="mailto:emmykades@gmail.com" className="text-slate-400 underline hover:text-accent2">
            emmykades@gmail.com
          </a>
        </p>
      </footer>

      <Toast message={toastMessage} onDismiss={() => setToastMessage('')} />
    </div>
  );
}
