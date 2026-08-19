export default function LockedScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full card text-center flex flex-col gap-3">
        <h1
          className="font-display text-4xl font-black tracking-tight text-gradient-brand"
          style={{ fontVariationSettings: '"opsz" 144, "SOFT" 0, "WONK" 1' }}
        >
          BriefSnap
        </h1>
        <p className="text-sm text-slate-400">
          This tool is available with purchase. If you've already bought access, use the link from your
          confirmation email to open it.
        </p>
        <p className="text-xs text-slate-500">
          Questions?{' '}
          <a href="mailto:emmykades@gmail.com" className="text-accent2 underline hover:no-underline">
            emmykades@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}
