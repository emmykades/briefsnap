export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10" role="status" aria-live="polite">
      <div className="w-9 h-9 border-[3px] border-white/10 border-t-accent rounded-full animate-spin shadow-[0_0_16px_-4px_rgba(91,127,255,0.6)]" />
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}
