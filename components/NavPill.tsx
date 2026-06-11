"use client";

import { useLayoutEffect, useRef, useState } from "react";

export type View = "work" | "about" | "resume";

const ITEMS: { id: View; label: string }[] = [
  { id: "work", label: "Work" },
  { id: "about", label: "About" },
  { id: "resume", label: "Resume" },
];

interface NavPillProps {
  active: View;
  onChange: (view: View) => void;
}

export default function NavPill({ active, onChange }: NavPillProps) {
  const itemRefs = useRef<Map<View, HTMLButtonElement>>(new Map());
  const [indicator, setIndicator] = useState({ x: 0, width: 0 });

  useLayoutEffect(() => {
    const measure = () => {
      const el = itemRefs.current.get(active);
      if (el) setIndicator({ x: el.offsetLeft, width: el.offsetWidth });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active]);

  return (
    <nav className="nav-pill glass" aria-label="Main navigation">
      <span
        className="nav-pill__indicator"
        style={{
          transform: `translateX(${indicator.x}px)`,
          width: indicator.width,
        }}
        aria-hidden="true"
      />
      {ITEMS.map(({ id, label }) => (
        <button
          key={id}
          ref={(el) => {
            if (el) itemRefs.current.set(id, el);
          }}
          className={`nav-pill__item${active === id ? " nav-pill__item--active" : ""}`}
          onClick={() => onChange(id)}
          aria-current={active === id ? "page" : undefined}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
