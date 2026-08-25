import { useEffect } from 'react';

export default function Toast({ message, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 2000);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-ink text-white text-sm font-medium px-4 py-2.5 rounded-md shadow-lg z-50 animate-fadeIn"
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
