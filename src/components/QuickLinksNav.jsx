function jumpTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// scrollIntoView, not href="#id" — real anchor links would rewrite
// window.location.hash, which the app's own routing reads on every hashchange.
export default function QuickLinksNav({ items }) {
  if (!items.length) return null;

  return (
    <nav className="hidden lg:flex sticky top-6 card !p-3 flex-col gap-1" aria-label="Quick links">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 px-2 pb-1">On this page</p>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => jumpTo(item.id)}
          className={
            'text-left text-sm hover:text-ink hover:bg-white/[0.06] rounded-lg py-1.5 transition truncate ' +
            (item.indent ? 'pl-6 pr-2 text-xs text-slate-400' : 'px-2 text-slate-300')
          }
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
