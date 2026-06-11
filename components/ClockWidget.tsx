"use client";

import { useEffect, useState } from "react";

const CITIES = [
  { label: "NEW YORK, US", tz: "America/New_York" },
  { label: "MOSCOW, RU", tz: "Europe/Moscow" },
];

function formatCity(tz: string, now: Date): { time: string; offset: string } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: "shortOffset",
  }).formatToParts(now);
  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return {
    time: `${get("hour")}:${get("minute")}`,
    offset: get("timeZoneName"),
  };
}

export default function ClockWidget() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="clocks" aria-label="Local time in New York and Moscow">
      {CITIES.map(({ label, tz }) => {
        const c = now ? formatCity(tz, now) : null;
        return (
          <div key={tz} className="clock">
            <span className="clock__pulse" aria-hidden="true" />
            <span className="clock__city">{label}</span>
            <span className="clock__time">
              {c ? `${c.time} ${c.offset}` : "--:--"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
