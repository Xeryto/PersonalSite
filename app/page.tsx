"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap-init";
import CustomCursor from "@/components/CustomCursor";
import HeaderBar from "@/components/HeaderBar";
import NavPill, { type View } from "@/components/NavPill";
import WorkSphere from "@/components/WorkSphere";
import AboutView from "@/components/AboutView";
import ResumeView from "@/components/ResumeView";
import ProjectOverlay from "@/components/ProjectOverlay";
import FilterPanel from "@/components/FilterPanel";
import type { Project, Theme } from "@/lib/projects";

const VIEWS: View[] = ["work", "about", "resume"];

export default function Home() {
  const [view, setView] = useState<View>("work");
  const [selected, setSelected] = useState<Project | null>(null);
  const [themes, setThemes] = useState<Theme[]>([]);
  const viewWrapRef = useRef<HTMLDivElement>(null);
  const transitioning = useRef(false);

  // deep link via hash
  useEffect(() => {
    const h = window.location.hash.replace("#", "") as View;
    if (VIEWS.includes(h)) setView(h);
  }, []);

  // glass refraction: Chromium renders url() in backdrop-filter, Safari doesn't
  useEffect(() => {
    if ("chrome" in window) document.documentElement.classList.add("refract");
  }, []);

  // animate incoming view
  useEffect(() => {
    const el = viewWrapRef.current;
    if (view === "work" || !el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    gsap.fromTo(
      el,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", delay: 0.08 }
    );
  }, [view]);

  const changeView = (next: View) => {
    if (next === view || transitioning.current) return;
    history.replaceState(null, "", `#${next}`);
    setSelected(null);

    const el = viewWrapRef.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (view !== "work" && el && !reduced) {
      transitioning.current = true;
      gsap.to(el, {
        opacity: 0,
        y: -16,
        duration: 0.35,
        ease: "power2.in",
        onComplete: () => {
          transitioning.current = false;
          setView(next);
        },
      });
    } else {
      setView(next);
    }
  };

  const sphereMode =
    view !== "work" ? "hidden" : selected ? "dimmed" : "active";

  return (
    <>
      {/* displacement map for the liquid-glass refraction (Chromium) */}
      <svg
        aria-hidden="true"
        style={{ position: "absolute", width: 0, height: 0 }}
      >
        <filter id="glass-distort" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.008 0.014"
            numOctaves="2"
            seed="7"
            result="noise"
          />
          <feGaussianBlur in="noise" stdDeviation="2" result="map" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="map"
            scale="26"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

      <div className="noise-overlay" aria-hidden="true" />
      <div className="top-fade" aria-hidden="true" />
      <CustomCursor />
      <HeaderBar />

      <WorkSphere
        activeThemes={themes}
        mode={sphereMode}
        onSelect={setSelected}
      />

      {view === "work" && !selected && (
        <div className="work-hint">Drag to explore</div>
      )}

      {view !== "work" && (
        <main key={view} ref={viewWrapRef} className="view">
          <div className="view__inner">
            {view === "about" ? <AboutView /> : <ResumeView />}
          </div>
        </main>
      )}

      {view === "work" && <FilterPanel active={themes} onChange={setThemes} />}

      <NavPill active={view} onChange={changeView} />

      {selected && (
        <ProjectOverlay project={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
