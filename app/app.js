// GTA VI trophy guide: tracker, filters, spoiler setting, export and import.
// Everything is local: progress lives in localStorage on this device only,
// the guide data comes from data/trophies.json, and nothing is fetched
// from the network while you browse.
const STORE_KEY = "gta6-trophy-guide-progress-v1";
const SPOILER_KEY = "gta6-trophy-guide-spoiler-v1";
const DEMO_EARNED = [2, 3, 4, 8, 16, 19, 20, 21, 28, 32, 35, 53];
const KIND_LABELS = {
  story: "Story",
  side: "Side quest",
  collectible: "Collectible",
  activity: "Activity",
  exploration: "Exploration",
  misc: "One-off",
  completion: "Completion",
};

const params = new URLSearchParams(location.search);
const demoMode = params.get("demo") === "1";
const focusId = Number(params.get("focus") || "0");
const startView = params.get("view") === "roadmap" ? "roadmap" : "trophies";

// Deep links for sharing a filtered view: kind, grade and show take the
// same values as the matching controls, and are ignored when invalid.
function applyParam(select, value) {
  if (value && [...select.options].some((o) => o.value === value)) select.value = value;
}

const cardsEl = document.getElementById("cards");
const emptyEl = document.getElementById("empty");
const searchEl = document.getElementById("search");
const kindEl = document.getElementById("kind");
const gradeEl = document.getElementById("grade");
const earnedFilterEl = document.getElementById("earnedFilter");
const spoilerEl = document.getElementById("spoiler");
const progressText = document.getElementById("progressText");
const progressPct = document.getElementById("progressPct");
const progressBar = document.getElementById("progressBar");
const gradeCounts = document.getElementById("gradeCounts");
const demoNote = document.getElementById("demoNote");

let earned = new Set();
if (!demoMode) {
  try {
    earned = new Set(JSON.parse(localStorage.getItem(STORE_KEY) || "[]"));
  } catch {
    earned = new Set();
  }
} else {
  earned = new Set(DEMO_EARNED);
  demoNote.hidden = false;
}

let spoilerOn = true;
if (params.get("spoilers") === "off") {
  spoilerOn = false;
} else if (!demoMode) {
  spoilerOn = localStorage.getItem(SPOILER_KEY) !== "off";
}
spoilerEl.checked = spoilerOn;

const data = await (await fetch("data/trophies.json")).json();
const trophies = data.trophies;

function save() {
  if (demoMode) return;
  localStorage.setItem(STORE_KEY, JSON.stringify([...earned]));
  localStorage.setItem(SPOILER_KEY, spoilerOn ? "on" : "off");
}

function isMasked(t) {
  return spoilerOn && t.hidden && !earned.has(t.id);
}

function badge(text, cls) {
  const s = document.createElement("span");
  s.className = "badge " + cls;
  s.textContent = text;
  return s;
}

function makeCard(t) {
  const card = document.createElement("article");
  card.className = "card grade-" + t.grade + (earned.has(t.id) ? " earned" : "");
  card.id = "trophy-" + t.id;
  if (focusId === t.id) card.classList.add("flash");

  const head = document.createElement("div");
  head.className = "card-head";
  const box = document.createElement("input");
  box.type = "checkbox";
  box.checked = earned.has(t.id);
  box.setAttribute("aria-label", "Mark " + t.name + " as earned");
  box.addEventListener("change", () => {
    if (box.checked) earned.add(t.id);
    else earned.delete(t.id);
    save();
    render();
  });
  head.append(box);

  const title = document.createElement("div");
  title.className = "card-title";
  const h = document.createElement("h2");
  h.textContent = isMasked(t) ? "Hidden trophy #" + t.id : t.name;
  title.append(h);
  const official = document.createElement("p");
  official.className = "official";
  official.textContent = isMasked(t)
    ? "Hidden by the game until you earn it."
    : "Official: " + t.description;
  title.append(official);

  const badges = document.createElement("div");
  badges.className = "badges";
  badges.append(badge(t.grade, "grade-" + t.grade));
  badges.append(badge(KIND_LABELS[t.kind] || t.kind, ""));
  if (t.target && t.target !== "unconfirmed") badges.append(badge(t.target, "target-badge"));
  if (t.hidden) badges.append(badge("Hidden", "hidden-badge"));
  if (t.missable === "possible") badges.append(badge("Possibly missable", "missable-badge"));
  if (!t.confirmed) badges.append(badge("Unconfirmed", "unconfirmed-badge"));
  if (earned.has(t.id)) badges.append(badge("Earned", "earned-badge"));
  title.append(badges);
  head.append(title);
  card.append(head);

  if (isMasked(t)) {
    const mask = document.createElement("p");
    mask.className = "spoiler-mask";
    mask.textContent = "Story trophy — its name, description and guide are hidden while spoilers are on. Tick it earned, or reveal it below.";
    const reveal = document.createElement("button");
    reveal.type = "button";
    reveal.textContent = "Reveal spoilers";
    reveal.addEventListener("click", () => {
      spoilerOn = false;
      spoilerEl.checked = false;
      save();
      render();
    });
    mask.append(reveal);
    card.append(mask);
    return card;
  }

  const guide = document.createElement("p");
  guide.className = "guide";
  guide.textContent = t.guide;
  card.append(guide);

  const steps = document.createElement("ol");
  steps.className = "steps";
  for (const step of t.steps) {
    const li = document.createElement("li");
    li.textContent = step;
    steps.append(li);
  }
  card.append(steps);

  const source = document.createElement("p");
  source.className = "source-line";
  const strong = document.createElement("strong");
  strong.textContent = "Source: ";
  source.append(strong);
  source.append(document.createTextNode(t.source + "."));
  card.append(source);
  return card;
}

