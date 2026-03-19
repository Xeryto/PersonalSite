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
          toggleActions: "play none none reverse",
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
          toggleActions: "play none none reverse",
        },
      });

      gsap.from(".contact__link", {
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".contact__links",
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="section contact" id="contact">
      <h2 className="contact__title">Let&apos;s connect.</h2>
      <p className="contact__sub">
        Open to internship opportunities, collaborations, and interesting
        conversations.
      </p>
      <div className="contact__links">
        <a
          href="https://github.com/Xeryto"
          target="_blank"
          rel="noopener noreferrer"
          className="contact__link"
          data-hoverable
        >
          <Github size={18} />
          GitHub
        </a>
        <a
          href="https://linkedin.com/in/digoshin"
          target="_blank"
          rel="noopener noreferrer"
          className="contact__link"
          data-hoverable
        >
          <Linkedin size={18} />
          LinkedIn
        </a>
        <a
          href="mailto:d.igoshin@columbia.edu"
          className="contact__link"
          data-hoverable
        >
          <Mail size={18} />
          d.igoshin@columbia.edu
        </a>
        <a
          href="/Daniel_Igoshin_Resume.pdf"
          download
          className="contact__link"
          data-hoverable
        >
          <FileDown size={18} />
          Resume
        </a>
      </div>
    </section>
  );
}
