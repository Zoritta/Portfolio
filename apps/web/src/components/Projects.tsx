import type { Project } from "@/lib/api";
import { EmptyState } from "@/components/EmptyState";
import { ProjectCard } from "@/components/ProjectCard";
import { SectionEyebrow } from "@/components/SectionEyebrow";
import { getProjectVisual } from "@/lib/projectVisuals";

export function Projects({ projects }: { projects: Project[] }) {
  return (
    <section id="projects" className="scroll-mt-24">
      <SectionEyebrow number="01" label="Work" />
      <h2 className="mt-2 text-4xl font-bold tracking-tight text-black dark:text-zinc-50 sm:text-5xl">
        Projects
      </h2>
      {projects.length === 0 ? (
        <EmptyState message="No projects listed yet — check back soon." />
      ) : (
        <div className="mt-4 flex flex-col gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              visual={getProjectVisual(project.title)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