function visible(t) {
  const q = searchEl.value.trim().toLowerCase();
  if (q) {
    const hay = (t.name + " " + t.description + " " + t.guide + " " + t.steps.join(" ")).toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (kindEl.value !== "all" && t.kind !== kindEl.value) return false;
  if (gradeEl.value !== "all" && t.grade !== gradeEl.value) return false;
  const f = earnedFilterEl.value;
  if (f === "earned" && !earned.has(t.id)) return false;
  if (f === "unearned" && earned.has(t.id)) return false;
  if (f === "missable" && t.missable !== "possible") return false;
  if (f === "hidden" && !t.hidden) return false;
  return true;
}

function render() {
  cardsEl.replaceChildren();
  let shown = 0;
  for (const t of trophies) {
    if (!visible(t)) continue;
    cardsEl.append(makeCard(t));
    shown += 1;
  }
  emptyEl.hidden = shown !== 0;

  const total = trophies.length;
  const n = earned.size;
  const pct = Math.round((n / total) * 100);
  progressText.textContent = n + " of " + total + " earned";
  progressPct.textContent = pct + "%";
  progressBar.style.width = pct + "%";
  const byGrade = ["platinum", "gold", "silver", "bronze"].map((g) => {
    const got = trophies.filter((t) => t.grade === g && earned.has(t.id)).length;
    const all = trophies.filter((t) => t.grade === g).length;
    return g + " " + got + "/" + all;
  });
  gradeCounts.textContent = byGrade.join("  ·  ") + "  ·  " + trophies.filter((t) => t.hidden).length + " hidden  ·  " + trophies.filter((t) => t.missable === "possible").length + " possibly missable";

  if (focusId) {
    const el = document.getElementById("trophy-" + focusId);
    if (el) el.scrollIntoView({ block: "center" });
  }
}

function showView(which) {
  const trophiesView = document.getElementById("viewTrophies");
  const roadmapView = document.getElementById("viewRoadmap");
  const tabT = document.getElementById("tabTrophies");
  const tabR = document.getElementById("tabRoadmap");
  const roadmap = which === "roadmap";
  trophiesView.hidden = roadmap;
  roadmapView.hidden = !roadmap;
  tabT.classList.toggle("active", !roadmap);
  tabR.classList.toggle("active", roadmap);
  tabT.setAttribute("aria-pressed", String(!roadmap));
  tabR.setAttribute("aria-pressed", String(roadmap));
}

document.getElementById("tabTrophies").addEventListener("click", () => showView("trophies"));
document.getElementById("tabRoadmap").addEventListener("click", () => showView("roadmap"));
searchEl.addEventListener("input", render);
kindEl.addEventListener("change", render);
gradeEl.addEventListener("change", render);
earnedFilterEl.addEventListener("change", render);
spoilerEl.addEventListener("change", () => {
  spoilerOn = spoilerEl.checked;
  save();
  render();
});

document.getElementById("export").addEventListener("click", () => {
  const payload = { game: "Grand Theft Auto VI", platform: "PlayStation 5", earned: [...earned].sort((a, b) => a - b) };
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
  a.download = "gta6-trophy-progress.json";
  a.click();
  URL.revokeObjectURL(a.href);
});

document.getElementById("import").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const ids = Array.isArray(parsed) ? parsed : parsed.earned;
    const known = new Set(trophies.map((t) => t.id));
    const names = new Set(trophies.map((t) => t.name));
    const next = new Set();
    for (const item of ids || []) {
      if (typeof item === "number" && known.has(item)) next.add(item);
      else if (typeof item === "string" && names.has(item)) next.add(trophies.find((t) => t.name === item).id);
    }
    earned = next;
    save();
    render();
  } catch {
    alert("That file could not be read as trophy progress.");
  }
  e.target.value = "";
});

document.getElementById("reset").addEventListener("click", () => {
  if (!confirm("Clear all earned trophies on this device?")) return;
  earned = new Set();
  save();
  render();
});

showView(startView);
applyParam(kindEl, params.get("kind"));
applyParam(gradeEl, params.get("grade"));
applyParam(earnedFilterEl, params.get("show"));
render();
