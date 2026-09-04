import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/arcade/site-header";

export const Route = createFileRoute("/stack")({ component: StackPage });

const ROWS = [
  {
    name: "GitHub",
    status: "Linked",
    detail: "Tinker-Dwarf/tinkers-arcade — source of truth. Push to main to ship.",
  },
  {
    name: "Netlify",
    status: "Live",
    detail: "tinker-arcade.netlify.app — current public host. Add custom domains here first.",
  },
  {
    name: "Vercel",
    status: "Waiting",
    detail: "Connector is on, but the Forge team is not visible on this login yet.",
  },
  {
    name: "Porkbun",
    status: "Standby",
    detail:
      "CNAME snake / tetris / breakout / dodge / www to tinker-arcade.netlify.app, then add those names in Netlify.",
  },
];

function StackPage() {
  return (
    <div className="grain min-h-dvh">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.28em] text-ember">Wiring</p>
        <h2 className="font-display text-5xl tracking-wide">How the stack talks</h2>
        <p className="mt-3 text-steel-2">
          Code lives on GitHub. Netlify builds from that repo. Subdomains on the Porkbun domain
          all point at the same site; the first hostname label picks the cabinet.
        </p>
        <ol className="mt-8 space-y-4">
          {ROWS.map((row, i) => (
            <li key={row.name} className="border border-soot bg-coal-2 px-4 py-4">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-mono text-[0.7rem] text-steel">0{i + 1}</span>
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-ember">
                  {row.status}
                </span>
              </div>
              <h3 className="font-display text-3xl tracking-wide">{row.name}</h3>
              <p className="mt-1 text-sm text-steel-2">{row.detail}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8 border border-soot p-4 font-mono text-xs leading-relaxed text-steel">
          <p className="text-bone">Porkbun DNS</p>
          <pre className="mt-2 overflow-x-auto whitespace-pre text-[0.7rem]">
            {`snake     CNAME  tinker-arcade.netlify.app
tetris    CNAME  tinker-arcade.netlify.app
breakout  CNAME  tinker-arcade.netlify.app
dodge     CNAME  tinker-arcade.netlify.app
www       CNAME  tinker-arcade.netlify.app`}
          </pre>
        </div>
      </main>
    </div>
  );
}
