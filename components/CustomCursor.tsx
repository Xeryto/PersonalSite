"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap-init";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "ontouchstart" in window) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring || !label) return;

    let mouseX = 0;
    let mouseY = 0;

    // Magnetic elements tracking
    const magneticEls = new Set<HTMLElement>();

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;
      label.style.left = `${mouseX + 14}px`;
      label.style.top = `${mouseY}px`;
    };

    // Ring follows with slight lag
    const updateRing = () => {
      const ringX = parseFloat(ring.style.left || "0");
      const ringY = parseFloat(ring.style.top || "0");
      ring.style.left = `${ringX + (mouseX - ringX) * 0.15}px`;
      ring.style.top = `${ringY + (mouseY - ringY) * 0.15}px`;
      requestAnimationFrame(updateRing);
    };
    const ringFrameId = requestAnimationFrame(updateRing);

    const onEnter = (e: Event) => {
      const el = e.currentTarget as HTMLElement;
      const cursorLabel = el.getAttribute("data-cursor-label");

      if (cursorLabel) {
        label.textContent = cursorLabel;
        label.style.opacity = "1";
      }

      ring.classList.add("cursor-ring--hover");
      magneticEls.add(el);
    };

    const onLeave = (e: Event) => {
      const el = e.currentTarget as HTMLElement;
      label.style.opacity = "0";
      ring.classList.remove("cursor-ring--hover");
      magneticEls.delete(el);

      // Snap back with elastic easing
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.4)",
      });
    };

    const onFrame = () => {
      // Apply magnetic pull to hovered elements
      magneticEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = mouseX - cx;
        const dy = mouseY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 80;

        if (dist < maxDist) {
          const strength = (1 - dist / maxDist) * 4;
          gsap.to(el, {
            x: dx * strength * 0.05,
            y: dy * strength * 0.05,
            duration: 0.3,
            ease: "power2.out",
            overwrite: "auto",
          });
        }
      });

      requestAnimationFrame(onFrame);
    };

    window.addEventListener("mousemove", onMouseMove);
    const frameId = requestAnimationFrame(onFrame);

    const hoverables = document.querySelectorAll(
      "[data-cursor-label], a, button"
    );
    hoverables.forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(frameId);
      cancelAnimationFrame(ringFrameId);
      hoverables.forEach((el) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
      <div ref={labelRef} className="cursor-label" />
    </>
  );
}
