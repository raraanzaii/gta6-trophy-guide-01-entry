// Rendering for the checklist and the trophy detail panel.
// Spoiler rule: with the spoiler shield on, an unearned story trophy shows only
// the placeholder name "Hidden story trophy", its grade and its kind — never its
// real name, description or guide — until it is earned.

export function isSpoilerHidden(trophy, spoilerOn, store) {
  return spoilerOn && trophy.kind === "story" && !store.isEarned(trophy.id);
}

export function trophyMatchesFilters(trophy, filters) {
  if (filters.kind === "missable" && !trophy.missable) return false;
  if (filters.kind !== "all" && filters.kind !== "missable" && trophy.kind !== filters.kind) return false;
  if (filters.grade !== "all" && trophy.grade !== filters.grade) return false;
  if (filters.query) {
    const haystack = `${trophy.name} ${trophy.description}`.toLowerCase();
    if (!haystack.includes(filters.query.toLowerCase())) return false;
  }
  return true;
}

export function formatCountTarget(trophy) {
  if (!trophy.count) return "";
  return trophy.count >= 1000 ? `$${trophy.count.toLocaleString("en-US")}` : `${trophy.count}`;
}

export function buildGradeBadge(trophy) {
  const span = document.createElement("span");
  span.className = `badge badge-${trophy.grade}`;
  span.textContent = trophy.grade.toUpperCase();
  return span;
}

export function buildRowBadges(trophy) {
  const wrap = document.createElement("span");
  wrap.className = "row-meta";
  wrap.append(buildGradeBadge(trophy));
  const kind = document.createElement("span");
  kind.className = "badge badge-kind";
  kind.textContent = trophy.kind.toUpperCase();
  wrap.append(kind);
  if (trophy.missable) {
    const miss = document.createElement("span");
    miss.className = "badge badge-miss";
    miss.textContent = "MISSABLE";
    wrap.append(miss);
  }
  if (trophy.count) {
    const count = document.createElement("span");
    count.className = "badge badge-count";
    count.textContent = `TARGET ${formatCountTarget(trophy)}`;
    wrap.append(count);
  }
  const stage = document.createElement("span");
  stage.className = "badge badge-kind";
  stage.textContent = `STAGE ${trophy.roadmap_stage}`;
  wrap.append(stage);
  return wrap;
}

export function renderTrophyRow(trophy, { store, spoilerOn, selectedId, onToggle, onOpen }) {
  const row = document.createElement("button");
  row.type = "button";
  row.className = "trophy-row";
  if (store.isEarned(trophy.id)) row.classList.add("earned");
  if (trophy.id === selectedId) row.classList.add("selected");

  const check = document.createElement("input");
  check.type = "checkbox";
  check.checked = store.isEarned(trophy.id);
  check.setAttribute("aria-label", `Mark ${trophy.name} earned`);
  check.addEventListener("click", (event) => event.stopPropagation());
  check.addEventListener("change", () => onToggle(trophy.id));
  row.append(check);

  const main = document.createElement("span");
  main.className = "row-main";
  const hidden = isSpoilerHidden(trophy, spoilerOn, store);
  const name = document.createElement("span");
  name.className = hidden ? "row-name hidden-name" : "row-name";
  name.textContent = hidden ? "Hidden story trophy" : trophy.name;
  main.append(name);
  const desc = document.createElement("span");
  desc.className = "row-desc";
  desc.textContent = hidden
    ? "Name and description hidden by the spoiler shield until earned."
    : trophy.description;
  main.append(desc);
  main.append(buildRowBadges(trophy));
  if (trophy.count) {
    const progress = document.createElement("span");
    progress.className = "row-desc";
    progress.textContent = `Progress: ${store.counterOf(trophy.id)} / ${formatCountTarget(trophy)}`;
    main.append(progress);
  }
  row.append(main);
  row.addEventListener("click", () => onOpen(trophy.id));
  return row;
}

export function renderTrophyDetail(trophy, { store, spoilerOn, onCounter }) {
  const card = document.createElement("div");
  const hidden = isSpoilerHidden(trophy, spoilerOn, store);
  const title = document.createElement("h2");
  title.textContent = hidden ? "Hidden story trophy" : trophy.name;
  if (hidden) title.className = "hidden-name";
  card.append(title);

  const meta = document.createElement("div");
  meta.append(buildRowBadges(trophy));
  card.append(meta);

  const desc = document.createElement("p");
  desc.className = "detail-desc";
  desc.textContent = hidden ? "Description hidden by the spoiler shield until earned." : trophy.description;
  card.append(desc);

  if (hidden) {
    const note = document.createElement("p");
    note.className = "detail-guide";
    note.textContent = "Earn this story trophy in game, tick it off in the checklist, and its guide is revealed here.";
    card.append(note);
    return card;
  }

  if (trophy.missable && trophy.missable_note) {
    const miss = document.createElement("p");
    miss.className = "miss-note";
    miss.textContent = trophy.missable_note;
    card.append(miss);
  }

  const guideHead = document.createElement("h3");
  guideHead.textContent = "GUIDE — IN OUR WORDS, SOURCES CITED";
  card.append(guideHead);
  const guide = document.createElement("p");
  guide.className = "detail-guide";
  guide.textContent = trophy.guide;
  card.append(guide);

  const stepsHead = document.createElement("h3");
  stepsHead.textContent = "STEPS";
  card.append(stepsHead);
  const steps = document.createElement("ol");
  for (const step of trophy.steps ?? []) {
    const item = document.createElement("li");
    item.textContent = step;
    steps.append(item);
  }
  card.append(steps);

  if (trophy.count) {
    const counterHead = document.createElement("h3");
    counterHead.textContent = "PROGRESS COUNTER";
    card.append(counterHead);
    const box = document.createElement("div");
    box.className = "counter-box";
    const minus = document.createElement("button");
    minus.type = "button";
    minus.textContent = "−";
    minus.addEventListener("click", () => onCounter(trophy.id, store.counterOf(trophy.id) - 1));
    const now = document.createElement("span");
    now.className = "counter-now";
    now.textContent = `${store.counterOf(trophy.id)} / ${formatCountTarget(trophy)}`;
    const plus = document.createElement("button");
    plus.type = "button";
    plus.textContent = "+";
    plus.addEventListener("click", () => onCounter(trophy.id, store.counterOf(trophy.id) + 1));
    box.append(minus, now, plus);
    card.append(box);
  }

  const sourcesHead = document.createElement("h3");
  sourcesHead.textContent = "SOURCES";
  card.append(sourcesHead);
  const sources = document.createElement("ul");
  sources.className = "sources-list";
  for (const source of trophy.sources ?? []) {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = source.url;
    link.textContent = source.name;
    link.target = "_blank";
    link.rel = "noreferrer";
    item.append(link);
    sources.append(item);
  }
  card.append(sources);
  return card;
}

export function summariseProgress(trophies, store) {
  const earned = trophies.filter((trophy) => store.isEarned(trophy.id));
  const perGrade = {};
  for (const grade of ["platinum", "gold", "silver", "bronze"]) {
    const total = trophies.filter((trophy) => trophy.grade === grade).length;
    const got = earned.filter((trophy) => trophy.grade === grade).length;
    perGrade[grade] = { got, total };
  }
  return {
    earnedCount: earned.length,
    total: trophies.length,
    percent: Math.round((earned.length / trophies.length) * 100),
    perGrade,
  };
}
