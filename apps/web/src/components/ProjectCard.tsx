"use client";

import { useRef, type MouseEvent } from "react";
import { Code2, ExternalLink } from "lucide-react";
import type { Project } from "@/lib/api";

export function ProjectCard({ project }: { project: Project }) {
  const cardRef = useRef<HTMLElement>(null);

  function handleMouseMove(event: MouseEvent<HTMLElement>) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--x", `${event.clientX - rect.left}px`);
    card.style.setProperty("--y", `${event.clientY - rect.top}px`);
  }

  return (
    <article
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="group relative overflow-hidden rounded-lg border border-zinc-200 p-5 transition-shadow hover:shadow-md dark:border-zinc-800 dark:hover:shadow-zinc-900/50"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(240px circle at var(--x, 50%) var(--y, 50%), var(--glow-color), transparent 70%)",
        }}
      />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
          <h3 className="font-medium text-black dark:text-zinc-50">{project.title}</h3>
          <div className="flex gap-3 text-sm">
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-zinc-500 underline-offset-2 hover:text-black hover:underline dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                <Code2 className="h-4 w-4" />
                Code
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-zinc-500 underline-offset-2 hover:text-black hover:underline dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                <ExternalLink className="h-4 w-4" />
                Live
              </a>
            )}
          </div>
        </div>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{project.description}</p>
        {project.highlights.length > 0 && (
          <ul className="mt-3 flex flex-col gap-1">
            {project.highlights.map((highlight) => (
              <li key={highlight} className="flex gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <span className="text-zinc-400 dark:text-zinc-600">–</span>
                {highlight}
              </li>
            ))}
          </ul>
        )}
        <ul className="mt-3 flex flex-wrap gap-2">
          {project.techStack.map((tech) => (
            <li
              key={tech}
              className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
            >
              {tech}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
