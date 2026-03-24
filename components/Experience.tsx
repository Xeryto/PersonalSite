"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-init";
import { scrambleText } from "@/lib/text-effects";

const experiences = [
  {
    role: "Software Engineering Intern",
    company: "Intuit Mailchimp — SRE, Full-Stack",
    date: "May – Aug 2025",
    bullets: [
      "Built a Dockerized Go CLI that automated CI/CD Quality Gate failure triage, reducing Mean Time To Detect production incidents by 61%.",
      "Led a critical GCP → AWS migration for a tool used by all 610 engineers, transferring 5,219 test accounts on schedule.",
      "Redesigned the database schema from 60 to 2 normalized tables, cutting peak request volume by 40–60% and speeding average response times by 25–45%.",
    ],
  },
  {
    role: "Backend Engineering Intern",
    company: "The Bulletin",
    date: "Oct 2023 – Jun 2024",
    bullets: [
      "Enhanced Flask REST API with automated email triggers and event filtering, growing active users by 10.5% within the first month (4,825 → 5,333).",
      "Integrated Gmail API with OAuth2 for automated notifications and refactored backend search logic for multi-day events and timezone handling.",
    ],
  },
  {
    role: "Machine Learning Engineering Intern",
    company: "Resola (startup)",
    date: "May – Jun 2022",
    bullets: [
      "Developed a patient-feedback ML model using NumPy, Pandas, and Scikit-Learn, reducing manual processing by 40% across 50+ patients.",
      "Collected and analyzed body sensor data from four workout sessions, improving predictive accuracy by 30% for 200+ patients.",
    ],
  },
];

export default function Experience() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const title = sectionRef.current?.querySelector(
        ".section__title",
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

      const cards = gsap.utils.toArray<HTMLElement>(".exp-card");

      // Cards 0..n-2: scale + dim based on overlap with next card
      // Freeze transforms once last card unsticks to prevent gap jitter
      const lastStickyTop = 100 + (cards.length - 1) * 20;
      let frozen = false;

      ScrollTrigger.create({
        trigger: ".exp-stack",
        start: "top bottom",
        end: "bottom top",
        onUpdate: () => {
          const lastTop = cards[cards.length - 1].getBoundingClientRect().top;
          if (lastTop < lastStickyTop - 2) {
            frozen = true;
            return; // keep current transforms
          }
          frozen = false;

          cards.forEach((card, i) => {
            if (i >= cards.length - 1) return;
            const cardRect = card.getBoundingClientRect();
            const nextTop = cards[i + 1].getBoundingClientRect().top;
            const overlap = cardRect.bottom - nextTop;

            if (overlap <= 0) {
              card.style.transform = "scale(1)";
              card.style.filter = "";
              return;
            }

            const progress = Math.min(overlap / cardRect.height, 1);
            card.style.transform = `scale(${1 - progress * 0.04})`;
            card.style.filter = `brightness(${1 - progress * 0.15})`;
          });
        },
      });

      // Last card: scrub scale against the spacer (non-sticky, scrolls normally)
      const lastCard = cards[cards.length - 1];
      gsap.to(lastCard, {
        scale: 0.96,
        ease: "none",
        scrollTrigger: {
          trigger: ".exp-stack__spacer",
          start: "top bottom",
          end: "bottom bottom",
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="section" id="experience">
      <div className="section__label">Experience</div>
      <div className="section__title">Where I&apos;ve worked.</div>
      <div className="exp-stack">
        {experiences.map((exp, i) => (
          <div
            className="exp-card"
            key={i}
            style={{ top: `${100 + i * 20}px`, zIndex: i + 1 }}
          >
            <div className="exp-card__header">
              <span className="exp-card__role">{exp.role}</span>
              <span className="exp-card__date">{exp.date}</span>
            </div>
            <div className="exp-card__company">{exp.company}</div>
            <ul className="exp-card__bullets">
              {exp.bullets.map((b, j) => (
                <li className="exp-card__bullet" key={j}>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="exp-stack__spacer" aria-hidden />
      </div>
    </section>
  );
}
