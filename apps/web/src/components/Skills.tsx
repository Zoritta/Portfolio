import type { Skill } from "@/lib/api";
import { EmptyState } from "@/components/EmptyState";

/**
 * Display-only regrouping: the DB's 11 categories (used verbatim in the FitAnalyzer's
 * RAG embeddings) are too granular for the UI, so they're folded into 5 broader groups
 * here without touching the underlying data.
 */
const DISPLAY_GROUPS: { label: string; categories: string[] }[] = [
  { label: "Frontend", categories: ["Languages", "Frontend", "State Management", "Data Visualisation"] },
  { label: "AI & LLM Engineering", categories: ["AI & LLM Engineering"] },
  { label: "Backend & Data", categories: ["Backend", "Databases"] },
  { label: "Cloud & DevOps", categories: ["Cloud & DevOps", "Security"] },
  { label: "Testing & Collaboration", categories: ["Testing & QA", "Design & Collaboration"] },
];

function groupForDisplay(skills: Skill[]) {
  const groups = DISPLAY_GROUPS.map(({ label, categories }) => ({
    label,
    skills: skills.filter((skill) => categories.includes(skill.category)),
  }));
  return groups.filter((group) => group.skills.length > 0);
}

export function Skills({ skills }: { skills: Skill[] }) {
  const skillGroups = groupForDisplay(skills);

  return (
    <section id="skills" className="scroll-mt-24">
      <span className="text-xs font-medium uppercase tracking-wide text-accent">Toolkit</span>
      <h2 className="mt-1 text-2xl font-semibold tracking-tight text-black dark:text-zinc-50 sm:text-3xl">
        Skills
      </h2>
      {skills.length === 0 ? (
        <EmptyState message="No skills listed yet." />
      ) : (
        <div className="mt-4 flex flex-col gap-5">
          {skillGroups.map((group) => (
            <div key={group.label}>
              <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{group.label}</h3>
              <ul className="mt-2 flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <li
                    key={skill.id}
                    className="rounded-full bg-accent-solid px-3 py-1 text-xs font-medium text-white"
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
  );
}
