# Workflow Stabilization Improvements

- Added **workflow_dispatch inputs** to CI and Deploy workflows for manual, controlled execution.
- Added **adaptive CI change detection** to skip expensive jobs on PRs that do not touch relevant monorepo paths.
- Added **runtime auto-detection** for Node and pnpm versions from `.nvmrc` / `package.json` with safe defaults.
- Hardened caching with improved keys and expanded cache coverage (`pnpm`, `node_modules`, `.turbo`).
- Added **self-healing retries** with exponential backoff for flaky install/build/lint/type-check/deploy operations.
- Added **cache recovery fallback** in CI when install failures indicate stale/corrupt cache state.
- Added post-step **health checks** and richer **job summaries** via `$GITHUB_STEP_SUMMARY`.
- Added **failure artifacts** upload for easier debugging (`.turbo`, `.vercel`, debug logs).
- Added optional, configurable **webhook failure notifications** via `CI_FAILURE_WEBHOOK`.
- Tightened **concurrency and permissions** while preserving original commands, secrets, env usage, and step ordering logic.
- Added `.github/dependabot.yml` to keep GitHub Actions and npm dependencies current and Dependabot-safe.
