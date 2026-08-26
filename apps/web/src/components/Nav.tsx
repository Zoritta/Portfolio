import { ThemeToggle } from "@/components/ThemeToggle";

const LINKS = [
  { href: "#projects", label: "Projects" },
  { href: "#experience", label: "Experience" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
];

export function Nav() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-[var(--background)]/80 backdrop-blur dark:border-zinc-800/80">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-6 py-4 sm:px-16">
        <a href="#" className="text-sm font-medium text-black dark:text-zinc-50">
          Zohreh Sadeghi
        </a>
        <ul className="flex gap-6 text-sm text-zinc-600 dark:text-zinc-400">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="transition-colors hover:text-accent">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <ThemeToggle />
      </div>
    </nav>
  );
}
