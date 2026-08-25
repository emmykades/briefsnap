export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex flex-col gap-3" role="alert">
      <p className="text-sm text-red-700">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="self-start px-3.5 py-1.5 text-sm font-medium text-red-700 border border-red-200 rounded-md bg-white hover:bg-red-50 transition focus:outline-none focus:ring-2 focus:ring-red-400/40"
        >
          Try again
        </button>
      )}
    </div>
  );
}
