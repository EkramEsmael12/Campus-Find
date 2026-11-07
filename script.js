"use strict";

const STORAGE_ITEMS = "campusFindItemsV2";
const STORAGE_USER = "campusFindDemoUserV2";

const itemForm = document.getElementById("itemForm");
const itemsList = document.getElementById("itemsList");
const searchInput = document.getElementById("searchInput");
const message = document.getElementById("message");
const authDialog = document.getElementById("authDialog");
const authButton = document.getElementById("authButton");
const authForm = document.getElementById("authForm");
const accountStatus = document.getElementById("accountStatus");
const itemCount = document.getElementById("itemCount");

let activeFilter = "All";
let user = readJSON(STORAGE_USER, null);
let items = readJSON(STORAGE_ITEMS, []).map(item => ({
  ...item,
  id: item.id || `${Date.now()}-${Math.random()}`,
  ownerEmail: item.ownerEmail || item.email || "",
  ownerName: item.ownerName || "Campus member",
  resolved: Boolean(item.resolved)
}));

function readJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function saveItems() {
  localStorage.setItem(STORAGE_ITEMS, JSON.stringify(items));
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function escapeHTML(value) {
  return String(value || "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function updateAccount() {
  accountStatus.textContent = user ? `Signed in as ${user.name}` : "Browsing as guest";
  authButton.textContent = user ? "Sign out" : "Sign in";

  document.getElementById("reportSignInHint").textContent = user
    ? `Posting as ${user.name} · ${user.email}`
    : "Sign in with your name and email to post and manage your reports.";

  document.querySelectorAll(
    "#itemForm input, #itemForm select, #itemForm textarea, #itemForm button[type=submit]"
  ).forEach(element => {
    element.disabled = !user;
  });
}

function renderItems() {
  const query = normalize(searchInput.value);

  const filtered = items.filter(item => {
    const matchesQuery = [
      item.name,
      item.type,
      item.category,
      item.location,
      item.description,
      item.ownerName
    ].some(value => normalize(value).includes(query));

    return matchesQuery && (activeFilter === "All" || item.type === activeFilter);
  });

  itemCount.textContent = String(items.length);
  itemsList.replaceChildren();

  if (!filtered.length) {
    const empty = document.createElement("p");
    empty.className = "empty-message";
    empty.textContent = items.length
      ? "No reports match your search. Try another word or filter."
      : "No reports yet. Sign in and post the first one.";
    itemsList.append(empty);
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement("article");
    card.className = "item-card";

    const owned = user && normalize(user.email) === normalize(item.ownerEmail);
    const resolvedText = item.resolved ? " · Resolved" : "";

    card.innerHTML = `
      <div class="card-top">
        <h3 class="card-title">${escapeHTML(item.name)}</h3>
        <span class="badge ${item.type === "Found" ? "found" : "lost"}">
          ${escapeHTML(item.type)}${resolvedText}
        </span>
      </div>
      <p class="card-meta">${escapeHTML(item.category)} · ${escapeHTML(item.location)}</p>
      <p class="card-description">${escapeHTML(item.description)}</p>
      <div class="card-footer">
        <span class="card-owner">
          Posted by ${escapeHTML(item.ownerName)}
          <span class="card-date">· ${escapeHTML(item.date || "")}</span>
        </span>
        <div class="card-actions"></div>
      </div>
    `;

    const actions = card.querySelector(".card-actions");

    if (item.ownerEmail && !owned) {
      const contact = document.createElement("a");
      contact.className = "small-action";
      contact.textContent = "Contact";
      contact.href = `mailto:${item.ownerEmail}?subject=${encodeURIComponent(`CampusFind: ${item.name}`)}`;
      actions.append(contact);
    }

    if (owned) {
      const resolve = document.createElement("button");
      resolve.type = "button";
      resolve.className = "small-action";
      resolve.textContent = item.resolved ? "Reopen" : "Resolve";
      resolve.addEventListener("click", () => {
        items = items.map(saved =>
          saved.id === item.id ? { ...saved, resolved: !saved.resolved } : saved
        );
        saveItems();
        renderItems();
      });
      actions.append(resolve);

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "small-action delete";
      remove.textContent = "Delete";
      remove.addEventListener("click", () => {
        if (!window.confirm(`Delete the report for “${item.name}”?`)) return;
        items = items.filter(saved => saved.id !== item.id);
        saveItems();
        renderItems();
      });
      actions.append(remove);
    }

    itemsList.append(card);
  });
}

authButton.addEventListener("click", () => {
  if (user) {
    user = null;
    localStorage.removeItem(STORAGE_USER);
    updateAccount();
    message.textContent = "You are signed out.";
  } else {
    authForm.reset();
    authDialog.showModal();
  }
});

document.getElementById("closeDialog").addEventListener("click", () => {
  authDialog.close();
});

authForm.addEventListener("submit", event => {
  event.preventDefault();

  const name = document.getElementById("userName").value.trim();
  const email = document.getElementById("userEmail").value.trim();

  if (!name || !email) return;

  user = { name, email };
  localStorage.setItem(STORAGE_USER, JSON.stringify(user));
  authDialog.close();
  updateAccount();
  message.textContent = `Welcome, ${name}. You can post and manage your reports.`;
});

itemForm.addEventListener("submit", event => {
  event.preventDefault();

  if (!user) {
    message.textContent = "Please sign in before posting.";
    return;
  }

  const newItem = {
    id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
    name: document.getElementById("itemName").value.trim(),
    type: document.getElementById("itemType").value,
    category: document.getElementById("category").value,
    location: document.getElementById("location").value.trim(),
    description: document.getElementById("description").value.trim(),
    ownerName: user.name,
    ownerEmail: user.email,
    date: new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date()),
    resolved: false
  };

  if (
    !newItem.name ||
    !newItem.type ||
    !newItem.category ||
    !newItem.location ||
    !newItem.description
  ) {
    message.textContent = "Please complete each field.";
    return;
  }

  items.unshift(newItem);
  saveItems();
  itemForm.reset();
  message.textContent = "Your report is on the campus board.";
  renderItems();
});

searchInput.addEventListener("input", renderItems);

document.querySelectorAll(".filter-chip").forEach(button => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;

    document.querySelectorAll(".filter-chip").forEach(chip => {
      chip.classList.toggle("active", chip === button);
    });

    renderItems();
  });
});

updateAccount();
saveItems();
renderItems();
