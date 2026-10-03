const BRAND_SKILLS = [
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "NestJS",
  "PostgreSQL",
  "Docker",
  "AWS",
  "Terraform",
  "Vercel AI SDK",
  "RAG",
  "Tailwind CSS",
];

/** Purely decorative branding strip — the real, structured skill list lives in the Skills section, so this is aria-hidden to avoid double-announcing it. */
export function SkillsMarquee() {
  const items = [...BRAND_SKILLS, ...BRAND_SKILLS];

  return (
    <div
      aria-hidden="true"
      className="w-full overflow-hidden border-y border-zinc-200 bg-accent-bg/40 py-4 dark:border-zinc-800 dark:bg-accent-bg/10"
    >
      <div className="marquee-track flex w-max items-center gap-10 whitespace-nowrap">
        {items.map((skill, index) => (
          <span key={`${skill}-${index}`} className="flex items-center gap-10">
            <span className="text-sm font-medium uppercase tracking-widest text-accent">{skill}</span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}
