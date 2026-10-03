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

const photoReveal = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: "easeOut" } },
} as const;

export function Hero() {
  const role = useRotatingText(ROLES);

  return (
    <div className="relative w-full overflow-hidden px-6 py-20 sm:px-16 sm:py-28">
      <AmbientBackground />
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative mx-auto grid w-full max-w-5xl grid-cols-1 items-center gap-12 md:grid-cols-[1.1fr_0.9fr] md:gap-10"
      >
        <div className="order-2 flex flex-col items-center gap-6 text-center md:order-1 md:items-start md:text-left">
          <motion.span
            variants={item}
            className="rounded-full bg-accent-bg px-3 py-1 text-xs font-medium text-accent"
          >
            ● Available for opportunities in Sweden &amp; Denmark
          </motion.span>

          <motion.div variants={item}>
            <h1 className="text-6xl font-bold tracking-tighter text-black dark:text-zinc-50 sm:text-7xl">
              Zohreh Sadeghi
            </h1>
            <p className="mt-4 text-xl text-zinc-600 dark:text-zinc-400 sm:text-2xl">
              {role} — Malmö, Sweden
            </p>
          </motion.div>

          <motion.div
            variants={item}
            className="mt-2 flex flex-wrap items-center justify-center gap-3 md:justify-start"
          >
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
        </div>

        <motion.div variants={photoReveal} className="order-1 mx-auto w-full max-w-xs md:order-2 md:max-w-full">
          <div className="relative">
            <div
              className="absolute -inset-3 rounded-[2rem] border border-accent/30"
              aria-hidden="true"
            />
            <div className="relative overflow-hidden rounded-[1.75rem] ring-1 ring-black/5 dark:ring-white/10">
              <Image
                src="/profile.jpg"
                alt="Zohreh Sadeghi"
                width={640}
                height={640}
                sizes="(min-width: 768px) 420px, 320px"
                priority
                className="aspect-square w-full object-cover"
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
