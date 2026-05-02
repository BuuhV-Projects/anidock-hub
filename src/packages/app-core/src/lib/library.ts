// Higher-level helpers for the user library: upserting an entry from an anime
// view, toggling status, editing tags. The page-level code (AnimeDetails,
// Library page) should call these instead of poking the IndexedDB directly,
// so concerns like timestamp bumping and id derivation stay in one place.

import {
  buildLibraryEntryId,
  db,
  LibraryEntry,
  LibraryStatus,
  LocalAnime,
} from './indexedDB';

const MIN_SCORE = 1;
const MAX_SCORE = 10;

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeTag(rawTag: string): string {
  return rawTag.trim();
}

function dedupeTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const tag of tags) {
    const normalized = normalizeTag(tag);
    if (normalized.length === 0) {
      continue;
    }
    const key = normalized.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(normalized);
  }
  return result;
}

export async function getOrCreateLibraryEntry(
  driverId: string,
  anime: Pick<LocalAnime, 'sourceUrl' | 'title' | 'coverUrl'>,
): Promise<LibraryEntry> {
  const entryId = buildLibraryEntryId(driverId, anime.sourceUrl);
  const existing = await db.getLibraryEntry(entryId);
  if (existing) {
    return existing;
  }

  const created: LibraryEntry = {
    id: entryId,
    driverId,
    animeSourceUrl: anime.sourceUrl,
    animeTitle: anime.title,
    animeCover: anime.coverUrl,
    status: 'planned',
    tags: [],
    addedAt: nowIso(),
    updatedAt: nowIso(),
  };
  await db.saveLibraryEntry(created);
  return created;
}

export async function setLibraryStatus(
  driverId: string,
  anime: Pick<LocalAnime, 'sourceUrl' | 'title' | 'coverUrl'>,
  status: LibraryStatus,
): Promise<LibraryEntry> {
  const entry = await getOrCreateLibraryEntry(driverId, anime);
  const updated: LibraryEntry = {
    ...entry,
    status,
    animeTitle: anime.title,
    animeCover: anime.coverUrl,
    updatedAt: nowIso(),
  };
  await db.saveLibraryEntry(updated);
  return updated;
}

export async function addLibraryTag(
  entryId: string,
  rawTag: string,
): Promise<LibraryEntry | undefined> {
  const entry = await db.getLibraryEntry(entryId);
  if (!entry) {
    return undefined;
  }
  const merged = dedupeTags([...entry.tags, rawTag]);
  if (merged.length === entry.tags.length) {
    return entry;
  }
  const updated: LibraryEntry = {
    ...entry,
    tags: merged,
    updatedAt: nowIso(),
  };
  await db.saveLibraryEntry(updated);
  return updated;
}

export async function removeLibraryTag(
  entryId: string,
  tag: string,
): Promise<LibraryEntry | undefined> {
  const entry = await db.getLibraryEntry(entryId);
  if (!entry) {
    return undefined;
  }
  const target = tag.toLowerCase();
  const filtered = entry.tags.filter(existingTag => existingTag.toLowerCase() !== target);
  if (filtered.length === entry.tags.length) {
    return entry;
  }
  const updated: LibraryEntry = {
    ...entry,
    tags: filtered,
    updatedAt: nowIso(),
  };
  await db.saveLibraryEntry(updated);
  return updated;
}

export async function setLibraryScore(
  entryId: string,
  score: number | undefined,
): Promise<LibraryEntry | undefined> {
  const entry = await db.getLibraryEntry(entryId);
  if (!entry) {
    return undefined;
  }
  let normalizedScore: number | undefined;
  if (score === undefined) {
    normalizedScore = undefined;
  } else if (score < MIN_SCORE) {
    normalizedScore = MIN_SCORE;
  } else if (score > MAX_SCORE) {
    normalizedScore = MAX_SCORE;
  } else {
    normalizedScore = score;
  }
  const updated: LibraryEntry = {
    ...entry,
    score: normalizedScore,
    updatedAt: nowIso(),
  };
  await db.saveLibraryEntry(updated);
  return updated;
}

export async function setLibraryNotes(
  entryId: string,
  notes: string,
): Promise<LibraryEntry | undefined> {
  const entry = await db.getLibraryEntry(entryId);
  if (!entry) {
    return undefined;
  }
  const trimmed = notes.trim();
  const updated: LibraryEntry = {
    ...entry,
    notes: trimmed.length === 0 ? undefined : trimmed,
    updatedAt: nowIso(),
  };
  await db.saveLibraryEntry(updated);
  return updated;
}

export async function removeFromLibrary(entryId: string): Promise<void> {
  await db.deleteLibraryEntry(entryId);
}

export function collectAllTags(entries: LibraryEntry[]): string[] {
  const tagsLowerToOriginal = new Map<string, string>();
  for (const entry of entries) {
    for (const tag of entry.tags) {
      const key = tag.toLowerCase();
      if (!tagsLowerToOriginal.has(key)) {
        tagsLowerToOriginal.set(key, tag);
      }
    }
  }
  const tags = Array.from(tagsLowerToOriginal.values());
  tags.sort((firstTag, secondTag) => firstTag.localeCompare(secondTag));
  return tags;
}

export const LIBRARY_STATUS_LABELS_PT: Record<LibraryStatus, string> = {
  watching: 'Assistindo',
  planned: 'Planejado',
  paused: 'Pausado',
  completed: 'Concluído',
  dropped: 'Abandonado',
};
