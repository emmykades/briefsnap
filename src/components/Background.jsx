import { useEffect, useRef } from 'react';

export default function Background() {
  const spotlightRef = useRef(null);

  useEffect(() => {
    function handleMove(e) {
      const xPct = (e.clientX / window.innerWidth) * 100;
      const yPct = (e.clientY / window.innerHeight) * 100;
      if (spotlightRef.current) {
        spotlightRef.current.style.background = `radial-gradient(600px circle at ${xPct}% ${yPct}%, rgba(91,127,255,0.14), transparent 65%)`;
      }
    }
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '44px 44px' }} />

      <div className="absolute -top-40 -left-40 w-[32rem] h-[32rem] rounded-full bg-accent/20 blur-[110px] animate-float-slow" />
      <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] rounded-full bg-accent2/15 blur-[110px] animate-float-slower" />
      <div className="absolute bottom-[-8rem] left-1/4 w-[26rem] h-[26rem] rounded-full bg-accent/10 blur-[110px] animate-float-slow" />

      <div ref={spotlightRef} className="absolute inset-0 transition-[background] duration-300 ease-out" />
    </div>
  );
}
