/** RAF loop with capped delta. Never use setInterval for gameplay. */
export function startLoop(onFrame: (dt: number) => void): () => void {
  let last = performance.now();
  let raf = 0;
  const tick = (now: number) => {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    onFrame(dt);
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}
