"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useRotatingText } from "@/hooks/useRotatingText";

const ROLES = ["Fullstack Developer", "Cloud-Native Engineer", "AI/RAG Developer"];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
} as const;

export function Hero() {
  const role = useRotatingText(ROLES);

  return (
    <div className="w-full px-6 py-20 sm:px-16 sm:py-28">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 text-center"
      >
        <motion.span
          variants={item}
          className="rounded-full bg-accent-bg px-3 py-1 text-xs font-medium text-accent"
        >
          ● Available for opportunities in Sweden &amp; Denmark
        </motion.span>

        <motion.div variants={item}>
          <Image
            src="/profile.jpg"
            alt="Zohreh Sadeghi"
            width={128}
            height={128}
            priority
            className="h-28 w-28 rounded-full object-cover ring-4 ring-accent-bg sm:h-32 sm:w-32"
          />
        </motion.div>

        <motion.div variants={item}>
          <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50 sm:text-5xl">
            Zohreh Sadeghi
          </h1>
          <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
            {role} — Malmö, Sweden
          </p>
        </motion.div>

        <motion.div variants={item} className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <motion.a
            href="#projects"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="rounded-lg bg-accent-solid px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            View Projects
          </motion.a>
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="rounded-lg border border-accent px-5 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent-bg"
          >
            Contact me
          </motion.a>
        </motion.div>
      </motion.div>
    </div>
  );
}
