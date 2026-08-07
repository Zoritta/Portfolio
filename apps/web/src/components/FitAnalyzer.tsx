"use client";

import { useState, type SubmitEvent } from "react";
import { analyzeJobFit, FitAnalysisError, type FitReport } from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";

const MIN_LENGTH = 50;
const MAX_LENGTH = 8000;

function scoreColor(score: number) {
  if (score >= 70) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 40) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

export function FitAnalyzer() {
  const [jobDescription, setJobDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<FitReport | null>(null);

  const length = jobDescription.trim().length;
  const isValidLength = length >= MIN_LENGTH && length <= MAX_LENGTH;

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (!isValidLength || status === "loading") return;

    setStatus("loading");
    setError(null);

    try {
      const result = await analyzeJobFit(jobDescription);
      setReport(result);
      setStatus("success");
    } catch (err) {
      const message =
        err instanceof FitAnalysisError ? err.message : "Something went wrong analyzing this job description.";
      setError(message);
      setStatus("error");
    }
  }

  return (
    <section>
      <h2 className="text-xl font-semibold text-black dark:text-zinc-50">Job Fit Analyzer</h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Paste a job description and get a grounded fit report — generated from my actual project,
        skill, and experience data via retrieval-augmented generation, not a generic AI wrapper.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
        <textarea
          value={jobDescription}
          onChange={(event) => setJobDescription(event.target.value)}
          placeholder="Paste a job description here…"
          rows={8}
          className="w-full rounded-lg border border-zinc-200 bg-white p-3 text-sm text-black placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-600"
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-zinc-500 dark:text-zinc-500">
            {length} / {MAX_LENGTH} characters (min {MIN_LENGTH})
          </span>
          <button
            type="submit"
            disabled={!isValidLength || status === "loading"}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-50 dark:text-black"
          >
            {status === "loading" ? "Analyzing…" : "Analyze Fit"}
          </button>
        </div>
      </form>

      {status === "error" && error && (
        <p className="mt-4 animate-[fade-in_0.3s_ease-out] rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-400">
          {error}
        </p>
      )}

      {status === "loading" && (
        <div className="mt-6 flex flex-col gap-6 rounded-lg border border-zinc-200 p-5 dark:border-zinc-800">
          <div>
            <Skeleton className="h-9 w-24" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-4/5" />
          </div>
          <div>
            <Skeleton className="h-4 w-20" />
            <div className="mt-2 flex flex-col gap-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      )}

      {status === "success" && report && (
        <div className="mt-6 flex animate-[fade-in_0.4s_ease-out] flex-col gap-6 rounded-lg border border-zinc-200 p-5 dark:border-zinc-800">
          <div>
            <span className={`text-3xl font-semibold ${scoreColor(report.matchScore)}`}>
              {report.matchScore}%
            </span>
            <span className="ml-2 text-sm text-zinc-500 dark:text-zinc-500">match</span>
            <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{report.summary}</p>
          </div>

          {report.strengths.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-500">Strengths</h3>
              <ul className="mt-2 flex flex-col gap-1.5">
                {report.strengths.map((strength, index) => (
                  <li key={index} className="flex gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <span className="text-emerald-600 dark:text-emerald-400">+</span>
                    {strength.point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.gaps.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-500">Gaps</h3>
              <ul className="mt-2 flex flex-col gap-1.5">
                {report.gaps.map((gap, index) => (
                  <li key={index} className="flex gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <span className="text-rose-600 dark:text-rose-400">−</span>
                    {gap.point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.suggestedInterviewQuestions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-500">
                Suggested interview questions
              </h3>
              <ul className="mt-2 flex list-decimal flex-col gap-1.5 pl-4">
                {report.suggestedInterviewQuestions.map((question, index) => (
                  <li key={index} className="text-sm text-zinc-700 dark:text-zinc-300">
                    {question}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
