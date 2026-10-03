export function SectionEyebrow({ number, label }: { number: string; label: string }) {
  return (
    <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-accent">
      <span className="text-zinc-500 dark:text-zinc-400">{number}</span>
      <span aria-hidden="true">/</span>
      <span>{label}</span>
    </span>
  );
}
