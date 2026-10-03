import Image from "next/image";
import { ArchitectureFlow } from "@/components/ArchitectureFlow";

const SCREENSHOT_PROJECTS: Record<string, { src: string; alt: string }> = {
  "AI-Powered Developer Portfolio (this site)": {
    src: "/projects/fit-analyzer.png",
    alt: "Job Fit Analyzer showing a match score, cited strengths, and gap analysis for a pasted job description",
  },
};

const DIAGRAM_PROJECTS = new Set(["AI-Integrated Creative Assistant"]);

export function ProjectVisual({ title }: { title: string }) {
  const screenshot = SCREENSHOT_PROJECTS[title];
  if (screenshot) {
    return (
      <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
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
      <div className="mt-4">
        <ArchitectureFlow />
      </div>
    );
  }

  return null;
}
