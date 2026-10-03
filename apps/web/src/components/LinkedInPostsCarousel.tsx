"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Post = { embedSrc: string; caption: string; height: number };

export function LinkedInPostsCarousel({ posts }: { posts: Post[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    function updateScrollState() {
      if (!el) return;
      setCanScrollPrev(el.scrollLeft > 8);
      setCanScrollNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
    }

    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [posts.length]);

  function scrollByCard(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-carousel-item]");
    const amount = (card?.offsetWidth ?? 504) + 24; // card width + gap-6
    el.scrollBy({ left: amount * direction, behavior: "smooth" });
  }

  return (
    <div className="mt-6">
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2"
      >
        {posts.map((post) => (
          <div
            key={post.embedSrc}
            data-carousel-item
            className="w-full max-w-[504px] flex-none snap-start rounded-2xl border border-accent/20 bg-accent-bg/50 p-3 dark:bg-accent-bg/20"
          >
            <iframe
              src={post.embedSrc}
              title={post.caption}
              height={post.height}
              width="100%"
              className="rounded-lg border border-zinc-200 [filter:saturate(0.4)_sepia(0.15)] dark:border-zinc-800 dark:[filter:saturate(0.4)_sepia(0.15)_brightness(0.85)]"
              allowFullScreen
            />
          </div>
        ))}
      </div>

      {posts.length > 1 && (
        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            disabled={!canScrollPrev}
            aria-label="Previous post"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 transition-colors hover:bg-accent-bg disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-800 dark:text-zinc-400"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            disabled={!canScrollNext}
            aria-label="Next post"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 transition-colors hover:bg-accent-bg disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-800 dark:text-zinc-400"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
