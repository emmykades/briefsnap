export default function FloatingShareButton({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn-primary fixed bottom-6 right-6 z-40 shadow-[0_8px_30px_rgba(0,0,0,0.45)]"
    >
      {children}
    </button>
  );
}
