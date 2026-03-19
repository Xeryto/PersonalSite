"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-init";
import { scrambleText } from "@/lib/text-effects";
import TechConstellation from "./TechConstellation";

export default function TechStack() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const title = sectionRef.current?.querySelector(
        ".section__title"
      ) as HTMLElement | null;
      if (title) {
        const text = title.textContent || "";
        title.textContent = "";
        ScrollTrigger.create({
          trigger: title,
          start: "top 85%",
          once: true,
          onEnter: () => scrambleText(title, text),
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="section" id="stack">
      <div className="section__label">Tech Stack</div>
      <div className="section__title">Languages I speak.</div>
      <TechConstellation />
    </section>
  );
}
