"use client";

import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import TechStack from "@/components/TechStack";
import Contact from "@/components/Contact";
import CustomCursor from "@/components/CustomCursor";
import ShaderBackground from "@/components/ShaderBackground";
import { initSmoothScroll } from "@/lib/gsap-init";

export default function Home() {
  useEffect(() => {
    const cleanup = initSmoothScroll();
    return cleanup;
  }, []);

  return (
    <>
      <ShaderBackground />
      <div className="noise-overlay" aria-hidden="true" />
      <CustomCursor />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Experience />
        <Projects />
        <TechStack />
        <Contact />
      </main>
      <footer className="footer">
        &copy; 2026 Daniel Igoshin
      </footer>
    </>
  );
}
