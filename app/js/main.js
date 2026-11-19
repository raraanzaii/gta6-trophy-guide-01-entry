// Leonida Trophy Atlas — app entry point.
// Loads the local data files (same-origin, works offline), wires the tracker
// controls, and supports deterministic URL parameters for shared views and
// screenshots: ?view=roadmap&filter=missable&grade=silver&spoiler=1&open=<id>&demo=1
import { createProgressStore, downloadProgressExport, readProgressImport, applyDemoProgress } from "./progress-store.js";
import { renderTrophyRow, renderTrophyDetail, summariseProgress, trophyMatchesFilters } from "./render-guide.js";
import { renderRoadmapInto } from "./roadmap-view.js";

const params = new URLSearchParams(location.search);
const store = createProgressStore(localStorage);
if (params.get("demo") === "1") applyDemoProgress(store);

const state = {
  view: params.get("view") === "roadmap" ? "roadmap" : "checklist",
  kind: params.get("filter") ?? "all",
  grade: params.get("grade") ?? "all",
  query: params.get("q") ?? "",
  spoiler: params.get("spoiler") === "1",
  selectedId: Number(params.get("open")) || null,
};

let trophies = [];
let roadmap = null;

async function loadLocalData() {
  const [trophyResponse, roadmapResponse] = await Promise.all([
    fetch("data/trophies.json"),
    fetch("data/roadmap.json"),
  ]);
  trophies = (await trophyResponse.json()).trophies;
  roadmap = await roadmapResponse.json();
}

function refreshProgressHeader() {
  const summary = summariseProgress(trophies, store);
  document.querySelector("#progress-count").textContent = `${summary.earnedCount}/${summary.total}`;
  document.querySelector("#progress-pct").textContent = `${summary.percent}% to platinum`;
  document.querySelector("#progress-fill").style.width = `${summary.percent}%`;
  const parts = ["platinum", "gold", "silver", "bronze"].map(
    (grade) => `${grade[0].toUpperCase()}${grade.slice(1)} ${summary.perGrade[grade].got}/${summary.perGrade[grade].total}`,
  );
  document.querySelector("#grade-counts").textContent = parts.join(" · ");
}

function refreshChecklist() {
  const list = document.querySelector("#trophy-list");
  const visible = trophies.filter((trophy) =>
    trophyMatchesFilters(trophy, { kind: state.kind, grade: state.grade, query: state.query }),
  );
  list.replaceChildren(
    ...visible.map((trophy) =>
      renderTrophyRow(trophy, {
        store,
        spoilerOn: state.spoiler,
        selectedId: state.selectedId,
        onToggle: (id) => {
          store.toggleEarned(id);
          refreshAll();
        },
        onOpen: (id) => {
          state.selectedId = id;
          refreshChecklist();
          refreshDetail();
        },
      }),
    ),
  );
  document.querySelector("#list-summary").textContent =
    `Showing ${visible.length} of ${trophies.length} trophies` +
    (state.kind === "missable" ? " — every missable / save-sensitive trophy, with its warning" : "") +
    (state.kind === "online" ? " — none: this list has 0 online trophies" : "");
}

function refreshDetail() {
  const empty = document.querySelector("#detail-empty");
  const card = document.querySelector("#detail-card");
  const trophy = trophies.find((item) => item.id === state.selectedId);
  if (!trophy) {
    empty.hidden = false;
    card.hidden = true;
    return;
  }
  empty.hidden = true;
  card.hidden = false;
  card.replaceChildren(
    renderTrophyDetail(trophy, {
      store,
      spoilerOn: state.spoiler,
      onCounter: (id, value) => {
        store.setCounter(id, value);
        refreshAll();
      },
    }),
  );
}

function refreshRoadmap() {
  document.querySelector("#roadmap-estimate").textContent =
    `${roadmap.estimate} · ${roadmap.online_note}`;
  renderRoadmapInto(document.querySelector("#roadmap-stages"), roadmap, trophies, store);
}

function refreshViewVisibility() {
  const isRoadmap = state.view === "roadmap";
  document.querySelector("#main-layout").hidden = isRoadmap;
  document.querySelector("#roadmap-pane").hidden = !isRoadmap;
  document.querySelector("#view-checklist").classList.toggle("active", !isRoadmap);
  document.querySelector("#view-roadmap").classList.toggle("active", isRoadmap);
}

function refreshAll() {
  refreshProgressHeader();
  refreshChecklist();
  refreshDetail();
  refreshRoadmap();
  refreshViewVisibility();
}

function wireControls() {
  document.querySelector("#view-checklist").addEventListener("click", () => {
    state.view = "checklist";
    refreshViewVisibility();
  });
  document.querySelector("#view-roadmap").addEventListener("click", () => {
    state.view = "roadmap";
    refreshRoadmap();
    refreshViewVisibility();
  });
  for (const chip of document.querySelectorAll("#kind-chips .chip")) {
    chip.classList.toggle("active", chip.dataset.kind === state.kind);
    chip.addEventListener("click", () => {
      state.kind = chip.dataset.kind;
      for (const other of document.querySelectorAll("#kind-chips .chip")) {
        other.classList.toggle("active", other === chip);
      }
      refreshChecklist();
    });
  }
  const gradeSelect = document.querySelector("#grade-filter");
  gradeSelect.value = state.grade;
  gradeSelect.addEventListener("change", () => {
    state.grade = gradeSelect.value;
    refreshChecklist();
  });
  const searchBox = document.querySelector("#search-box");
  searchBox.value = state.query;
  searchBox.addEventListener("input", () => {
    state.query = searchBox.value;
    refreshChecklist();
  });
  const spoilerToggle = document.querySelector("#spoiler-toggle");
  spoilerToggle.checked = state.spoiler;
  spoilerToggle.addEventListener("change", () => {
    state.spoiler = spoilerToggle.checked;
    refreshChecklist();
    refreshDetail();
  });
  document.querySelector("#export-btn").addEventListener("click", () => {
    downloadProgressExport(store, document);
  });
  document.querySelector("#import-file").addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    store.replaceAll(await readProgressImport(file));
    refreshAll();
  });
}

await loadLocalData();
wireControls();
refreshAll();

// Deep-link support: ?scroll=detail brings the open guide panel into view.
if (params.get("scroll") === "detail" && state.selectedId) {
  document.querySelector("#detail-pane").scrollIntoView();
}
