import { getExperience, getProjects, getSkills } from "@/lib/api";
import { FitAnalyzer } from "@/components/FitAnalyzer";
import { Hero } from "@/components/Hero";
import { Nav } from "@/components/Nav";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Projects } from "@/components/Projects";
import { Experience } from "@/components/Experience";
import { Skills } from "@/components/Skills";
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
      <Nav />
      <main className="flex flex-1 flex-col items-center bg-zinc-50 px-6 py-16 font-sans dark:bg-black sm:px-16">
        <div className="flex w-full max-w-3xl flex-col gap-16">
          <Hero />

          <FitAnalyzer />

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
            <ContactForm />
          </ScrollReveal>
        </div>
      </main>
    </>
  );
}
