"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-init";
import { Github, Linkedin, Mail, FileDown } from "lucide-react";

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".contact__title", {
        opacity: 0,
        y: 40,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".contact__title",
          start: "top 85%",
          once: true,
        },
      });

      gsap.from(".contact__sub", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".contact__sub",
          start: "top 85%",
          once: true,
        },
      });

      ScrollTrigger.create({
        trigger: ".contact__links",
        start: "top 90%",
        once: true,
        onEnter: () => {
          gsap.fromTo(
            ".contact__link",
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              stagger: 0.1,
              ease: "power3.out",
            }
          );
        },
      });

      gsap.from(".contact__resume", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".contact__resume",
          start: "top 85%",
          once: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="section contact" id="contact">
      <h2 className="contact__title">Get in touch.</h2>
      <p className="contact__sub">
        Looking for internships and happy to chat about
        interesting problems.
      </p>
      <div className="contact__links">
        <a
          href="https://github.com/Xeryto"
          target="_blank"
          rel="noopener noreferrer"
          className="contact__link"
          data-cursor-label="view github"
        >
          <Github size={18} />
          GitHub
        </a>
        <a
          href="https://linkedin.com/in/digoshin"
          target="_blank"
          rel="noopener noreferrer"
          className="contact__link"
          data-cursor-label="view linkedin"
        >
          <Linkedin size={18} />
          LinkedIn
        </a>
        <a
          href="mailto:d.igoshin@columbia.edu"
          className="contact__link"
          data-cursor-label="email me"
        >
          <Mail size={18} />
          d.igoshin@columbia.edu
        </a>
      </div>

      <div className="contact__resume">
        <div className="contact__resume-header">
          <span className="contact__resume-label">Resume</span>
          <a
            href="/Daniel_Igoshin_Resume.pdf"
            download
            className="contact__resume-download"
            data-cursor-label="download"
          >
            <FileDown size={16} />
            Download PDF
          </a>
        </div>
        <div className="contact__resume-viewer">
          <iframe
            src="/Daniel_Igoshin_Resume.pdf"
            className="contact__resume-iframe"
            title="Resume"
          />
        </div>
      </div>
    </section>
  );
}
