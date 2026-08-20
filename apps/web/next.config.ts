import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Stop `next dev` from auto-writing AGENTS.md/CLAUDE.md (its own agent-guidance docs, not a
  // record of anything about how this repo was built) into a public-facing portfolio repo.
  agentRules: false,
};

export default nextConfig;
