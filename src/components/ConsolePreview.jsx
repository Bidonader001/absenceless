import { useEffect, useRef } from "react";

export default function ConsolePreview({ shots }) {
  const scroller = useRef(null);
  const pause = useRef(false);
  const resumeTimer = useRef(0);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return undefined;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let inside = false;
    const hold = () => {
      pause.current = true;
      window.clearTimeout(resumeTimer.current);
      resumeTimer.current = window.setTimeout(() => {
        if (!inside) pause.current = false;
      }, 1600);
    };

    const onWheel = (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      el.scrollLeft += event.deltaY;
      hold();
    };

    const onEnter = () => {
      inside = true;
      pause.current = true;
    };
    const onLeave = () => {
      inside = false;
      pause.current = false;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", hold);
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("touchstart", hold, { passive: true });

    let frame = 0;
    let last = 0;
    const tick = (now) => {
      if (!last) last = now;
      const dt = now - last;
      last = now;
      if (!reduce && !pause.current) {
        el.scrollLeft += dt * 0.07;
        const half = el.scrollWidth / 2;
        if (el.scrollLeft >= half) el.scrollLeft -= half;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(resumeTimer.current);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", hold);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("touchstart", hold);
    };
  }, []);

  const cards = [...shots, ...shots];

  return (
    <div className="shot-scroller" ref={scroller} tabIndex={0}>
      {cards.map((shot, index) => (
        <figure className="shot-card" key={`${shot.src}-${index}`} aria-hidden={index >= shots.length || undefined}>
          <img src={shot.src} alt={index >= shots.length ? "" : shot.alt} draggable="false" />
          <figcaption>{shot.label}</figcaption>
        </figure>
      ))}
    </div>
  );
}
