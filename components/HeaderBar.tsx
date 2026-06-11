"use client";

import ClockWidget from "@/components/ClockWidget";

export default function HeaderBar() {
  return (
    <header className="header">
      <div className="header__brand">
        <span className="header__name">Daniel Igoshin</span>
        <span className="header__role">Software Engineer</span>
      </div>
      <div className="header__meta">
        <p className="header__tagline">
          CS @ Columbia University — building backend systems, tools, and the
          occasional sphere.
        </p>
        <ClockWidget />
      </div>
    </header>
  );
}
