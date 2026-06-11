"use client";

import { useEffect, useRef } from "react";
import { Github, Linkedin, Mail } from "lucide-react";
import { scrambleText } from "@/lib/text-effects";

const EXPERIENCE = [
  {
    role: "Software Engineering Intern — SRE, Full-Stack",
    company: "Intuit Mailchimp",
    date: "MAY — AUG 2025",
    desc: "Automated CI/CD quality-gate failure triage with a Dockerized Go CLI, cutting mean time to detect production incidents by 61%. Led a GCP → AWS migration for a tool used by all 610 engineers in the BU, and redesigned a database schema from 60 to 2 tables, reducing peak request volume by 40–60%.",
  },
  {
    role: "Backend Software Engineering Intern",
    company: "The Bulletin",
    date: "OCT 2023 — JUN 2024",
    desc: "Enhanced a Flask REST API with automated email triggers and event filtering, growing active users 10.5% in a month. Integrated the Gmail API with OAuth2 and refactored search for multi-day events and timezone localization.",
  },
  {
    role: "Machine Learning Engineering Intern",
    company: "Resola",
    date: "MAY — JUN 2022",
    desc: "Built an ML model automating patient feedback with NumPy, Pandas, and Scikit-Learn, cutting manual processing 40%. Analyzed body-sensor data across four workout sessions, improving predictive accuracy 30% for 200+ patients.",
  },
];

export default function AboutView() {
  const labelRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (labelRef.current) scrambleText(labelRef.current, "ABOUT", 500);
  }, []);

  return (
    <>
      <p ref={labelRef} className="view__label">
        ABOUT
      </p>
      <h1 className="view__title">A bit about me.</h1>
      <p className="about__bio">
        I&apos;m a <strong>Computer Science student at Columbia University</strong>{" "}
        (3.95 GPA) and I spend most of my time building backend systems and
        figuring out why things break in production. At{" "}
        <strong>Intuit Mailchimp</strong> I automated CI/CD failure triage, at{" "}
        <strong>Resola</strong> I built ML models that cut manual processing by
        40%, and somewhere along the way I got comfortable working across
        backend engineering, SRE, and applied ML. Code I&apos;ve written is
        used by <strong>610+ engineers</strong> and thousands of end users.
        Home is two cities at once — Moscow and New York.
      </p>

      <section className="about__section">
        <p className="view__label">EXPERIENCE</p>
        {EXPERIENCE.map((exp) => (
          <div key={exp.company} className="exp-item">
            <span className="exp-item__date">{exp.date}</span>
            <div>
              <h2 className="exp-item__role">{exp.role}</h2>
              <p className="exp-item__company">{exp.company}</p>
              <p className="exp-item__desc">{exp.desc}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="about__section">
        <p className="view__label">CONTACT</p>
        <div className="about__links">
          <a
            href="https://github.com/Xeryto"
            target="_blank"
            rel="noopener noreferrer"
            className="about__link"
          >
            <Github size={15} /> GitHub
          </a>
          <a
            href="https://linkedin.com/in/digoshin"
            target="_blank"
            rel="noopener noreferrer"
            className="about__link"
          >
            <Linkedin size={15} /> LinkedIn
          </a>
          <a href="mailto:d.igoshin@columbia.edu" className="about__link">
            <Mail size={15} /> d.igoshin@columbia.edu
          </a>
        </div>
      </section>

      <p className="view__label">&copy; 2026 DANIEL IGOSHIN</p>
    </>
  );
}
