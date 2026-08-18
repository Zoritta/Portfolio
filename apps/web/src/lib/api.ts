const API_URL = process.env.API_URL ?? 'http://localhost:3001';
const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

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

export type FitReport = {
  matchScore: number;
  summary: string;
  strengths: { point: string; citedSourceIndexes: number[] }[];
  gaps: { point: string }[];
  suggestedInterviewQuestions: string[];
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

export class FitAnalysisError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'FitAnalysisError';
  }
}

export class ContactError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ContactError';
  }
}

export type ContactPayload = {
  name: string;
  email: string;
  message: string;
  honeypot?: string;
};

export async function sendContactMessage(payload: ContactPayload): Promise<{ success: true }> {
  const response = await fetch(`${PUBLIC_API_URL}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (response.status === 429) {
    throw new ContactError('Too many requests — please wait a minute and try again.', 429);
  }
  if (response.status === 400) {
    throw new ContactError('Please check your name, email, and message and try again.', 400);
  }
  if (response.status === 503) {
    throw new ContactError('Message sending is temporarily unavailable. Please try again in a moment.', 503);
  }
  if (!response.ok) {
    throw new ContactError('Something went wrong on our end — please try again shortly.', response.status);
  }

  return response.json();
}

export async function analyzeJobFit(jobDescription: string): Promise<FitReport> {
  const response = await fetch(`${PUBLIC_API_URL}/fit-analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobDescription }),
  });

  if (response.status === 429) {
    throw new FitAnalysisError('Too many requests — please wait a minute and try again.', 429);
  }
  if (response.status === 400) {
    throw new FitAnalysisError('Job description must be between 50 and 8000 characters.', 400);
  }
  if (response.status === 503) {
    throw new FitAnalysisError('The AI service is temporarily unavailable. Please try again in a moment.', 503);
  }
  if (!response.ok) {
    throw new FitAnalysisError('Something went wrong on our end — please try again shortly.', response.status);
  }

  return response.json();
}
