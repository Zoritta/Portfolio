import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const experiences = [
  {
    company: 'Insighta Inc.',
    role: 'Fullstack Developer',
    description:
      'Delivered production features end-to-end on a two-week agile release cycle while the company doubled its client base. Built and scaled a React/TypeScript frontend (interactive dashboards, sortable data tables, dynamic filters) turning complex datasets into self-serve tools for non-technical business users. Partnered cross-functionally with product managers, UX designers, and backend engineers, shaping API design. Owned CI/CD pipelines and deployment workflows on AWS; raised engineering standards through code reviews. Stack: TypeScript, React, Next.js, Redux, Tailwind CSS, Node.js, Jest, Playwright, REST APIs, GitHub Actions, AWS.',
    startDate: new Date('2025-03-01'),
    endDate: null,
  },
  {
    company: 'Sigma Technology Embedded Networks',
    role: 'Fullstack Developer',
    description:
      'Built and shipped user interfaces for client applications on the Axis Camera Application Platform (ACAP), ramping up quickly in a specialised embedded systems domain. Delivered real-time dashboards and traffic-analysis tooling from live IoT device data, working directly with backend and firmware engineers on API integration and data flows. Managed CI/CD pipelines and refactored core code paths, improving performance and long-term maintainability.',
    startDate: new Date('2023-12-01'),
    endDate: new Date('2025-03-01'),
  },
  {
    company: 'Polestar',
    role: 'Frontend Developer (Intern)',
    description:
      'Delivered client-facing web application features in an agile, cross-functional team, with a focus on quality, usability, and clean code. Applied TDD principles and contributed to CI/CD pipeline maintenance across sprints.',
    startDate: new Date('2022-12-01'),
    endDate: new Date('2023-12-01'),
  },
  {
    company: 'Jensen Yrkeshögskola',
    role: 'System Development — Security Focus (Higher Vocational Education)',
    description:
      'Full stack application development in TypeScript, React, C#, .NET, Java, and SQLite. REST API design and implementation; client-side and server-side architecture for scalable applications.',
    startDate: new Date('2024-08-01'),
    endDate: new Date('2026-06-01'),
  },
  {
    company: 'Jensen Yrkeshögskola',
    role: 'DevOps Engineer Programme (Higher Vocational Education)',
    description:
      'Cloud system design on AWS and Azure; Kubernetes, Docker, CI/CD pipelines, Terraform and GitHub Actions. Infrastructure automation, monitoring, and observability in cloud-native environments.',
    startDate: new Date('2022-08-01'),
    endDate: new Date('2024-06-01'),
  },
];

const projects = [
  {
    title: 'AI-Integrated Creative Assistant',
    description:
      'A streaming AI agent chat feature built with the Vercel AI SDK, pairing server-side streamText with client-side useChat for token-level, real-time response rendering. Implemented five server-side tool definitions (board search, pin retrieval, colour-palette lookup, inspiration summaries) letting the model autonomously chain up to five tool-calling steps per response, integrated directly into a production-style app.',
    techStack: ['Next.js', 'TypeScript', 'Vercel AI SDK', 'OpenAI API', 'React'],
    repoUrl: null,
    liveUrl: null,
    highlights: [
      'Five chainable server-side tool definitions for agentic, multi-step responses',
      '"Save to Boards" action routes AI-generated suggestions directly into the app\'s creation flow',
      'localStorage-backed conversation persistence, synced on stream finish',
    ],
  },
  {
    title: 'AI-Powered Developer Portfolio (this site)',
    description:
      'A fullstack portfolio built as a real production system rather than a template: a Next.js/TypeScript frontend on Vercel, a standalone NestJS API on AWS ECS Fargate, and a Postgres database managed with Prisma. The flagship feature is a Job Fit Analyzer — visitors paste a job description and get a grounded fit report generated via retrieval-augmented generation (RAG) over the site\'s own project/skill/experience data, with citations, a match score, and gap analysis, rather than a generic chatbot wrapper. Includes a self-built MCP server exposing project/skill/experience data as callable tools, and is designed security-first given it accepts untrusted text into an LLM pipeline: input validation, rate limiting, and prompt-injection hardening protect the endpoint.',
    techStack: [
      'Next.js',
      'TypeScript',
      'NestJS',
      'Prisma',
      'PostgreSQL',
      'pgvector',
      'Docker',
      'AWS (ECS Fargate, RDS, Secrets Manager)',
      'Terraform',
      'GitHub Actions',
      'Vercel AI SDK',
      'OpenAI API',
      'MCP',
    ],
    repoUrl: 'https://github.com/Zoritta',
    liveUrl: null,
    highlights: [
      'Job Fit Analyzer: RAG-grounded fit report generation, not a generic chatbot',
      'Self-built MCP server exposing personal project data as agent-callable tools',
      'Dockerized NestJS API deployed to AWS ECS Fargate via Terraform-managed infra',
      'Security-first design: zod validation, rate limiting, and prompt-injection hardening around the LLM endpoint',
    ],
  },
];

