import { getExperience, getProjects, getSkills } from "@/lib/api";
import { FitAnalyzer } from "@/components/FitAnalyzer";
import { Hero } from "@/components/Hero";
import { Nav } from "@/components/Nav";
import { SkillsMarquee } from "@/components/SkillsMarquee";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Projects } from "@/components/Projects";
import { Experience } from "@/components/Experience";
import { Skills } from "@/components/Skills";
import { LinkedInPosts } from "@/components/LinkedInPosts";
import { ContactForm } from "@/components/ContactForm";

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

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to main content
      </a>
      <Nav />
      <main id="main-content" className="flex flex-1 flex-col items-center font-sans">
        <Hero />
        <SkillsMarquee />

        <div className="flex w-full max-w-4xl flex-col gap-32 px-6 py-24 sm:px-16 sm:py-32">
          <ScrollReveal>
            <FitAnalyzer />
          </ScrollReveal>

          <ScrollReveal>
            <Projects projects={projects} />
          </ScrollReveal>
          <ScrollReveal>
            <Experience experience={experience} />
          </ScrollReveal>
          <ScrollReveal>
            <Skills skills={skills} />
          </ScrollReveal>
          <ScrollReveal>
            <LinkedInPosts />
          </ScrollReveal>
          <ScrollReveal>
            <ContactForm />
          </ScrollReveal>
        </div>
      </main>
    </>
  );
}
