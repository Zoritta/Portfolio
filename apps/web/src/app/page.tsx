import Image from "next/image";
import { getExperience, getProjects, getSkills, type Skill } from "@/lib/api";
import { FitAnalyzer } from "@/components/FitAnalyzer";
import { ThemeToggle } from "@/components/ThemeToggle";

function formatDate(value: string | null) {
  if (!value) return "Present";
  return new Date(value).toLocaleDateString("en-GB", { year: "numeric", month: "short" });
}

function groupByCategory(skills: Skill[]) {
  const groups = new Map<string, Skill[]>();
  for (const skill of skills) {
    const group = groups.get(skill.category) ?? [];
    group.push(skill);
    groups.set(skill.category, group);
  }
  return groups;
}

function EmptyState({ message }: { message: string }) {
  return <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-500">{message}</p>;
}

export default async function Home() {
  let projects, skills, experience;
  try {
    [projects, skills, experience] = await Promise.all([
      getProjects(),
      getSkills(),
      getExperience(),
    ]);
  } catch {
    return (
      <main className="flex flex-1 items-center justify-center p-16">
        <p className="text-zinc-600 dark:text-zinc-400">
          Couldn&apos;t reach the API. Is it running on {process.env.API_URL ?? "http://localhost:3001"}?
        </p>
      </main>
    );
  }

  const skillGroups = groupByCategory(skills);

  return (
    <main className="flex flex-1 flex-col items-center bg-zinc-50 px-6 py-16 font-sans dark:bg-black sm:px-16">
      <div className="flex w-full max-w-3xl flex-col gap-16">
        <header className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Image
              src="/profile.jpg"
              alt="Zohreh Sadeghi"
              width={80}
              height={80}
              priority
              className="h-20 w-20 rounded-full object-cover ring-2 ring-zinc-200 dark:ring-zinc-800"
            />
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
                Zohreh Sadeghi
              </h1>
              <p className="mt-1 text-lg text-zinc-600 dark:text-zinc-400">
                Fullstack Developer — Malmö, Sweden
              </p>
            </div>
          </div>
          <ThemeToggle />
        </header>

        <FitAnalyzer />

        <section>
          <h2 className="text-xl font-semibold text-black dark:text-zinc-50">Projects</h2>
          {projects.length === 0 ? (
            <EmptyState message="No projects listed yet — check back soon." />
          ) : (
            <div className="mt-4 flex flex-col gap-6">
              {projects.map((project) => (
                <article
                  key={project.id}
                  className="rounded-lg border border-zinc-200 p-5 transition-shadow hover:shadow-md dark:border-zinc-800 dark:hover:shadow-zinc-900/50"
                >
                  <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                    <h3 className="font-medium text-black dark:text-zinc-50">{project.title}</h3>
                    <div className="flex gap-3 text-sm">
                      {project.repoUrl && (
                        <a
                          href={project.repoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-zinc-500 underline-offset-2 hover:text-black hover:underline dark:text-zinc-400 dark:hover:text-zinc-50"
                        >
                          Code
                        </a>
                      )}
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-zinc-500 underline-offset-2 hover:text-black hover:underline dark:text-zinc-400 dark:hover:text-zinc-50"
                        >
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
                </article>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold text-black dark:text-zinc-50">Experience</h2>
          {experience.length === 0 ? (
            <EmptyState message="No experience entries yet." />
          ) : (
            <div className="mt-4 flex flex-col gap-6">
              {experience.map((entry) => (
                <article key={entry.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <h3 className="font-medium text-black dark:text-zinc-50">
                      {entry.role} — {entry.company}
                    </h3>
                    <span className="text-sm text-zinc-500 dark:text-zinc-500">
                      {formatDate(entry.startDate)} – {formatDate(entry.endDate)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{entry.description}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold text-black dark:text-zinc-50">Skills</h2>
          {skills.length === 0 ? (
            <EmptyState message="No skills listed yet." />
          ) : (
            <div className="mt-4 flex flex-col gap-4">
              {Array.from(skillGroups.entries()).map(([category, categorySkills]) => (
                <div key={category}>
                  <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-500">{category}</h3>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {categorySkills.map((skill) => (
                      <li
                        key={skill.id}
                        className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                      >
                        {skill.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
