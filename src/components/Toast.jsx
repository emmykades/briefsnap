import { useEffect } from 'react';

export default function Toast({ message, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 2000);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/10 border border-white/15 backdrop-blur-xl text-ink text-sm font-medium px-4 py-2.5 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.4)] z-50 animate-fadeIn"
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
