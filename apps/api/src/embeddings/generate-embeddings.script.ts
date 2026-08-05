import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';
import { EmbeddingsService } from './embeddings.service';
import type { Project, Skill, Experience } from '@prisma/client';

function projectContent(project: Project): string {
  return [
    project.title,
    project.description,
    `Tech stack: ${project.techStack.join(', ')}`,
    `Highlights: ${project.highlights.join('; ')}`,
  ].join('\n');
}

function skillContent(skill: Skill): string {
  return `${skill.name} — ${skill.category} skill, proficiency ${skill.proficiency}/5`;
}

function experienceContent(experience: Experience): string {
  const start = experience.startDate.toISOString().slice(0, 7);
  const end = experience.endDate ? experience.endDate.toISOString().slice(0, 7) : 'present';
  return `${experience.role} at ${experience.company} (${start} to ${end})\n${experience.description}`;
}

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);
  const embeddings = app.get(EmbeddingsService);

  const [projects, skills, experiences] = await Promise.all([
    prisma.project.findMany(),
    prisma.skill.findMany(),
    prisma.experience.findMany(),
  ]);

  // Sequential, not Promise.all: keeps us well under OpenAI rate limits.
  // With ~60 short texts on text-embedding-3-small, total cost is a fraction of a cent.
  for (const project of projects) {
    await embeddings.upsert('project', project.id, projectContent(project));
    console.log(`embedded project: ${project.title}`);
  }

  for (const skill of skills) {
    await embeddings.upsert('skill', skill.id, skillContent(skill));
    console.log(`embedded skill: ${skill.name}`);
  }

  for (const experience of experiences) {
    await embeddings.upsert('experience', experience.id, experienceContent(experience));
    console.log(`embedded experience: ${experience.role} at ${experience.company}`);
  }

  console.log(
    `Done. Embedded ${projects.length} projects, ${skills.length} skills, ${experiences.length} experiences.`,
  );

  await app.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
