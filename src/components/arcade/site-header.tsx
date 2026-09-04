import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="flex items-end justify-between gap-4 border-b border-soot px-5 py-5 sm:px-8">
      <Link to="/" className="group min-w-0">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.38em] text-ember">
          Coal & steel
        </p>
        <h1 className="font-display text-4xl leading-none tracking-wide text-bone sm:text-5xl">
          Tinker's Arcade
        </h1>
      </Link>
      <nav className="flex shrink-0 items-center gap-5 font-mono text-[0.7rem] uppercase tracking-[0.22em] text-steel">
        <Link to="/" className="hover:text-bone">
          Floor
        </Link>
        <Link to="/stack" className="hover:text-bone">
          Stack
        </Link>
      </nav>
    </header>
  );
}