const skills: { name: string; category: string; proficiency: number }[] = [
  // Languages
  { name: 'TypeScript', category: 'Languages', proficiency: 5 },
  { name: 'JavaScript (ES6+)', category: 'Languages', proficiency: 5 },
  { name: 'HTML5', category: 'Languages', proficiency: 5 },
  { name: 'CSS3', category: 'Languages', proficiency: 4 },
  { name: 'C#', category: 'Languages', proficiency: 3 },
  { name: 'Java', category: 'Languages', proficiency: 3 },

  // Frontend
  { name: 'React', category: 'Frontend', proficiency: 5 },
  { name: 'Next.js', category: 'Frontend', proficiency: 5 },
  { name: 'Component Architecture', category: 'Frontend', proficiency: 4 },
  { name: 'Responsive Design', category: 'Frontend', proficiency: 4 },
  { name: 'Accessibility (WCAG)', category: 'Frontend', proficiency: 3 },
  { name: 'Redux', category: 'State Management', proficiency: 4 },
  { name: 'React Context', category: 'State Management', proficiency: 4 },

  // Backend & APIs
  { name: 'Node.js', category: 'Backend', proficiency: 4 },
  { name: 'REST API Design', category: 'Backend', proficiency: 4 },
  { name: 'NestJS', category: 'Backend', proficiency: 2 },
  { name: 'Prisma ORM', category: 'Backend', proficiency: 2 },
  { name: 'ASP.NET / .NET', category: 'Backend', proficiency: 3 },

  // Databases
  { name: 'PostgreSQL', category: 'Databases', proficiency: 2 },
  { name: 'pgvector', category: 'Databases', proficiency: 1 },
  { name: 'SQLite', category: 'Databases', proficiency: 3 },

  // AI / LLM
  { name: 'Vercel AI SDK', category: 'AI & LLM Engineering', proficiency: 4 },
  { name: 'OpenAI API', category: 'AI & LLM Engineering', proficiency: 4 },
  { name: 'Prompt Engineering', category: 'AI & LLM Engineering', proficiency: 3 },
  { name: 'Agentic Tool-Calling', category: 'AI & LLM Engineering', proficiency: 4 },
  { name: 'Streaming AI UIs', category: 'AI & LLM Engineering', proficiency: 4 },
  { name: 'RAG (Retrieval-Augmented Generation)', category: 'AI & LLM Engineering', proficiency: 2 },
  { name: 'Model Context Protocol (MCP)', category: 'AI & LLM Engineering', proficiency: 1 },
  { name: 'Prompt-Injection Hardening', category: 'AI & LLM Engineering', proficiency: 1 },

  // Cloud & DevOps
  { name: 'AWS', category: 'Cloud & DevOps', proficiency: 3 },
  { name: 'GCP', category: 'Cloud & DevOps', proficiency: 2 },
  { name: 'Docker', category: 'Cloud & DevOps', proficiency: 3 },
  { name: 'Docker Compose', category: 'Cloud & DevOps', proficiency: 2 },
  { name: 'Kubernetes', category: 'Cloud & DevOps', proficiency: 2 },
  { name: 'Terraform (IaC)', category: 'Cloud & DevOps', proficiency: 1 },
  { name: 'AWS ECS Fargate', category: 'Cloud & DevOps', proficiency: 1 },
  { name: 'AWS RDS', category: 'Cloud & DevOps', proficiency: 1 },
  { name: 'AWS Secrets Manager', category: 'Cloud & DevOps', proficiency: 1 },
  { name: 'GitHub Actions / CI-CD', category: 'Cloud & DevOps', proficiency: 3 },

  // Security
  { name: 'Input Validation (Zod)', category: 'Security', proficiency: 2 },
  { name: 'Rate Limiting', category: 'Security', proficiency: 1 },
  { name: 'Least-Privilege IAM', category: 'Security', proficiency: 1 },

  // Testing & QA
  { name: 'Jest', category: 'Testing & QA', proficiency: 4 },
  { name: 'React Testing Library', category: 'Testing & QA', proficiency: 3 },
  { name: 'Playwright', category: 'Testing & QA', proficiency: 3 },
  { name: 'Cypress', category: 'Testing & QA', proficiency: 3 },
  { name: 'ESLint', category: 'Testing & QA', proficiency: 4 },

  // Data Visualisation
  { name: 'Chart.js', category: 'Data Visualisation', proficiency: 3 },
  { name: 'D3.js', category: 'Data Visualisation', proficiency: 2 },
  { name: 'Recharts', category: 'Data Visualisation', proficiency: 3 },

  // Design & Collaboration
  { name: 'Figma', category: 'Design & Collaboration', proficiency: 3 },
  { name: 'Agile/Scrum', category: 'Design & Collaboration', proficiency: 4 },
  { name: 'Code Reviews', category: 'Design & Collaboration', proficiency: 4 },
];

async function main() {
  for (const experience of experiences) {
    await prisma.experience.upsert({
      where: { company_role: { company: experience.company, role: experience.role } },
      update: experience,
      create: experience,
    });
  }

  for (const project of projects) {
    await prisma.project.upsert({
      where: { title: project.title },
      update: project,
      create: project,
    });
  }

  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: skill,
      create: skill,
    });
  }

  console.log(
    `Seeded ${experiences.length} experiences, ${projects.length} projects, ${skills.length} skills.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
