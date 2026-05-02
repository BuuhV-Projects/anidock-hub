// Aggregations derived from watchHistory and library entries.
//
// All functions are pure — they take their data as input and return computed
// values, with no IndexedDB access. The page that renders the stats is the
// one responsible for loading the underlying data once and passing it in.

import { LibraryEntry, LibraryStatus, WatchHistoryEntry } from './indexedDB';

// Default episode duration used when computing total watch hours. Most TV
// anime episodes run roughly 24 minutes; this is intentionally a constant
// rather than a per-anime field because the source sites do not expose
// runtime metadata reliably. A future Settings screen can override it.
const DEFAULT_EPISODE_MINUTES = 24;
const MINUTES_PER_HOUR = 60;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const RECENT_ACTIVITY_DAYS = 30;
const TOP_ANIMES_LIMIT = 5;
const TOP_DRIVERS_LIMIT = 5;
const ZERO_COUNT = 0;
// Used for both "advance by one calendar day" and "add one occurrence to a
// running counter" — both numerically equal to 1, but kept named so the
// arithmetic reads as intent rather than a bare literal.
const ONE_DAY = 1;
const ONE_OCCURRENCE = 1;
// Loop step used when iterating with a manual numeric cursor.
const STEP_BY_ONE = 1;

export interface AnimeWatchCount {
  animeSourceUrl: string;
  animeTitle: string;
  animeCover?: string;
  episodesWatched: number;
}

export interface DriverWatchCount {
  driverId: string;
  episodesWatched: number;
}

export interface ActivityBucket {
  // ISO date in YYYY-MM-DD form, in the user's local timezone.
  date: string;
  episodesWatched: number;
}

export interface LibraryStatusCount {
  status: LibraryStatus;
  count: number;
}

export interface WatchStatistics {
  totalEpisodesWatched: number;
  totalUniqueAnimes: number;
  totalHoursWatched: number;
  currentStreakDays: number;
  longestStreakDays: number;
  topAnimes: AnimeWatchCount[];
  topDrivers: DriverWatchCount[];
  activityLast30Days: ActivityBucket[];
  libraryByStatus: LibraryStatusCount[];
  totalLibraryEntries: number;
}

function formatLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Returns the largest run of consecutive days that contains today (or the
// most recent day with activity). 0 if there is no activity.
function computeCurrentStreak(uniqueDayKeys: Set<string>): number {
  if (uniqueDayKeys.size === ZERO_COUNT) {
    return ZERO_COUNT;
  }

  const today = startOfLocalDay(new Date());
  const todayKey = formatLocalDateKey(today);

  let cursor: Date;
  if (uniqueDayKeys.has(todayKey)) {
    cursor = today;
  } else {
    const yesterday = new Date(today.getTime() - ONE_DAY_MS);
    const yesterdayKey = formatLocalDateKey(yesterday);
    if (!uniqueDayKeys.has(yesterdayKey)) {
      return ZERO_COUNT;
    }
    cursor = yesterday;
  }

  let streak = ZERO_COUNT;
  while (uniqueDayKeys.has(formatLocalDateKey(cursor))) {
    streak = streak + ONE_OCCURRENCE;
    cursor = new Date(cursor.getTime() - ONE_DAY_MS);
  }
  return streak;
}

function computeLongestStreak(uniqueDayKeys: Set<string>): number {
  if (uniqueDayKeys.size === ZERO_COUNT) {
    return ZERO_COUNT;
  }

  const sortedKeys = Array.from(uniqueDayKeys).sort();
  let longest = ONE_OCCURRENCE;
  let current = ONE_OCCURRENCE;

  for (let index = 1; index < sortedKeys.length; index = index + STEP_BY_ONE) {
    const previousDate = new Date(sortedKeys[index - 1] + 'T00:00:00');
    const currentDate = new Date(sortedKeys[index] + 'T00:00:00');
    const diffDays = Math.round((currentDate.getTime() - previousDate.getTime()) / ONE_DAY_MS);

    if (diffDays === ONE_DAY) {
      current = current + ONE_OCCURRENCE;
      if (current > longest) {
        longest = current;
      }
    } else {
      current = ONE_OCCURRENCE;
    }
  }
  return longest;
}

function computeTopAnimes(history: WatchHistoryEntry[]): AnimeWatchCount[] {
  const countsByUrl = new Map<string, AnimeWatchCount>();
  for (const entry of history) {
    const existing = countsByUrl.get(entry.animeSourceUrl);
    if (existing) {
      existing.episodesWatched = existing.episodesWatched + ONE_OCCURRENCE;
    } else {
      countsByUrl.set(entry.animeSourceUrl, {
        animeSourceUrl: entry.animeSourceUrl,
        animeTitle: entry.animeTitle,
        animeCover: entry.animeCover,
        episodesWatched: ONE_OCCURRENCE,
      });
    }
  }

  const allCounts = Array.from(countsByUrl.values());
  allCounts.sort((firstCount, secondCount) => secondCount.episodesWatched - firstCount.episodesWatched);
  return allCounts.slice(0, TOP_ANIMES_LIMIT);
}

function computeTopDrivers(history: WatchHistoryEntry[]): DriverWatchCount[] {
  const countsByDriver = new Map<string, DriverWatchCount>();
  for (const entry of history) {
    const driverId = entry.driverId;
    if (!driverId) {
      continue;
    }
    const existing = countsByDriver.get(driverId);
    if (existing) {
      existing.episodesWatched = existing.episodesWatched + ONE_OCCURRENCE;
    } else {
      countsByDriver.set(driverId, { driverId, episodesWatched: ONE_OCCURRENCE });
    }
  }

  const allCounts = Array.from(countsByDriver.values());
  allCounts.sort((firstCount, secondCount) => secondCount.episodesWatched - firstCount.episodesWatched);
  return allCounts.slice(0, TOP_DRIVERS_LIMIT);
}

function computeActivityLast30Days(history: WatchHistoryEntry[]): ActivityBucket[] {
  const buckets: ActivityBucket[] = [];
  const today = startOfLocalDay(new Date());

  // Pre-fill 30 buckets so the chart shows zero-days too.
  for (
    let dayOffset = RECENT_ACTIVITY_DAYS - STEP_BY_ONE;
    dayOffset >= ZERO_COUNT;
    dayOffset = dayOffset - STEP_BY_ONE
  ) {
    const bucketDate = new Date(today.getTime() - dayOffset * ONE_DAY_MS);
    buckets.push({ date: formatLocalDateKey(bucketDate), episodesWatched: ZERO_COUNT });
  }

  const bucketsByKey = new Map<string, ActivityBucket>();
  for (const bucket of buckets) {
    bucketsByKey.set(bucket.date, bucket);
  }

  for (const entry of history) {
    const watchDate = new Date(entry.watchedAt);
    const localDay = startOfLocalDay(watchDate);
    const dayKey = formatLocalDateKey(localDay);
    const bucket = bucketsByKey.get(dayKey);
    if (bucket) {
      bucket.episodesWatched = bucket.episodesWatched + ONE_OCCURRENCE;
    }
  }

  return buckets;
}

function computeLibraryStatusCounts(library: LibraryEntry[]): LibraryStatusCount[] {
  const countsByStatus = new Map<LibraryStatus, number>();
  for (const entry of library) {
    const previous = countsByStatus.get(entry.status) ?? ZERO_COUNT;
    countsByStatus.set(entry.status, previous + ONE_OCCURRENCE);
  }
  const result: LibraryStatusCount[] = [];
  for (const [status, count] of countsByStatus.entries()) {
    result.push({ status, count });
  }
  return result;
}

export function computeWatchStatistics(
  history: WatchHistoryEntry[],
  library: LibraryEntry[],
): WatchStatistics {
  const totalEpisodesWatched = history.length;

  const uniqueAnimeUrls = new Set<string>();
  const uniqueDayKeys = new Set<string>();
  for (const entry of history) {
    uniqueAnimeUrls.add(entry.animeSourceUrl);
    const watchDate = new Date(entry.watchedAt);
    uniqueDayKeys.add(formatLocalDateKey(startOfLocalDay(watchDate)));
  }

  const totalMinutesWatched = totalEpisodesWatched * DEFAULT_EPISODE_MINUTES;
  const totalHoursWatched = totalMinutesWatched / MINUTES_PER_HOUR;

  return {
    totalEpisodesWatched,
    totalUniqueAnimes: uniqueAnimeUrls.size,
    totalHoursWatched,
    currentStreakDays: computeCurrentStreak(uniqueDayKeys),
    longestStreakDays: computeLongestStreak(uniqueDayKeys),
    topAnimes: computeTopAnimes(history),
    topDrivers: computeTopDrivers(history),
    activityLast30Days: computeActivityLast30Days(history),
    libraryByStatus: computeLibraryStatusCounts(library),
    totalLibraryEntries: library.length,
  };
}
