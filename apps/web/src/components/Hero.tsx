"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useRotatingText } from "@/hooks/useRotatingText";
import { AmbientBackground } from "@/components/AmbientBackground";

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
    <div className="relative w-full overflow-hidden px-6 py-28 sm:px-16 sm:py-40">
      <AmbientBackground />
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative mx-auto flex w-full max-w-4xl flex-col items-center gap-7 text-center"
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
            width={112}
            height={112}
            priority
            className="h-24 w-24 rounded-full object-cover ring-4 ring-accent-bg sm:h-28 sm:w-28"
          />
        </motion.div>

        <motion.div variants={item}>
          <h1 className="text-6xl font-bold tracking-tighter text-black dark:text-zinc-50 sm:text-7xl md:text-8xl">
            Zohreh Sadeghi
          </h1>
          <p className="mt-4 text-xl text-zinc-600 dark:text-zinc-400 sm:text-2xl">
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
