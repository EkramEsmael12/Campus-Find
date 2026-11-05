const itemForm = document.getElementById("itemForm");
const itemsList = document.getElementById("itemsList");
const searchInput = document.getElementById("searchInput");
const message = document.getElementById("message");

// Load previously saved reports
let items = JSON.parse(localStorage.getItem("campusItems")) || [];

// Save reports in browser storage
function saveItems() {
    localStorage.setItem("campusItems", JSON.stringify(items));
}

// Display reports on the website
function displayItems(searchTerm = "") {
    itemsList.innerHTML = "";

    const filteredItems = items.filter(item => {
        const searchableText =
            ${item.name} ${item.type} ${item.category} ${item.location} ${item.description};

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

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete Report";
        deleteButton.className = "delete-button";

        deleteButton.addEventListener("click", () => {
            items = items.filter(savedItem => savedItem.id !== item.id);
            saveItems();
            displayItems(searchInput.value);
        });

        card.append(
            heading,
            type,
            category,
            location,
            description,
            date,
            deleteButton
        );

        itemsList.appendChild(card);
    });
}

// Handle new reports
itemForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const newItem = {
        id: Date.now(),
        name: document.getElementById("itemName").value.trim(),
        type: document.getElementById("itemType").value,
        category: document.getElementById("category").value,
        location: document.getElementById("location").value.trim(),
        description: document.getElementById("description").value.trim(),
        date: new Date().toLocaleDateString()
    };

    if (
        !newItem.name ||
        !newItem.type ||
        !newItem.category ||
        !newItem.location ||
        !newItem.description
    ) {
        message.textContent = "Please complete all fields.";
        return;
    }

    items.unshift(newItem);
    saveItems();

    itemForm.reset();
    message.textContent = "Your report was submitted successfully!";

    displayItems();
});

// Search reports
searchInput.addEventListener("input", function() {
    displayItems(searchInput.value);
});

// Display saved reports when the page opens
displayItems();
