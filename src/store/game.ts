import { create } from 'zustand';
import {
  applyResult,
  completeIntro as applyIntro,
  emptyProgress,
  type Problem,
  type Progress,
} from '../engine/engine';

export const STORAGE_KEY = 'snowpath.v1';

export interface Settings { soundOn: boolean }
export interface SavedGame { progress: Progress; settings: Settings }
export interface ClassLink { open: number; soundOff: boolean }
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const KINDS = ['stac', 'ten', 'leg', 'acc', 'marc'] as const;
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isCount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const exactKeys = (value: Record<string, unknown>, keys: readonly string[]) =>
  Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));

export function defaultSavedGame(): SavedGame {
  return { progress: emptyProgress(), settings: { soundOn: true } };
}

/** Only durable progress and the saved preference may cross this boundary. */
export function isSavedGame(value: unknown): value is SavedGame {
  if (!isRecord(value) || !exactKeys(value, ['progress', 'settings'])) return false;
  const { progress, settings } = value;
  if (!isRecord(progress) || !exactKeys(progress, ['stars', 'introDone', 'stats'])) return false;
  if (!isRecord(settings) || !exactKeys(settings, ['soundOn']) || typeof settings.soundOn !== 'boolean') return false;
  if (!isRecord(progress.stars) || !isRecord(progress.introDone) || !isRecord(progress.stats)) return false;
  if (!Object.entries(progress.stars).every(([id, stars]) =>
    /^(?:[1-6]-[1-3]|6-4)$/.test(id) && isCount(stars) && stars <= 3)) return false;
  if (!Object.entries(progress.introDone).every(([id, done]) =>
    /^[1-6]-0$/.test(id) && typeof done === 'boolean')) return false;
  const stats = progress.stats;
  if (!exactKeys(stats, KINDS)) return false;
  return KINDS.every((kind) => {
    const stat = stats[kind];
    return isRecord(stat) && exactKeys(stat, ['seen', 'first']) &&
      isCount(stat.seen) && isCount(stat.first) && stat.first <= stat.seen;
  });
}

export function parseSavedGame(raw: string | null): SavedGame {
  if (raw === null) return defaultSavedGame();
  try {
    const value: unknown = JSON.parse(raw);
    return isSavedGame(value) ? value : defaultSavedGame();
  } catch {
    return defaultSavedGame();
  }
}

export function readStorage(storage: StorageLike | null): { data: SavedGame; available: boolean } {
  if (!storage) return { data: defaultSavedGame(), available: false };
  try {
    return { data: parseSavedGame(storage.getItem(STORAGE_KEY)), available: true };
  } catch {
    return { data: defaultSavedGame(), available: false };
  }
}

export function writeStorage(storage: StorageLike | null, data: SavedGame): boolean {
  if (!storage) return false;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({ progress: data.progress, settings: data.settings }));
    return true;
  } catch {
    return false;
  }
}

/** Accept a search string or full URL, without relying on browser globals. */
export function parseClassLink(input: string): ClassLink {
  let search: URLSearchParams;
  try {
    search = new URL(input, 'https://snowpath.invalid/').searchParams;
  } catch {
    return { open: 0, soundOff: false };
  }
  const value = search.get('open') ?? '';
  return { open: /^[1-6]$/.test(value) ? Number(value) : 0, soundOff: search.get('sound') === 'off' };
}

/** Old parameters and fragments must not leak into a new classroom link. */
export function buildClassLink(base: string, open: number, soundOff: boolean): string {
  const url = new URL(base, 'https://snowpath.invalid/');
  url.search = '';
  url.hash = '';
  const bounded = Number.isFinite(open) ? Math.max(1, Math.min(6, Math.floor(open))) : 1;
  url.searchParams.set('open', String(bounded));
  if (soundOff) url.searchParams.set('sound', 'off');
  return url.toString();
}

function browserStorage(): StorageLike | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

export interface GameStore {
  progress: Progress;
  settings: Settings;
  classOpen: number;
  soundOverride: boolean | null;
  hydrated: boolean;
  storageAvailable: boolean;
  hydrate(): void;
  completeIntro(stage: number): void;
  completeMission(id: string, problems: Problem[], firstTry: boolean[]): void;
  setSound(on: boolean): void;
  resetProgress(): void;
}

export const useGame = create<GameStore>((set, get) => {
  const persist = (data: SavedGame) => {
    const available = writeStorage(browserStorage(), data);
    if (!available) set({ storageAvailable: false });
  };
  return {
    ...defaultSavedGame(),
    classOpen: 0,
    soundOverride: null,
    hydrated: false,
    storageAvailable: true,
    hydrate() {
      if (get().hydrated || typeof window === 'undefined') return;
      const { data, available } = readStorage(browserStorage());
      const link = parseClassLink(window.location.search);
      set({ ...data, classOpen: link.open, soundOverride: link.soundOff ? false : null,
        storageAvailable: available, hydrated: true });
    },
    completeIntro(stage) {
      const progress = applyIntro(get().progress, stage);
      set({ progress });
      persist({ progress, settings: get().settings });
    },
    completeMission(id, problems, firstTry) {
      const progress = applyResult(get().progress, id, problems, { firstTry });
      set({ progress });
      persist({ progress, settings: get().settings });
    },
    setSound(on) {
      if (get().soundOverride !== null) {
        set({ soundOverride: on });
        return;
      }
      const settings = { soundOn: on };
      set({ settings });
      persist({ progress: get().progress, settings });
    },
    resetProgress() {
      const progress = emptyProgress();
      set({ progress });
      persist({ progress, settings: get().settings });
    },
  };
});
