"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-init";

const languages = [
  { name: "Python", pct: 52, lines: "140,321" },
  { name: "JavaScript", pct: 25, lines: "66,462" },
  { name: "TypeScript", pct: 13, lines: "35,778" },
  { name: "C#", pct: 4, lines: "11,694" },
  { name: "Go", pct: 2, lines: "~5,000" },
  { name: "Java", pct: 1, lines: "1,754" },
];

const tools = [
  "Django",
  "Flask",
  "FastAPI",
  "ASP.NET",
  "Node.js",
  "Playwright",
  "Scikit-Learn",
  "NumPy",
  "Pandas",
  "AWS",
  "GCP",
  "Docker",
  "Jenkins",
  "MongoDB",
  "PostgreSQL",
  "Git",
  "Railway",
  "REST APIs",
  "OAuth2",
  "CI/CD",
];

export default function TechStack() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".lang-bar__fill").forEach((bar) => {
        const pct = parseFloat(bar.getAttribute("data-pct") || "0") / 100;
        gsap.to(bar, {
          scaleX: pct,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: bar,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        });
      });

      gsap.from(".tool-badge", {
        opacity: 0,
        y: 15,
        scale: 0.9,
        duration: 0.5,
        stagger: 0.03,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".tools-grid",
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="section" id="stack">
      <div className="section__label">Tech Stack</div>
      <div className="section__title">Languages I speak.</div>
      <div className="tech-stack__content">
        <div className="lang-bars">
          {languages.map((lang) => (
            <div className="lang-bar" key={lang.name}>
              <div className="lang-bar__header">
                <span className="lang-bar__name">{lang.name}</span>
                <span className="lang-bar__pct">
                  {lang.lines} lines · {lang.pct}%
                </span>
              </div>
              <div className="lang-bar__track">
                <div
                  className="lang-bar__fill"
                  data-pct={lang.pct}
                  style={{ transform: "scaleX(0)" }}
                />
              </div>
            </div>
          ))}
        </div>
        <div>
          <div
            className="section__label"
            style={{ marginBottom: "var(--space-md)" }}
          >
            Frameworks & Tools
          </div>
          <div className="tools-grid">
            {tools.map((t) => (
              <span className="tool-badge" key={t} data-hoverable>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
