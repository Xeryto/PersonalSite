"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

let currentVelocity = 0;

export function getScrollVelocity(): number {
  return currentVelocity;
}

export function initSmoothScroll(): () => void {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  lenis.on("scroll", (e: { velocity: number }) => {
    currentVelocity = e.velocity;
    ScrollTrigger.update();
  });

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  return () => {
    lenis.destroy();
    gsap.ticker.remove(lenis.raf as unknown as gsap.TickerCallback);
  };
}

export { gsap, ScrollTrigger };
