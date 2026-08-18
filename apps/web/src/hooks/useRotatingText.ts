"use client";

import { useEffect, useState } from "react";

const ROTATE_INTERVAL_MS = 2500;

export function useRotatingText(words: string[]) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % words.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [words.length]);

  return words[index];
}
