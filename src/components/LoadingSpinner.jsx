export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10" role="status" aria-live="polite">
      <div className="w-8 h-8 border-[3px] border-line border-t-accent rounded-full animate-spin" />
      <p className="text-sm text-muted">{message}</p>
    </div>
  );
}
