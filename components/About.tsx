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
      <div className="section__title">Building software that scales.</div>
      <p className="about__text">
        I&apos;m a <strong>Computer Science student at Columbia University</strong> (3.95
        GPA) with a passion for engineering systems that are fast, reliable, and
        impactful. From automating CI/CD triage at{" "}
        <strong>Intuit Mailchimp</strong> to building ML models that cut manual
        processing by 40%, I thrive at the intersection of{" "}
        <strong>backend engineering, SRE, and applied ML</strong>. I&apos;ve
        shipped code used by 610+ engineers, 5,000+ users, and 800+ monthly
        signups. I care about writing clean systems that solve real
        problems&mdash;and I love the craft.
      </p>
    </section>
  );
}
