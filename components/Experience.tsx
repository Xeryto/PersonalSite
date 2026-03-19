"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-init";

const experiences = [
  {
    role: "Software Engineering Intern",
    company: "Intuit Mailchimp — SRE, Full-Stack",
    date: "May – Aug 2025",
    location: "Atlanta, GA",
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
    location: "New York, NY",
    bullets: [
      "Enhanced Flask REST API with automated email triggers and event filtering, growing active users by 10.5% within the first month (4,825 → 5,333).",
      "Integrated Gmail API with OAuth2 for automated notifications and refactored backend search logic for multi-day events and timezone handling.",
    ],
  },
  {
    role: "Machine Learning Engineering Intern",
    company: "Resola (startup)",
    date: "May – Jun 2022",
    location: "Moscow, Russia",
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
      gsap.utils.toArray<HTMLElement>(".timeline__item").forEach((item, i) => {
        gsap.from(item, {
          opacity: 0,
          y: 50,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: item,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="section" id="experience">
      <div className="section__label">Experience</div>
      <div className="section__title">Where I&apos;ve honed my craft.</div>
      <div className="timeline">
        {experiences.map((exp, i) => (
          <div className="timeline__item" key={i}>
            <div className="timeline__dot" />
            <div className="timeline__header">
              <span className="timeline__role">{exp.role}</span>
              <span className="timeline__date">{exp.date}</span>
            </div>
            <div className="timeline__company">{exp.company}</div>
            <ul className="timeline__bullets">
              {exp.bullets.map((b, j) => (
                <li className="timeline__bullet" key={j}>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
