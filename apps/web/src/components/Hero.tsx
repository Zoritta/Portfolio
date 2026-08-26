"use client";

import Image from "next/image";
import { useRotatingText } from "@/hooks/useRotatingText";

const ROLES = ["Fullstack Developer", "Cloud-Native Engineer", "AI/RAG Developer"];

export function Hero() {
  const role = useRotatingText(ROLES);

  return (
    <div className="w-full px-6 py-20 sm:px-16 sm:py-28">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 text-center">
        <span className="rounded-full bg-accent-bg px-3 py-1 text-xs font-medium text-accent">
          ● Available for opportunities in Sweden &amp; Denmark
        </span>

        <Image
          src="/profile.jpg"
          alt="Zohreh Sadeghi"
          width={128}
          height={128}
          priority
          className="h-28 w-28 rounded-full object-cover ring-4 ring-accent-bg sm:h-32 sm:w-32"
        />

        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50 sm:text-5xl">
            Zohreh Sadeghi
          </h1>
          <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
            {role} — Malmö, Sweden
          </p>
        </div>

        <p className="max-w-xl text-balance text-zinc-600 dark:text-zinc-400">
          I build fast, reliable web apps end-to-end — from React frontends to cloud-native,
          AI-assisted APIs.
        </p>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#projects"
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            View Projects
          </a>
          <a
            href="#contact"
            className="rounded-lg border border-accent px-5 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent-bg"
          >
            Contact me
          </a>
        </div>
      </div>
    </div>
  );
}
