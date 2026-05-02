// Manual smoke test for the crawler stack against a real anime site.
//
// Imports the production crawlWithDriver / crawlEpisodes / extractVideoUrl
// from app-core (via jiti, since the package ships TypeScript sources), spins
// up Puppeteer with the same launch options as the desktop main process, and
// walks the full driver flow: catalog → episodes → video URL.
//
// This is intentionally a one-off CLI script, not a CI test — it depends on
// the target site staying online and on its HTML matching the recorded
// selectors, neither of which are stable. Use it after touching the crawler
// or after exporting a new driver to confirm it still produces sane data.
//
// Usage:
//   node scripts/smoke-test-driver.mjs
//   node scripts/smoke-test-driver.mjs path/to/driver.json

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { webcrypto } from 'node:crypto';

import { createJiti } from 'jiti';
import { DOMParser } from 'linkedom';
import puppeteer from 'puppeteer';

// `--no-sandbox` is required on GitHub-hosted Ubuntu 24.04 runners because
// AppArmor blocks unprivileged user namespaces, which Chromium needs for its
// default sandbox. This is acceptable here because the smoke test runs in a
// disposable CI container against a single trusted page; the desktop app
// itself still launches Puppeteer with the sandbox enabled.
const PUPPETEER_LAUNCH_ARGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-accelerated-2d-canvas',
  '--disable-gpu',
  '--window-size=1920x1080',
];

const PUPPETEER_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const PUPPETEER_NAVIGATION_TIMEOUT_MS = 30_000;
const POST_LOAD_DELAY_MS = 2_000;
const MOJIBAKE_PROBE = 'Ã';
const SYNOPSIS_PREVIEW_CHARS = 120;

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');
const defaultDriverPath = resolve(scriptDir, 'fixtures/driver-animesdigital.json');

// linkedom ships a standards-mode DOMParser. Expose it on globalThis so the
// crawler code (originally targeted at the browser) parses HTML without
// changes when running under Node.
globalThis.DOMParser = DOMParser;

// Some Node releases hide crypto.randomUUID behind webcrypto rather than the
// global. Bind it explicitly so crawlWithDriver / crawlEpisodes do not blow
// up when constructing LocalAnime / LocalEpisode IDs.
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}

// Use jiti to consume app-core's TypeScript sources directly. jiti is already
// in the project's dependency list and skips the need to add tsx/ts-node just
// for this script.
const jiti = createJiti(import.meta.url);
const clientCrawlerModulePath = resolve(
  repoRoot,
  'src/packages/app-core/src/lib/clientCrawler.ts'
);
const clientCrawler = await jiti.import(clientCrawlerModulePath);
const crawlWithDriver = clientCrawler.crawlWithDriver;
const crawlEpisodes = clientCrawler.crawlEpisodes;
const extractVideoUrl = clientCrawler.extractVideoUrl;

const driverPath = process.argv[2] ? resolve(process.argv[2]) : defaultDriverPath;
const driverFileContents = readFileSync(driverPath, 'utf-8');
const driver = JSON.parse(driverFileContents);

console.log('Smoke test target');
console.log(`  driver: ${driver.name} (${driver.domain})`);
console.log(`  catalog: ${driver.catalogUrl}`);
console.log('');

const browser = await puppeteer.launch({
  headless: true,
  args: PUPPETEER_LAUNCH_ARGS,
});

async function fetchViaPuppeteer(url) {
  const page = await browser.newPage();
  try {
    await page.setUserAgent(PUPPETEER_USER_AGENT);
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: PUPPETEER_NAVIGATION_TIMEOUT_MS,
    });
    await new Promise((resolveDelay) => setTimeout(resolveDelay, POST_LOAD_DELAY_MS));
    const html = await page.content();
    return html;
  } finally {
    await page.close();
  }
}

function checkMojibake(label, value) {
  if (value && value.includes(MOJIBAKE_PROBE)) {
    console.log(`  ${label} encoding: BROKEN (mojibake detected)`);
  } else {
    console.log(`  ${label} encoding: OK`);
  }
}

try {
  console.log('=== STEP 1: Catalog ===');
  const catalogResult = await crawlWithDriver(
    driver.catalogUrl,
    driver,
    (progress) => {
      const total = progress.total > 0 ? progress.total : 1;
      console.log(`  ${progress.current}/${total} ${progress.status}`);
    },
    fetchViaPuppeteer
  );
  console.log(`  animes: ${catalogResult.animes.length}`);
  console.log(`  errors: ${catalogResult.errors.length}`);
  if (catalogResult.errors.length > 0) {
    console.log('  first errors:');
    for (const errorMessage of catalogResult.errors.slice(0, 3)) {
      console.log(`    - ${errorMessage}`);
    }
  }

  if (catalogResult.animes.length === 0) {
    console.error('No animes returned. Aborting.');
    process.exitCode = 1;
  } else {
    const firstAnime = catalogResult.animes[0];
    console.log('');
    console.log(`  first anime: ${firstAnime.title}`);
    console.log(`    cover: ${firstAnime.coverUrl ?? '(none)'}`);
    const synopsisPreview = firstAnime.synopsis
      ? firstAnime.synopsis.substring(0, SYNOPSIS_PREVIEW_CHARS) + '...'
      : '(none)';
    console.log(`    synopsis: ${synopsisPreview}`);
    checkMojibake('  title', firstAnime.title);
    checkMojibake('  synopsis', firstAnime.synopsis);

    console.log('');
    console.log('=== STEP 2: Episodes ===');
    const episodeResult = await crawlEpisodes(
      firstAnime.sourceUrl,
      driver,
      undefined,
      fetchViaPuppeteer
    );
    console.log(`  episodes: ${episodeResult.episodes.length}`);
    console.log(`  errors: ${episodeResult.errors.length}`);
    if (episodeResult.errors.length > 0) {
      console.log('  first errors:');
      for (const errorMessage of episodeResult.errors.slice(0, 3)) {
        console.log(`    - ${errorMessage}`);
      }
    }

    if (episodeResult.episodes.length === 0) {
      console.error('No episodes returned. Aborting.');
      process.exitCode = 1;
    } else {
      const firstEpisode = episodeResult.episodes[0];
      console.log('');
      console.log(
        `  first episode: #${firstEpisode.episodeNumber} ${firstEpisode.title ?? '(no title)'}`
      );
      console.log(`    url: ${firstEpisode.sourceUrl}`);
      checkMojibake('  episode title', firstEpisode.title);

      console.log('');
      console.log('=== STEP 3: Video URL ===');
      const videoResult = await extractVideoUrl(
        firstEpisode.sourceUrl,
        driver,
        fetchViaPuppeteer
      );
      console.log(`  videoUrl: ${videoResult.videoUrl ?? '(null)'}`);
      console.log(`  videoType: ${videoResult.videoType}`);
      if (!videoResult.videoUrl) {
        console.log('  → fallback path: app would window.open(episode.sourceUrl)');
      }
    }
  }

  console.log('');
  console.log('Smoke test complete.');
} finally {
  await browser.close();
}
