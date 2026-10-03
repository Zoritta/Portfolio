/** Decorative only: a couple of blurred, slowly-drifting gradient blobs behind the hero. Pure CSS (see .ambient-blob in globals.css) — no canvas, no JS animation loop, so it costs nothing on the performance budget. */
export function AmbientBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div
        className="ambient-blob absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-accent opacity-[0.12] blur-3xl dark:opacity-20"
        style={{ animationName: "drift-a" }}
      />
      <div
        className="ambient-blob absolute -bottom-40 -right-24 h-[32rem] w-[32rem] rounded-full bg-accent opacity-[0.08] blur-3xl dark:opacity-[0.14]"
        style={{ animationName: "drift-b", animationDelay: "-8s" }}
      />
    </div>
  );
}
