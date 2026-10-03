import { SectionEyebrow } from "@/components/SectionEyebrow";
import { LinkedInPostsCarousel } from "@/components/LinkedInPostsCarousel";

const LINKEDIN_PROFILE_URL = "https://www.linkedin.com/in/zohreh-sadeghi";

/**
 * To feature a post: open it on LinkedIn, click the "..." menu → "Embed this post",
 * then copy the `src` and `height` straight out of the iframe code LinkedIn gives you
 * (height varies per post — don't reuse one from another post). No API/scraping involved,
 * this is LinkedIn's own official embed.
 */
const FEATURED_POSTS: { embedSrc: string; caption: string; height: number }[] =
  [
    {
      embedSrc:
        "https://www.linkedin.com/embed/feed/update/urn:li:share:7509213155789733890?collapsed=1",
      caption: "Zohreh Sadeghi on LinkedIn",
      height: 1324,
    },
    {
      embedSrc:
        "https://www.linkedin.com/embed/feed/update/urn:li:share:7404226577586429952?collapsed=1",
      caption: "Zohreh Sadeghi on LinkedIn",
      height: 1324,
    },
  ];

export function LinkedInPosts() {
  return (
    <section id="linkedin" className="scroll-mt-24">
      <SectionEyebrow number="04" label="On LinkedIn" />
      <h2 className="mt-2 text-4xl font-bold tracking-tight text-black dark:text-zinc-50 sm:text-5xl">
        Recent Posts
      </h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        A few things I&apos;ve shared on LinkedIn, embedded directly from there.
      </p>

      {FEATURED_POSTS.length > 0 ? (
        <LinkedInPostsCarousel posts={FEATURED_POSTS} />
      ) : (
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">No posts featured here yet.</p>
      )}

      <a
        href={LINKEDIN_PROFILE_URL}
        target="_blank"
        rel="noreferrer"
        className="mt-6 inline-flex items-center gap-2 rounded-lg border border-accent px-5 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent-bg"
      >
        Follow me on LinkedIn
      </a>
    </section>
  );
}
