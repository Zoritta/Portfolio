import type { Project } from "@/lib/api";
import { EmptyState } from "@/components/EmptyState";
import { ProjectCard } from "@/components/ProjectCard";

export function Projects({ projects }: { projects: Project[] }) {
  return (
    <section id="projects" className="scroll-mt-24">
      <span className="text-xs font-medium uppercase tracking-wide text-accent">Work</span>
      <h2 className="mt-1 text-2xl font-semibold tracking-tight text-black dark:text-zinc-50 sm:text-3xl">
        Projects
      </h2>
      {projects.length === 0 ? (
        <EmptyState message="No projects listed yet — check back soon." />
      ) : (
        <div className="mt-4 flex flex-col gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </section>
  );
}
