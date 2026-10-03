import { existsSync } from "node:fs";
import { join } from "node:path";
import type { ReactNode } from "react";
import Image from "next/image";
import { ArchitectureFlow } from "@/components/ArchitectureFlow";

const SCREENSHOT_PROJECTS: Record<string, { src: string; alt: string }> = {
  "AI-Powered Developer Portfolio (this site)": {
    src: "/projects/fit-analyzer.png",
    alt: "Job Fit Analyzer showing a match score, cited strengths, and gap analysis for a pasted job description",
  },
};

const DIAGRAM_PROJECTS = new Set(["AI-Integrated Creative Assistant"]);

/** Server-only: resolves to a screenshot, a diagram, or null, depending on what's available for this project. */
export function getProjectVisual(title: string): ReactNode | null {
  const screenshot = SCREENSHOT_PROJECTS[title];
  if (screenshot && existsSync(join(process.cwd(), "public", screenshot.src))) {
    return (
      <div
        key="project-screenshot"
        className="mt-4 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800"
      >
        <Image
          src={screenshot.src}
          alt={screenshot.alt}
          width={960}
          height={540}
          className="w-full object-cover"
        />
      </div>
    );
  }

  if (DIAGRAM_PROJECTS.has(title)) {
    return (
      <div key="architecture-flow" className="mt-4">
        <ArchitectureFlow />
      </div>
    );
  }

  return null;
}
