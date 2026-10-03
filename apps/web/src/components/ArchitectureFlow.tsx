type FlowStep = {
  label: string;
  detail: string;
};

const STEPS: FlowStep[] = [
  { label: "User prompt", detail: "Chat input" },
  { label: "streamText", detail: "Vercel AI SDK, server-side" },
  { label: "Tool-calling loop", detail: "Up to 5 chained steps" },
  { label: "Streamed response", detail: "useChat, token-by-token" },
  { label: "Save to Boards", detail: "Routed into creation flow" },
];

export function ArchitectureFlow() {
  return (
    <div
      role="img"
      aria-label={`Request flow: ${STEPS.map((step) => step.label).join(" → ")}`}
      className="flex flex-wrap items-stretch gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40"
    >
      {STEPS.map((step, index) => (
        <div key={step.label} className="flex items-stretch gap-2" aria-hidden="true">
          <div className="flex min-w-[9rem] flex-col justify-center rounded-md border border-accent/30 bg-accent-bg px-3 py-2">
            <span className="text-xs font-medium text-accent">{step.label}</span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{step.detail}</span>
          </div>
          {index < STEPS.length - 1 && (
            <span className="flex items-center text-zinc-300 dark:text-zinc-700">→</span>
          )}
        </div>
      ))}
    </div>
  );
}
