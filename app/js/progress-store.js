// Progress store for the Leonida Trophy Atlas: earned flags and per-trophy counters,
// persisted in localStorage, exportable to a JSON file and importable back.
const STORAGE_KEY = "leonida-trophy-atlas-v1";

export function createProgressStore(storage) {
  let state = loadStoredProgress(storage);
  return {
    isEarned(trophyId) {
      return state.earned.includes(trophyId);
    },
    toggleEarned(trophyId) {
      state.earned = state.earned.includes(trophyId)
        ? state.earned.filter((id) => id !== trophyId)
        : [...state.earned, trophyId];
      persistStoredProgress(storage, state);
    },
    counterOf(trophyId) {
      return state.counters[trophyId] ?? 0;
    },
    setCounter(trophyId, value) {
      state.counters[trophyId] = Math.max(0, value);
      persistStoredProgress(storage, state);
    },
    earnedIds() {
      return [...state.earned];
    },
    replaceAll(nextState) {
      state = normaliseProgress(nextState);
      persistStoredProgress(storage, state);
    },
    snapshot() {
      return normaliseProgress(state);
    },
  };
}

export function loadStoredProgress(storage) {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    return raw ? normaliseProgress(JSON.parse(raw)) : { earned: [], counters: {} };
  } catch {
    return { earned: [], counters: {} };
  }
}

export function persistStoredProgress(storage, state) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be unavailable (private mode); the tracker still works in memory.
  }
}

export function normaliseProgress(candidate) {
  const earned = Array.isArray(candidate?.earned)
    ? [...new Set(candidate.earned.filter((id) => Number.isInteger(id)))]
    : [];
  const counters = {};
  if (candidate?.counters && typeof candidate.counters === "object") {
    for (const [key, value] of Object.entries(candidate.counters)) {
      if (Number.isFinite(value) && value > 0) counters[key] = Math.floor(value);
    }
  }
  return { earned, counters };
}

export function buildExportFileName(date) {
  const stamp = date.toISOString().slice(0, 10);
  return `leonida-trophy-progress-${stamp}.json`;
}

export function downloadProgressExport(store, documentRef) {
  const payload = JSON.stringify(
    { app: "leonida-trophy-atlas", version: 1, ...store.snapshot() },
    null,
    2,
  );
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = documentRef.createElement("a");
  anchor.href = url;
  anchor.download = buildExportFileName(new Date());
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function readProgressImport(file) {
  const text = await file.text();
  return normaliseProgress(JSON.parse(text));
}

// Deterministic demo state used only when the page URL carries ?demo=1,
// so screenshots and shared links show a believable mid-run tracker.
export function applyDemoProgress(store) {
  store.replaceAll({
    earned: [2, 3, 8, 16, 21],
    counters: { 15: 96, 17: 19, 28: 6, 31: 37, 35: 44, 42: 21 },
  });
}
