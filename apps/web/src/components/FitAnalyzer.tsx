"use client";

import { useState, type SubmitEvent } from "react";
import { motion } from "framer-motion";
import { analyzeJobFit, FitAnalysisError, type FitReport } from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";

const resultContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const resultItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

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
    <section
      id="fit-analyzer"
      className="scroll-mt-24 rounded-2xl border border-accent/20 bg-accent-bg/50 p-6 dark:bg-accent-bg/20 sm:p-8"
    >
      <span className="text-xs font-medium uppercase tracking-wide text-accent">Try it</span>
      <h2 className="mt-1 text-2xl font-semibold tracking-tight text-black dark:text-zinc-50 sm:text-3xl">
        Job Fit Analyzer
      </h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Paste a job description and get a grounded fit report — generated from my actual project,
        skill, and experience data via retrieval-augmented generation, not a generic AI wrapper.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
        <label htmlFor="job-description" className="sr-only">
          Job description
        </label>
        <textarea
          id="job-description"
          value={jobDescription}
          onChange={(event) => setJobDescription(event.target.value)}
          placeholder="Paste a job description here…"
          rows={8}
          className="w-full rounded-lg border border-zinc-200 bg-white p-3 text-sm text-black placeholder:text-zinc-400 focus:border-accent focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-600"
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {length} / {MAX_LENGTH} characters (min {MIN_LENGTH})
          </span>
          <motion.button
            type="submit"
            disabled={!isValidLength || status === "loading"}
            whileHover={isValidLength && status !== "loading" ? { scale: 1.03 } : undefined}
            whileTap={isValidLength && status !== "loading" ? { scale: 0.97 } : undefined}
            className="rounded-lg bg-accent-solid px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {status === "loading" ? "Analyzing…" : "Analyze Fit"}
          </motion.button>
        </div>
      </form>

      {status === "error" && error && (
        <p
          role="alert"
          className="mt-4 animate-[fade-in_0.3s_ease-out] rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-400"
        >
          {error}
        </p>
      )}

      {status === "loading" && (
        <div
          role="status"
          aria-label="Analyzing job description"
          className="mt-6 flex flex-col gap-6 rounded-lg border border-zinc-200 p-5 dark:border-zinc-800"
        >
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
        <motion.div
          variants={resultContainer}
          initial="hidden"
          animate="show"
          role="status"
          aria-label={`Fit analysis complete: ${report.matchScore}% match`}
          className="mt-6 flex flex-col gap-6 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <motion.div variants={resultItem}>
            <span className={`text-3xl font-semibold ${scoreColor(report.matchScore)}`}>
              {report.matchScore}%
            </span>
            <span className="ml-2 text-sm text-zinc-500 dark:text-zinc-400">match</span>
            <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{report.summary}</p>
          </motion.div>

          {report.strengths.length > 0 && (
            <motion.div variants={resultItem}>
              <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Strengths</h3>
              <ul className="mt-2 flex flex-col gap-1.5">
                {report.strengths.map((strength, index) => (
                  <li key={index} className="flex gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <span className="text-emerald-600 dark:text-emerald-400">+</span>
                    {strength.point}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {report.gaps.length > 0 && (
            <motion.div variants={resultItem}>
              <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Gaps</h3>
              <ul className="mt-2 flex flex-col gap-1.5">
                {report.gaps.map((gap, index) => (
                  <li key={index} className="flex gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <span className="text-rose-600 dark:text-rose-400">−</span>
                    {gap.point}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {report.suggestedInterviewQuestions.length > 0 && (
            <motion.div variants={resultItem}>
              <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Suggested interview questions
              </h3>
              <ul className="mt-2 flex list-decimal flex-col gap-1.5 pl-4">
                {report.suggestedInterviewQuestions.map((question, index) => (
                  <li key={index} className="text-sm text-zinc-700 dark:text-zinc-300">
                    {question}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </motion.div>
      )}
    </section>
  );
}
