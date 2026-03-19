"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap-init";
import { Github, Linkedin } from "lucide-react";

const LINE1 = "daniel igoshin";
const LINE2 = "software engineer, columbia '27";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [charIndex, setCharIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [showLinks, setShowLinks] = useState(false);
  const totalChars = LINE1.length + LINE2.length;

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), 500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!started) return;
    if (charIndex >= totalChars) {
      const t = setTimeout(() => setShowLinks(true), 300);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCharIndex((i) => i + 1), 30);
    return () => clearTimeout(t);
  }, [started, charIndex, totalChars]);

  useEffect(() => {
    if (!showLinks) return;
    gsap.fromTo(
      ".hero__links",
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
    );
  }, [showLinks]);

  const display1 = LINE1.slice(0, Math.min(charIndex, LINE1.length));
  const display2 =
    charIndex > LINE1.length
      ? LINE2.slice(0, charIndex - LINE1.length)
      : "";
  const cursorOnLine1 = charIndex <= LINE1.length;

  return (
    <section ref={sectionRef} className="hero" id="hero">
      <div className="hero__terminal">
        <span className="hero__line">
          <span className="hero__prompt">&gt;</span>
          {display1}
          {cursorOnLine1 && <span className="hero__cursor" />}
        </span>
        <span className="hero__line hero__sub">
          {display2}
          {!cursorOnLine1 && charIndex < totalChars && (
            <span className="hero__cursor" />
          )}
        </span>
      </div>

      {showLinks && (
        <div className="hero__links">
          <a
            href="https://github.com/Xeryto"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--primary"
            data-cursor-label="view github"
          >
            <Github size={16} />
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/digoshin"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--ghost"
            data-cursor-label="view linkedin"
          >
            <Linkedin size={16} />
            LinkedIn
          </a>
        </div>
      )}
    </section>
  );
}
