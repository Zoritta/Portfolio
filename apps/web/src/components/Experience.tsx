import type { Experience as ExperienceEntry } from "@/lib/api";
import { EmptyState } from "@/components/EmptyState";
import { SectionEyebrow } from "@/components/SectionEyebrow";

const EDUCATION_PROVIDER = "Jensen Yrkeshögskola";

function formatDate(value: string | null) {
  if (!value) return "Present";
  return new Date(value).toLocaleDateString("en-GB", { year: "numeric", month: "short" });
}

export function Experience({ experience }: { experience: ExperienceEntry[] }) {
  return (
    <section id="experience" className="scroll-mt-24">
      <SectionEyebrow number="02" label="Background" />
      <h2 className="mt-2 text-4xl font-bold tracking-tight text-black dark:text-zinc-50 sm:text-5xl">
        Experience
      </h2>
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
                {entry.company !== EDUCATION_PROVIDER && (
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {formatDate(entry.startDate)} – {formatDate(entry.endDate)}
                  </span>
                )}
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                {entry.description}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
