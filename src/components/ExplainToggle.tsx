"use client";

import { useId, useState, type ReactNode } from "react";

export type ExplainLabel = "Why am I seeing this?" | "What does this mean?" | "What could go wrong?";

export function ExplainToggle({ label, children }: { label: ExplainLabel; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="explain">
      <button
        className="btn btn-ghost"
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
      >
        {label}
      </button>
      {open ? (
        <div className="callout" id={panelId}>
          {children}
        </div>
      ) : null}
    </div>
  );
}
