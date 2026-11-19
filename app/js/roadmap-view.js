// Roadmap view: the five platinum stages from app/data/roadmap.json,
// each stage listing its trophies in order, earned ones marked done.

export function trophyNameById(trophies, trophyId) {
  return trophies.find((trophy) => trophy.id === trophyId)?.name ?? `#${trophyId}`;
}

export function renderRoadmapStage(stage, trophies, store) {
  const card = document.createElement("article");
  card.className = "stage-card";
  const heading = document.createElement("h3");
  heading.textContent = `Stage ${stage.stage}: ${stage.title}`;
  card.append(heading);
  const hours = document.createElement("span");
  hours.className = "stage-hours";
  hours.textContent = stage.hours.toUpperCase();
  card.append(hours);
  const summary = document.createElement("p");
  summary.textContent = stage.summary;
  card.append(summary);
  const chips = document.createElement("div");
  chips.className = "stage-trophies";
  for (const trophyId of stage.trophy_ids) {
    const chip = document.createElement("span");
    chip.className = "stage-chip";
    if (store.isEarned(trophyId)) chip.classList.add("done");
    chip.textContent = `${store.isEarned(trophyId) ? "✓ " : ""}${trophyNameById(trophies, trophyId)}`;
    chips.append(chip);
  }
  card.append(chips);
  return card;
}

export function renderRoadmapInto(container, roadmap, trophies, store) {
  container.replaceChildren(
    ...roadmap.stages.map((stage) => renderRoadmapStage(stage, trophies, store)),
  );
}
