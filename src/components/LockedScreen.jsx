export default function LockedScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full card text-center flex flex-col gap-3">
        <h1 className="font-display text-5xl font-normal text-ink">BriefSnap</h1>
        <p className="text-sm text-muted">
          This tool is available with purchase. If you've already bought access, use the link from your
          confirmation email to open it.
        </p>
        <p className="text-xs text-muted">
          Questions?{' '}
          <a href="mailto:emmykades@gmail.com" className="text-accent underline hover:no-underline">
            emmykades@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}
