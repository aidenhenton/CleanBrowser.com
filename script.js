const DEFAULT_FAVORITES = [
  { name: "GitHub", url: "https://github.com", color: "#dce4dd" },
  { name: "YouTube", url: "https://youtube.com", color: "#f2d9d4" },
  { name: "Wikipedia", url: "https://wikipedia.org", color: "#dddde0" },
  { name: "News", url: "https://news.google.com", color: "#d9e5f2" }
];

const favoritesElement = document.querySelector("#favorites");
const favoriteDialog = document.querySelector("#favoriteDialog");
const settingsDialog = document.querySelector("#settingsDialog");
const queryInput = document.querySelector("#query");
const homeView = document.querySelector("#homeView");
const browserView = document.querySelector("#browserView");
const pageFrame = document.querySelector("#pageFrame");
const addressInput = document.querySelector("#addressInput");

let favorites = loadFavorites();
let history = loadHistory();

function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem("clear-favorites")) || DEFAULT_FAVORITES;
  } catch {
    return DEFAULT_FAVORITES;
  }
}

function saveFavorites() {
  localStorage.setItem("clear-favorites", JSON.stringify(favorites));
}

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem("clear-history")) || [];
  } catch {
    return [];
  }
}

function saveHistory() {
  localStorage.setItem("clear-history", JSON.stringify(history));
}

function renderHistory() {
  const historyList = document.querySelector("#historyList");
  historyList.replaceChildren();

  if (history.length === 0) {
    const empty = document.createElement("p");
    empty.className = "history-empty";
    empty.textContent = "No pages visited yet.";
    historyList.append(empty);
    return;
  }

  history.forEach((entry) => {
    const item = document.createElement("button");
    item.className = "history-item";
    item.type = "button";
    item.title = entry.url;
    item.textContent = entry.title;
    item.addEventListener("click", () => {
      settingsDialog.close();
      openPage(entry.url);
    });
    historyList.append(item);
  });
}

function normalizeUrl(value) {
  try {
    return new URL(value.includes(".") && !value.includes(" ") ? `https://${value}` : value).href;
  } catch {
    return `https://www.google.com/search?igu=1&q=${encodeURIComponent(value)}`;
  }
}

function openPage(address) {
  const url = normalizeUrl(address);
  homeView.hidden = true;
  browserView.hidden = false;
  document.body.classList.add("browsing");
  pageFrame.src = url;

  let displayAddress;
  try {
    const parsed = new URL(url);
    displayAddress = parsed.searchParams.get("q")
      ? `${parsed.hostname} · ${parsed.searchParams.get("q")}`
      : parsed.hostname;
  } catch {
    displayAddress = url;
  }
  addressInput.value = displayAddress;

  if (!reservedMode) {
    const existing = history.findIndex((entry) => entry.url === url);
    if (existing !== -1) history.splice(existing, 1);
    history.unshift({ title: displayAddress, url, visitedAt: Date.now() });
    history = history.slice(0, 30);
    saveHistory();
  }
  renderHistory();
}

function showHome() {
  document.body.classList.remove("browsing");
  browserView.hidden = true;
  homeView.hidden = false;
  pageFrame.removeAttribute("src");
  queryInput.value = "";
  queryInput.focus();
}

function renderFavorites() {
  favoritesElement.replaceChildren();

  favorites.forEach((favorite, index) => {
    const link = document.createElement("a");
    link.className = "favorite";
    link.href = favorite.url;
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openPage(favorite.url);
    });

    const favicon = document.createElement("span");
    favicon.className = "favicon";
    favicon.style.setProperty("--tile", favorite.color);
    favicon.textContent = favorite.name.slice(0, 1);

    const name = document.createElement("span");
    name.className = "favorite-name";
    name.textContent = favorite.name;

    const remove = document.createElement("button");
    remove.className = "remove-favorite";
    remove.type = "button";
    remove.setAttribute("aria-label", `Remove ${favorite.name}`);
    remove.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg>';
    remove.addEventListener("click", (event) => {
      event.preventDefault();
      favorites.splice(index, 1);
      saveFavorites();
      renderFavorites();
    });

    link.append(favicon, name, remove);
    favoritesElement.append(link);
  });
}

