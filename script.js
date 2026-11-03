const lostBtn = document.getElementById("lostBtn");
const foundBtn = document.getElementById("foundBtn");
const items = document.getElementById("items");

lostBtn.addEventListener("click", function() {
    const itemName = prompt("What item have you lost?");
    
    if (itemName && itemName.trim() !== "") {
        const item = document.createElement("p");
        item.textContent = "Lost item: " + itemName;
        items.appendChild(item);
        alert("Your lost item has been added!");
    }
});

foundBtn.addEventListener("click", function() {
    const itemName = prompt("What item have you found?");
    
    if (itemName && itemName.trim() !== "") {
        const item = document.createElement("p");
        item.textContent = "Found item: " + itemName;
        items.appendChild(item);
        alert("Your found item has been added!");
    }
});
