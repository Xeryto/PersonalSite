"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-init";
import { scrambleText } from "@/lib/text-effects";
import { ExternalLink } from "lucide-react";
import Image from "next/image";

const projects = [
  {
    title: "Quillin'",
    desc: "Turns handwritten notes into LaTeX markdown at 95% accuracy using OCR and LLM clarification. Started as a hackathon project after our team realized we all had the same problem with retyping lecture notes.",
    tech: ["Swift", "FastAPI", "Google Vision API", "MathPix", "LLaMA (Groq)"],
    url: "https://github.com/Quillin-Writing-App/backend",
    image: "/projects/quillin.png",
  },
  {
    title: "PricelessEdu",
    desc: "Learning Management System running on AWS EC2. Grew to 800+ monthly signups and 3,000+ active users with 99.9% uptime.",
    tech: ["C#", "ASP.NET", "Entity Framework", "MongoDB", "AWS EC2"],
    url: "https://github.com/Xeryto/Priceless",
    image: "/projects/pricelessedu.png",
  },
  {
    title: "PolkaMono",
    desc: "Fashion app monorepo with a React Native mobile client, web frontend, and Python ASGI backend. Currently gearing up for release.",
    tech: ["TypeScript", "React Native", "React", "Python", "FastAPI"],
    url: "https://github.com/Xeryto/PolkaMono",
    image: "/projects/polkamono.png",
  },
  {
    title: "subitupExtension",
    desc: "Chrome extension that syncs my work shifts to my calendar so I stop forgetting about them. Currently pending review on the Chrome Web Store.",
    tech: ["TypeScript", "Chrome APIs", "GitHub Pages"],
    url: "https://github.com/Xeryto/subitupExtension",
    image: "/projects/subitup.png",
  },
];

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

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

      // Horizontal scroll — desktop only
      const mm = gsap.matchMedia();
      mm.add("(min-width: 769px)", () => {
        const track = trackRef.current;
        if (!track) return;

        const totalScroll = track.scrollWidth - window.innerWidth;

        gsap.to(track, {
          x: -totalScroll,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            pin: true,
            scrub: 1,
            end: () => `+=${totalScroll}`,
            invalidateOnRefresh: true,
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="projects-section" id="projects">
      <div className="projects__header">
        <div className="section__label">Projects</div>
        <div className="section__title">Things I&apos;ve built.</div>
      </div>
      <div ref={trackRef} className="projects__track">
        {projects.map((p, i) => (
          <div className="project-card" key={i}>
            <div className="project-card__visual">
              <Image
                src={p.image}
                alt={p.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="project-card__image"
              />
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
                data-cursor-label="view project"
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
