import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // Stop `next dev` from auto-writing AGENTS.md/CLAUDE.md (its own agent-guidance docs, not a
  // record of anything about how this repo was built) into a public-facing portfolio repo.
  agentRules: false,
};

// No org/project/authToken configured yet, so this only wires up error reporting — it won't
// upload source maps (stack traces in Sentry will show minified code until that's added later).
export default withSentryConfig(nextConfig, {
  silent: !process.env.CI,
});
