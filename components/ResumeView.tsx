"use client";

import { useEffect, useRef } from "react";
import { FileDown, ExternalLink } from "lucide-react";
import { scrambleText } from "@/lib/text-effects";

const RESUME_PATH = "/Daniel_Igoshin_Resume.pdf";

export default function ResumeView() {
  const labelRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (labelRef.current) scrambleText(labelRef.current, "RESUME", 500);
  }, []);

  return (
    <>
      <p ref={labelRef} className="view__label">
        RESUME
      </p>
      <div className="resume__actions">
        <h1 className="view__title" style={{ marginBottom: 0 }}>
          Resume.
        </h1>
        <a href={RESUME_PATH} download className="btn btn--primary">
          <FileDown size={16} /> Download PDF
        </a>
      </div>

      <div className="resume__frame">
        <iframe
          src={`${RESUME_PATH}#toolbar=0&navpanes=0`}
          title="Daniel Igoshin — Resume"
          className="resume__iframe"
        />
      </div>

      <div className="resume__fallback">
        <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
          The inline viewer doesn&apos;t work well on small screens — open or
          download the PDF instead.
        </p>
        <a
          href={RESUME_PATH}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn--ghost"
        >
          <ExternalLink size={16} /> Open in new tab
        </a>
      </div>
    </>
  );
}
