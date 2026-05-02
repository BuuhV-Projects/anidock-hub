# scripts/

Manual smoke tests and ad-hoc utilities. Nothing here is wired into CI.

## smoke-test-driver.mjs

Runs the full crawler stack (`crawlWithDriver` → `crawlEpisodes` → `extractVideoUrl`) against a real anime site, using the same Puppeteer launch options the desktop app uses.

### When to run

- After touching anything in [`clientCrawler.ts`](../src/packages/app-core/src/lib/clientCrawler.ts).
- After exporting a freshly created driver, to confirm the AI-generated selectors actually match the page structure end-to-end.

### How to run

```bash
# Default: scripts/fixtures/driver-animesdigital.json
node scripts/smoke-test-driver.mjs

# Or point at an exported driver from MyDrivers
node scripts/smoke-test-driver.mjs path/to/driver.json
```

Requires:

- `yarn install` already done at the repo root (the script consumes `puppeteer`, `linkedom` and `jiti` from the root `node_modules`).
- A working Puppeteer Chromium download. If `yarn install` ran with `PUPPETEER_SKIP_DOWNLOAD=1`, this will fail to launch — re-install without the env var, or set `PUPPETEER_EXECUTABLE_PATH` to a local Chromium binary.
- Internet access to the target anime site.

### What it checks

For each step the script prints the count of items extracted, the first few errors when present, and a small encoding probe that flags `Ã`-style mojibake when UTF-8 went wrong somewhere in the pipeline. The video URL step also prints whether the runtime app would fall back to `window.open(episode.sourceUrl)` when no embedded URL was extracted.

The script is **not** automated and is **not** an assertion-based test. It is a smoke test: it tells you what happened against a live site at this exact moment, and you eyeball the output to decide whether the crawler still does the right thing for that driver.

### Legal note

The fixture driver targets `animesdigital.org`. Running this script issues HTTP requests against that site. Decide for yourself whether that is appropriate for your context — the script does not run anything automatically.

### Running from CI

A workflow at [`.github/workflows/smoke-test-driver.yml`](../.github/workflows/smoke-test-driver.yml) wraps this script behind a manual `workflow_dispatch` trigger. It is **not** wired into the release / hotfix pipelines on purpose — the smoke test is inherently flaky (depends on the target site staying online and on its HTML matching the recorded selectors) and gating releases on it would create more outages than it prevents.

Trigger it explicitly when you want a fresh run against the live site:

```bash
gh workflow run smoke-test-driver.yml
# or with a custom driver path
gh workflow run smoke-test-driver.yml -f driver_path=path/to/driver.json
```

The job appends the script output to the run summary and uploads the full log as an artifact.
