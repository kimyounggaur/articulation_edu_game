import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildClassLink,
  defaultSavedGame,
  isSavedGame,
  parseClassLink,
  parseSavedGame,
  readStorage,
  STORAGE_KEY,
  useGame,
  writeStorage,
  type StorageLike,
} from './game';

describe('durable storage', () => {
  it('round-trips valid progress and sound while retaining no session state', () => {
    const data = defaultSavedGame();
    data.progress.stars['1-1'] = 3;
    data.progress.introDone['1-0'] = true;
    data.progress.stats.stac = { seen: 5, first: 4 };
    data.settings.soundOn = false;
    let serialized = '';
    const storage: StorageLike = {
      getItem: (key) => key === STORAGE_KEY ? serialized : null,
      setItem: (key, value) => { expect(key).toBe(STORAGE_KEY); serialized = value; },
    };
    expect(writeStorage(storage, data)).toBe(true);
    expect(readStorage(storage)).toEqual({ data, available: true });
    expect(Object.keys(JSON.parse(serialized))).toEqual(['progress', 'settings']);
  });

  it('starts safely with malformed JSON, missing structures or impossible counts', () => {
    for (const raw of ['{', 'null', '[]', '{}', '{"progress":{},"settings":{"soundOn":true}}']) {
      expect(parseSavedGame(raw)).toEqual(defaultSavedGame());
    }
    const invalid = defaultSavedGame();
    invalid.progress.stats.acc = { seen: 2, first: 3 };
    expect(isSavedGame(invalid)).toBe(false);
    expect(parseSavedGame(JSON.stringify(invalid))).toEqual(defaultSavedGame());
  });

  it('rejects unknown mission ids, fractional stars, negative counts, unexpected fields', () => {
    const negative = defaultSavedGame();
    negative.progress.stats.ten.seen = -1;
    const future = { ...defaultSavedGame(), activeMission: { answer: 'stac' } };
    const invalidStars = defaultSavedGame();
    Object.assign(invalidStars.progress.stars, { '9-1': 3 });
    const fractional = defaultSavedGame();
    Object.assign(fractional.progress.stars, { '1-1': 2.5 });
    for (const invalid of [negative, future, invalidStars, fractional]) expect(isSavedGame(invalid)).toBe(false);
  });

  it('works without storage or when read/write access is denied', () => {
    const denied: StorageLike = {
      getItem: () => { throw new Error('denied'); },
      setItem: () => { throw new Error('quota exceeded'); },
    };
    expect(readStorage(null)).toEqual({ data: defaultSavedGame(), available: false });
    expect(readStorage(denied)).toEqual({ data: defaultSavedGame(), available: false });
    expect(writeStorage(null, defaultSavedGame())).toBe(false);
    expect(writeStorage(denied, defaultSavedGame())).toBe(false);
  });
});

describe('classroom links', () => {
  it('round-trips all six stage scopes with and without muted sound', () => {
    for (let open = 1; open <= 6; open++) for (const soundOff of [true, false]) {
      const link = buildClassLink('https://example.com/play?open=1&old=yes#old', open, soundOff);
      expect(parseClassLink(link)).toEqual({ open, soundOff });
      expect(new URL(link).searchParams.has('old')).toBe(false);
      expect(new URL(link).hash).toBe('');
      expect(parseClassLink(new URL(link).search)).toEqual({ open, soundOff });
    }
  });

  it('uses no temporary unlock for malformed, out-of-range or non-integer scope', () => {
    for (const value of ['0', '7', '-1', 'NaN', '2.5', '03', '']) {
      expect(parseClassLink(`?open=${value}&sound=off`)).toEqual({ open: 0, soundOff: true });
    }
    expect(parseClassLink('?open=3&sound=on')).toEqual({ open: 3, soundOff: false });
    expect(parseClassLink('')).toEqual({ open: 0, soundOff: false });
  });
});

describe('session sound and progress persistence', () => {
  let entries: Map<string, string>;
  const installWindow = (search: string) => {
    vi.stubGlobal('window', {
      location: { search },
      localStorage: {
        getItem: (key: string) => entries.get(key) ?? null,
        setItem: (key: string, value: string) => { entries.set(key, value); },
      },
    });
  };

  beforeEach(() => {
    entries = new Map();
    useGame.setState({ ...defaultSavedGame(), classOpen: 0, soundOverride: null,
      hydrated: false, storageAvailable: true });
  });
  afterEach(() => vi.unstubAllGlobals());

  it('keeps classroom scope and sound overrides out of saves while saving new progress', () => {
    const original = defaultSavedGame();
    entries.set(STORAGE_KEY, JSON.stringify(original));
    installWindow('?open=3&sound=off');
    useGame.getState().hydrate();
    expect(useGame.getState().classOpen).toBe(3);
    expect(useGame.getState().soundOverride).toBe(false);
    useGame.getState().setSound(true);
    useGame.getState().setSound(false);
    useGame.getState().completeIntro(1);
    const saved = parseSavedGame(entries.get(STORAGE_KEY) ?? null);
    expect(saved.settings.soundOn).toBe(true);
    expect(saved.progress).not.toEqual(original.progress);
    expect(JSON.parse(entries.get(STORAGE_KEY)!)).not.toHaveProperty('classOpen');
    expect(JSON.parse(entries.get(STORAGE_KEY)!)).not.toHaveProperty('soundOverride');
  });

  it('persists normal sound changes and preserves sound when clearing progress', () => {
    installWindow('');
    useGame.getState().hydrate();
    useGame.getState().setSound(false);
    useGame.getState().completeIntro(1);
    useGame.getState().resetProgress();
    expect(parseSavedGame(entries.get(STORAGE_KEY) ?? null)).toEqual({
      progress: defaultSavedGame().progress, settings: { soundOn: false },
    });
  });

  it('does not rehydrate temporary settings when a screen renders again', () => {
    installWindow('?open=2&sound=off');
    useGame.getState().hydrate();
    useGame.getState().setSound(true);
    useGame.getState().hydrate();
    expect(useGame.getState().soundOverride).toBe(true);
  });
});
