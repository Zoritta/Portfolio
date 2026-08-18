import type { Skill } from "@/lib/api";
import { EmptyState } from "@/components/EmptyState";

function groupByCategory(skills: Skill[]) {
  const groups = new Map<string, Skill[]>();
  for (const skill of skills) {
    const group = groups.get(skill.category) ?? [];
    group.push(skill);
    groups.set(skill.category, group);
  }
  return groups;
}

export function Skills({ skills }: { skills: Skill[] }) {
  const skillGroups = groupByCategory(skills);

  return (
    <section id="skills" className="scroll-mt-24">
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
  );
}
