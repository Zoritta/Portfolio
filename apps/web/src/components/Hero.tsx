"use client";

import Image from "next/image";
import { useRotatingText } from "@/hooks/useRotatingText";

const ROLES = ["Fullstack Developer", "Cloud-Native Engineer", "AI/RAG Developer"];

export function Hero() {
  const role = useRotatingText(ROLES);

  return (
    <div className="flex items-center gap-4">
      <Image
        src="/profile.jpg"
        alt="Zohreh Sadeghi"
        width={80}
        height={80}
        priority
        className="h-20 w-20 rounded-full object-cover ring-2 ring-zinc-200 dark:ring-zinc-800"
      />
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Zohreh Sadeghi
        </h1>
        <p className="mt-1 text-lg text-zinc-600 dark:text-zinc-400">
          {role} — Malmö, Sweden
        </p>
      </div>
    </div>
  );
}
