const { ipcRenderer, contextBridge } = require('electron');
const { updateCategoryPanel } = require("./categoryHandler");
const { fetchOrderHistory } = require("./history");
const { exportToExcel } = require("./history");
const { fetchCategories } = require("./categoryDropDown");
const { fetchCategoryWise } = require("./categoryWiseTable");
const { fetchDeletedOrders } = require("./deletedOrdersTable");
const { fetchTodaysOrders } = require("./todaysOrders");
const { updateMainContent } = require("./ui");
window.updateMainContent = updateMainContent;
window.fetchDeletedOrders = fetchDeletedOrders;
window.fetchOrderHistory = fetchOrderHistory;
window.fetchTodaysOrders = fetchTodaysOrders;
window.fetchCategories = fetchCategories;
window.fetchCategoryWise = fetchCategoryWise;
window.exportToExcel = exportToExcel;
window.updateCategoryPanel = updateCategoryPanel;
console.log('Renderer.js loaded');
// Listen for the 'set-user-role' message from the main process
ipcRenderer.on('set-user-role', (event, role) => {
    const content = document.getElementById('content'); // Assuming this is the main container
    if (content) {
        content.classList.add('fade-in');
        console.log(`Received role: ${role}`);
        const billPanel = document.getElementById("bill-panel");
        billPanel.style.display = 'none';
        if (role === 'staff') {
            console.log("Hiding buttons for staff via 'set-user-role'");
            document.getElementById('Analytics').style.display = 'none';
            document.getElementById('History').style.display = 'none';
        }
    }
});

// Open the 'Add Category' window when the green button is clicked
document.body.addEventListener("click", (event) => {
    if (event.target.id === "addCategoryBtn") {
        ipcRenderer.send("open-add-category-window");
    }
});

// Listen for category addition success
ipcRenderer.on("category-added-success", () => {
    alert("Category added successfully!");
    // You can also update the UI dynamically to reflect the new category
});

// Make Order history available globally
