"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-init";
import { scrambleText } from "@/lib/text-effects";

export default function About() {
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

      gsap.from(".about__text", {
        opacity: 0,
        y: 40,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".about__text",
          start: "top 85%",
          once: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="section" id="about">
      <div className="section__label">About</div>
      <div className="section__title">A bit about me.</div>
      <p className="about__text">
        I&apos;m a <strong>Computer Science student at Columbia University</strong> (3.95
        GPA) and I spend most of my time building backend systems and
        figuring out why things break in production. At{" "}
        <strong>Intuit Mailchimp</strong> I automated CI/CD failure triage, at
        Resola I built ML models that cut manual processing by 40%, and
        somewhere along the way I got comfortable working across{" "}
        <strong>backend engineering, SRE, and applied ML</strong>. Code I&apos;ve
        written is used by 610+ engineers and thousands of end users.
      </p>
    </section>
  );
}
