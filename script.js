const itemForm = document.getElementById("itemForm");
const itemsList = document.getElementById("itemsList");
const searchInput = document.getElementById("searchInput");
const message = document.getElementById("message");

let items = JSON.parse(localStorage.getItem("campusItems")) || [];

// Add default values to reports created before Day 3
items = items.map(item => ({
    ...item,
    email: item.email || "",
    resolved: item.resolved || false
}));

function saveItems() {
    localStorage.setItem("campusItems", JSON.stringify(items));
}

function displayItems(searchTerm = "") {
    itemsList.innerHTML = "";

    const filteredItems = items.filter(item => {
        const searchableText =
            ${item.name} ${item.type} ${item.category} ${item.location} ${item.description} ${item.email};

        return searchableText.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (filteredItems.length === 0) {
        itemsList.innerHTML =
            '<p class="empty-message">No items found.</p>';
        return;
    }

    filteredItems.forEach(item => {
        const card = document.createElement("article");
        card.className = "item-card";

        const heading = document.createElement("h3");
        heading.textContent = item.name;

        const type = document.createElement("p");
        type.textContent = "Report: " + item.type;

        const category = document.createElement("p");
        category.textContent = "Category: " + item.category;

        const location = document.createElement("p");
        location.textContent = "Location: " + item.location;

        const description = document.createElement("p");
        description.textContent = "Description: " + item.description;

        const date = document.createElement("p");
        date.textContent = "Reported: " + item.date;

        const status = document.createElement("p");
        status.className = item.resolved
            ? "status resolved"
            : "status";

        status.textContent = item.resolved
            ? "Resolved"
            : "Still Active";

        card.append(
            heading,
            type,
            category,
            location,
            description,
            date,
            status
        );

        // Contact the person who reported the item
        if (item.email) {
            const contactButton = document.createElement("button");
            contactButton.textContent = "Contact Reporter";
            contactButton.className = "contact-button";

            contactButton.addEventListener("click", () => {
                window.location.href =
                    "mailto:" + encodeURIComponent(item.email);
            });

            card.appendChild(contactButton);
        }

        // Mark an item as resolved or active again
        const resolveButton = document.createElement("button");

        resolveButton.textContent = item.resolved
            ? "Mark as Active"
            : "Mark as Resolved";

        resolveButton.className = "resolve-button";

        resolveButton.addEventListener("click", () => {
            items = items.map(savedItem =>
                savedItem.id === item.id
                    ? { ...savedItem, resolved: !savedItem.resolved }
                    : savedItem
            );

            saveItems();
            displayItems(searchInput.value);
        });

        // Delete a report
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete Report";
        deleteButton.className = "delete-button";

        deleteButton.addEventListener("click", () => {
            items = items.filter(
                savedItem => savedItem.id !== item.id
            );

            saveItems();
            displayItems(searchInput.value);
        });

        card.append(resolveButton, deleteButton);
        itemsList.appendChild(card);
    });
}

// Submit a new report
itemForm.addEventListener("submit", function(event) {
    event.preventDefault();
	const newItem = {
        id: Date.now(),
        name: document.getElementById("itemName").value.trim(),
        type: document.getElementById("itemType").value,
        category: document.getElementById("category").value,
        location: document.getElementById("location").value.trim(),
        description: document.getElementById("description").value.trim(),
        email: document.getElementById("email").value.trim(),
        date: new Date().toLocaleDateString(),
        resolved: false
    };

    if (
        !newItem.name ||
        !newItem.type ||
        !newItem.category ||
        !newItem.location ||
        !newItem.description ||
        !newItem.email
    ) {
        message.textContent = "Please complete all fields.";
        return;
    }

    items.unshift(newItem);

    saveItems();

    itemForm.reset();

    message.textContent =
        "Your report was submitted successfully!";

    displayItems();
});

// Search reports
searchInput.addEventListener("input", function() {
    displayItems(searchInput.value);
});

// Display saved reports when the page opens
saveItems();
displayItems();
