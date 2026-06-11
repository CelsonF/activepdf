"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface Collaborator {
  name: string;
  color: string;
  path: readonly { x: number; y: number }[];
}

const COLLABORATORS: readonly Collaborator[] = [
  {
    name: "Rafa · eng",
    color: "bg-pf-blue",
    path: [
      { x: 0, y: 0 },
      { x: 120, y: -60 },
      { x: 40, y: 50 },
      { x: -80, y: -20 },
    ],
  },
  {
    name: "Duda · pm",
    color: "bg-emerald-600",
    path: [
      { x: 0, y: 0 },
      { x: -100, y: 40 },
      { x: 60, y: 90 },
      { x: 110, y: -30 },
    ],
  },
] as const;

/** Cursores "multiplayer" que vagam pelo hero, como num arquivo de design compartilhado. */
export function Cursors() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference) and (min-width: 768px)", () => {
      const cursors = el.querySelectorAll<HTMLElement>("[data-cursor]");
      cursors.forEach((cursor, i) => {
        const { path } = COLLABORATORS[i];
        const tl = gsap.timeline({ repeat: -1, yoyo: true, delay: i * 1.8 });
        path.forEach((point) => {
          tl.to(cursor, {
            x: point.x,
            y: point.y,
            duration: 3.2 + i,
            ease: "sine.inOut",
          });
        });
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <div ref={ref} aria-hidden className="pf-cursors hidden md:block">
      {COLLABORATORS.map((person, i) => (
        <div
          key={person.name}
          data-cursor
          className={`absolute z-20 ${i === 0 ? "right-[18%] top-[22%]" : "right-[38%] bottom-[12%]"}`}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" className="drop-shadow-sm">
            <path
              d="M1 1l4.5 12 1.8-5.2L12.5 6 1 1z"
              className={person.color === "bg-pf-blue" ? "fill-pf-blue" : "fill-emerald-600"}
            />
          </svg>
          <span
            className={`ml-3 inline-block rounded-md px-2 py-0.5 font-pfmono text-[10px] text-white ${person.color}`}
          >
            {person.name}
          </span>
        </div>
      ))}
    </div>
  );
}
