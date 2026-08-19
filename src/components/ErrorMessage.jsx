export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex flex-col gap-3" role="alert">
      <p className="text-sm text-red-300">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="self-start px-3.5 py-1.5 text-sm font-medium text-red-300 border border-red-500/30 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition focus:outline-none focus:ring-2 focus:ring-red-400/60"
        >
          Try again
        </button>
      )}
    </div>
  );
}
