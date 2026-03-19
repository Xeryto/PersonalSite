"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-init";

const stats = [
  { number: "268K+", label: "Lines of Code" },
  { number: "24", label: "Repositories" },
  { number: "3.95", label: "GPA" },
  { number: "3", label: "Internships" },
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".about__text", {
        opacity: 0,
        y: 40,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".about__text",
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });

      gsap.from(".stat-card", {
        opacity: 0,
        y: 30,
        scale: 0.95,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".about__stats",
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="section" id="about">
      <div className="section__label">About</div>
      <div className="section__title">Building software that scales.</div>
      <div className="about__content">
        <p className="about__text">
          I&apos;m a <strong>Computer Science student at Columbia University</strong> with
          a passion for engineering systems that are fast, reliable, and
          impactful. From automating CI/CD triage at{" "}
          <strong>Intuit Mailchimp</strong> to building ML models that cut
          manual processing by 40%, I thrive at the intersection of{" "}
          <strong>backend engineering, SRE, and applied ML</strong>. I&apos;ve
          shipped code used by 610+ engineers, 5,000+ users, and 800+ monthly
          signups. I care about writing clean systems that solve real
          problems—and I love the craft.
        </p>
        <div className="about__stats">
          {stats.map((s) => (
            <div className="stat-card" key={s.label}>
              <div className="stat-card__number">{s.number}</div>
              <div className="stat-card__label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