function updateClock() {
  const now = new Date();
  const hour = now.getHours();
  const period = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
  document.querySelector("#greeting").textContent = `Good ${period}.`;
  document.querySelector("#timeLabel").textContent = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(now);
}

document.querySelector("#searchForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const query = queryInput.value.trim();
  if (query) openPage(query);
});

document.querySelector("#homeButton").addEventListener("click", showHome);
document.querySelector("#addressForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const query = addressInput.value.trim();
  if (query) openPage(query);
});
document.querySelector("#backButton").addEventListener("click", () => {
  try {
    pageFrame.contentWindow.history.back();
  } catch {
    showHome();
  }
});
document.querySelector("#reloadButton").addEventListener("click", () => {
  pageFrame.src = pageFrame.src;
});
document.querySelector("#addFavorite").addEventListener("click", () => favoriteDialog.showModal());
document.querySelector("#settingsToggle").addEventListener("click", () => {
  renderHistory();
  settingsDialog.showModal();
});
document.querySelector("#clearHistory").addEventListener("click", () => {
  history = [];
  saveHistory();
  renderHistory();
});
document.querySelector("#focusToggle").addEventListener("click", () => {
  const focused = document.body.classList.toggle("focus-mode");
  document.querySelector("#focusToggle").setAttribute("aria-label", focused ? "Leave focus mode" : "Enter focus mode");
  if (focused) queryInput.focus();
});

document.querySelectorAll("[data-close]").forEach((button) => {
  button.addEventListener("click", () => favoriteDialog.close());
});
document.querySelector("[data-close-settings]").addEventListener("click", () => settingsDialog.close());

document.querySelector("#favoriteForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.querySelector("#favoriteName").value.trim();
  const url = normalizeUrl(document.querySelector("#favoriteUrl").value.trim());
  favorites.push({ name, url, color: "#d9ff43" });
  saveFavorites();
  renderFavorites();
  event.currentTarget.reset();
  favoriteDialog.close();
});

const quietToggle = document.querySelector("#quietToggle");
quietToggle.checked = localStorage.getItem("clear-quiet") === "true";
document.body.classList.toggle("quiet", quietToggle.checked);
quietToggle.addEventListener("change", () => {
  localStorage.setItem("clear-quiet", String(quietToggle.checked));
  document.body.classList.toggle("quiet", quietToggle.checked);
});

const nightToggle = document.querySelector("#nightToggle");
nightToggle.checked = localStorage.getItem("clear-night") === "true";
document.body.classList.toggle("night", nightToggle.checked);
nightToggle.addEventListener("change", () => {
  localStorage.setItem("clear-night", String(nightToggle.checked));
  document.body.classList.toggle("night", nightToggle.checked);
  document.querySelector('meta[name="theme-color"]').content = nightToggle.checked ? "#121310" : "#f3f0e8";
});

const reservedToggle = document.querySelector("#reservedToggle");
let reservedMode = sessionStorage.getItem("clear-reserved") === "true";
reservedToggle.checked = reservedMode;
document.body.classList.toggle("reserved", reservedMode);
reservedToggle.addEventListener("change", () => {
  reservedMode = reservedToggle.checked;
  sessionStorage.setItem("clear-reserved", String(reservedMode));
  document.body.classList.toggle("reserved", reservedMode);
  document.querySelector("#settingsToggle").setAttribute(
    "aria-label",
    reservedMode ? "Reserved mode active; open settings" : "Open settings"
  );
});

const fontChoice = document.querySelector("#fontChoice");
const savedFont = localStorage.getItem("clear-font") || "clean";
fontChoice.value = savedFont;
document.body.classList.toggle("font-editorial", savedFont === "editorial");
document.body.classList.toggle("font-mono", savedFont === "mono");
fontChoice.addEventListener("change", () => {
  document.body.classList.remove("font-editorial", "font-mono");
  if (fontChoice.value !== "clean") document.body.classList.add(`font-${fontChoice.value}`);
  localStorage.setItem("clear-font", fontChoice.value);
});

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    queryInput.focus();
    queryInput.select();
  }
  if (event.key === "Escape" && document.body.classList.contains("focus-mode")) {
    document.body.classList.remove("focus-mode");
  }
});

updateClock();
setInterval(updateClock, 30_000);
renderFavorites();
renderHistory();
