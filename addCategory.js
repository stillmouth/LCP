const { ipcRenderer } = require("electron");

document.getElementById("addCategoryBtn").addEventListener("click", () => {
    const categoryName = document.getElementById("categoryName").value;
    ipcRenderer.send("add-category", categoryName);
});

// Handle errors
ipcRenderer.on("category-add-failed", (event, message) => {
    alert(message);
});