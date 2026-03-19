"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-init";
import { ChevronDown, Github, Linkedin } from "lucide-react";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 });

      tl.to(".hero__name-text", {
        y: 0,
        duration: 1,
        stagger: 0.12,
        ease: "power4.out",
      })
        .to(
          ".hero__tagline-text",
          {
            y: 0,
            duration: 0.8,
            ease: "power4.out",
          },
          "-=0.4"
        )
        .to(
          ".hero__cta-row-inner",
          {
            y: 0,
            duration: 0.8,
            ease: "power4.out",
          },
          "-=0.4"
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="hero" id="hero">
      <h1 className="hero__name">
        <span className="hero__name-line">
          <span className="hero__name-text">Daniel</span>
        </span>
        <span className="hero__name-line">
          <span className="hero__name-text">Igoshin</span>
        </span>
      </h1>

      <p className="hero__tagline">
        <span className="hero__tagline-text">
          Software Engineer · CS @ Columbia &apos;27
        </span>
      </p>

      <div className="hero__cta-row">
        <div className="hero__cta-row-inner">
          <a
            href="https://github.com/Xeryto"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--primary"
            data-hoverable
          >
            <Github size={16} />
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/digoshin"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--ghost"
            data-hoverable
          >
            <Linkedin size={16} />
            LinkedIn
          </a>
        </div>
      </div>

      <div className="hero__scroll-cue">
        <span>Scroll</span>
        <ChevronDown size={16} />
      </div>
    </section>
  );
}
