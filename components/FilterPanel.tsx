"use client";

import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { gsap } from "@/lib/gsap-init";
import { projects, THEMES, type Theme } from "@/lib/projects";

interface FilterPanelProps {
  active: Theme[];
  onChange: (themes: Theme[]) => void;
}

const COUNTS = THEMES.map(({ id, label }) => ({
  id,
  label,
  count: projects.filter((p) => p.themes.includes(id)).length,
}));

export default function FilterPanel({ active, onChange }: FilterPanelProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || !open) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced) {
      gsap.fromTo(
        panel,
        { opacity: 0, y: 10, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "expo.out" }
      );
    }
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggleTheme = (id: Theme) => {
    onChange(
      active.includes(id) ? active.filter((t) => t !== id) : [...active, id]
    );
  };

  return (
    <div ref={rootRef} className="filter">
      {open && (
        <div ref={panelRef} className="filter__panel glass" role="menu">
          <button
            className={`filter__option${active.length === 0 ? " filter__option--active" : ""}`}
            onClick={() => onChange([])}
            role="menuitemradio"
            aria-checked={active.length === 0}
          >
            <span className="filter__option-label">All</span>
            <span className="filter__option-count">{projects.length}</span>
          </button>
          {COUNTS.map(({ id, label, count }) => (
            <button
              key={id}
              className={`filter__option${active.includes(id) ? " filter__option--active" : ""}`}
              onClick={() => toggleTheme(id)}
              role="menuitemcheckbox"
              aria-checked={active.includes(id)}
            >
              <span className="filter__option-label">{label}</span>
              <span className="filter__option-count">{count}</span>
            </button>
          ))}
        </div>
      )}
      <button
        className={`filter__toggle glass${open ? " filter__toggle--open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <SlidersHorizontal size={14} />
        Filter
        {active.length > 0 && (
          <span className="filter__count">{active.length}</span>
        )}
      </button>
    </div>
  );
}
