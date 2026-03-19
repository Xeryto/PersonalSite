"use client";

import { useEffect, useRef, useState } from "react";

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScroll = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      setScrolled(current > 50);
      setHidden(current > 200 && current > lastScroll.current);
      lastScroll.current = current;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      ref={navRef}
      className={`navbar ${scrolled ? "scrolled" : ""} ${hidden ? "hidden" : ""}`}
    >
      <a
        className="navbar__logo"
        onClick={() => scrollTo("hero")}
        style={{ cursor: "pointer" }}
      >
        DI
      </a>
      <ul className="navbar__links">
        {["about", "experience", "projects", "stack", "contact"].map((id) => (
          <li key={id}>
            <a
              className="navbar__link"
              onClick={() => scrollTo(id)}
              style={{ cursor: "pointer" }}
            >
              {id.charAt(0).toUpperCase() + id.slice(1)}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
