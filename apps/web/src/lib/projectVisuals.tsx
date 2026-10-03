import type { ReactNode } from "react";
import { ArchitectureFlow } from "@/components/ArchitectureFlow";

const DIAGRAM_PROJECTS = new Set(["AI-Integrated Creative Assistant"]);

/** Server-only: resolves to a diagram, or null, depending on what's available for this project. */
export function getProjectVisual(title: string): ReactNode | null {
  if (DIAGRAM_PROJECTS.has(title)) {
    return (
      <div key="architecture-flow" className="mt-4">
        <ArchitectureFlow />
      </div>
    );
  }

  return null;
}
