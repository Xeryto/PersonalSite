"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-init";
import { ExternalLink } from "lucide-react";

const projects = [
  {
    title: "Quillin'",
    desc: "AI-powered handwriting-to-digital-notes app. Converts handwritten notes to LaTeX markdown with 95% accuracy using OCR and LLM clarification.",
    tech: ["Swift", "FastAPI", "Google Vision API", "MathPix", "LLaMA (Groq)"],
    url: "https://github.com/Quillin-Writing-App/backend",
    gradient: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
  },
  {
    title: "PricelessEdu",
    desc: "Full-stack Learning Management System deployed on AWS EC2. Hit 800+ monthly signups with 99.9% uptime serving 3,000+ active users.",
    tech: ["C#", "ASP.NET", "Entity Framework", "MongoDB", "AWS EC2"],
    url: "https://github.com/Xeryto/Priceless",
    gradient: "linear-gradient(135deg, #059669 0%, #0284c7 100%)",
  },
  {
    title: "PolkaMono",
    desc: "Cross-platform fashion app ecosystem monorepo. Includes a React Native mobile app, a web frontend, and a dedicated Python ASGI backend.",
    tech: ["TypeScript", "React Native", "React", "Python", "FastAPI"],
    url: "https://github.com/Xeryto/PolkaMono",
    gradient: "linear-gradient(135deg, #34d399 0%, #2dd4bf 100%)",
  },
  {
    title: "subitupExtension",
    desc: "Browser extension built with TypeScript and deployed via GitHub Pages. Extends web browsing workflows with custom tooling.",
    tech: ["TypeScript", "Chrome APIs", "GitHub Pages"],
    url: "https://github.com/Xeryto/subitupExtension",
    gradient: "linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)",
  },
];

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".project-card").forEach((card) => {
        const visual = card.querySelector(".project-card__visual");

        gsap.from(card, {
          opacity: 0,
          y: 60,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });

        // Parallax on the visual
        if (visual) {
          gsap.from(visual, {
            y: 30,
            duration: 1,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          });
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="section" id="projects">
      <div className="section__label">Projects</div>
      <div className="section__title">Things I&apos;ve built.</div>
      <div className="projects__grid">
        {projects.map((p, i) => (
          <div className="project-card" key={i}>
            <div className="project-card__visual">
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: p.gradient,
                  opacity: 0.8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "var(--text-3xl)",
                  fontWeight: 800,
                  color: "rgba(255,255,255,0.15)",
                  letterSpacing: "-0.03em",
                }}
              >
                {p.title}
              </div>
            </div>
            <div className="project-card__info">
              <h3 className="project-card__title">{p.title}</h3>
              <p className="project-card__desc">{p.desc}</p>
              <div className="project-card__tech">
                {p.tech.map((t) => (
                  <span className="tech-pill" key={t}>
                    {t}
                  </span>
                ))}
              </div>
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="project-card__link"
                data-hoverable
              >
                View on GitHub <ExternalLink size={14} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
