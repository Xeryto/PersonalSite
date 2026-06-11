"use client";

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { X, Github } from "lucide-react";
import { gsap } from "@/lib/gsap-init";
import type { Project } from "@/lib/projects";
import { THEMES } from "@/lib/projects";

interface ProjectOverlayProps {
  project: Project;
  onClose: () => void;
}

export default function ProjectOverlay({
  project,
  onClose,
}: ProjectOverlayProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);

  const close = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !panel || !backdrop) {
      onClose();
      return;
    }
    const mobile = window.innerWidth <= 768;
    gsap.to(backdrop, { opacity: 0, duration: 0.3, ease: "power2.in" });
    gsap.to(panel, {
      [mobile ? "yPercent" : "xPercent"]: 100,
      duration: 0.35,
      ease: "power2.in",
      onComplete: onClose,
    });
  }, [onClose]);

  useEffect(() => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel || !backdrop) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced) {
      const mobile = window.innerWidth <= 768;
      gsap.fromTo(
        panel,
        { [mobile ? "yPercent" : "xPercent"]: 100 },
        {
          [mobile ? "yPercent" : "xPercent"]: 0,
          duration: 0.55,
          ease: "expo.out",
        }
      );
      gsap.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.4 });
    }

    const focusable = panel.querySelectorAll<HTMLElement>("a, button");
    focusable[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      } else if (e.key === "Tab" && focusable.length > 0) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  const themeLabel = (id: string) =>
    THEMES.find((t) => t.id === id)?.label ?? id;

  return (
    <>
      <div
        ref={backdropRef}
        className="overlay-backdrop"
        onClick={close}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        className="overlay"
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
      >
        <Image
          src={project.cover}
          alt={`${project.title} cover art`}
          width={960}
          height={600}
          className="overlay__cover"
          priority
        />
        <button className="overlay__close" onClick={close} aria-label="Close">
          <X size={18} />
        </button>
        <div className="overlay__body">
          <div className="overlay__meta">
            <span>{project.year}</span>
            {project.themes.map((t) => (
              <span key={t} className="overlay__tag">
                {themeLabel(t)}
              </span>
            ))}
          </div>
          <h2 className="overlay__title">{project.title}</h2>
          <p className="overlay__subtitle">{project.subtitle}</p>
          <p className="overlay__desc">{project.description}</p>
          <div className="overlay__tech">
            {project.tech.map((t) => (
              <span key={t} className="tech-pill">
                {t}
              </span>
            ))}
          </div>
          {project.github && (
            <div className="overlay__actions">
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--primary"
              >
                <Github size={16} /> View on GitHub
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
