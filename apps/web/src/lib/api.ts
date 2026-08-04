const API_URL = process.env.API_URL ?? 'http://localhost:3001';

export type Project = {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  repoUrl: string | null;
  liveUrl: string | null;
  highlights: string[];
};

export type Skill = {
  id: string;
  name: string;
  category: string;
  proficiency: number;
};

export type Experience = {
  id: string;
  company: string;
  role: string;
  description: string;
  startDate: string;
  endDate: string | null;
};

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`API request to ${path} failed with status ${response.status}`);
  }
  return response.json();
}

export function getProjects() {
  return fetchJson<Project[]>('/projects');
}

export function getSkills() {
  return fetchJson<Skill[]>('/skills');
}

export function getExperience() {
  return fetchJson<Experience[]>('/experience');
}
