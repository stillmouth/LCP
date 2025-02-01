// Function to handle category button clicks
async function updateMainContent(contentType) {
    const mainContent = document.getElementById("main-content");
    const billPanel = document.getElementById("bill-panel");
    billPanel.style.display = 'none'; // Hide bill panel by default for all categories 
    // Menu Management
    const menuManagement = ["AddItem", "UpdateItem", "DeleteItem"];

    // Analytics
    const analytics = ["SalesOverview", "TopSelling", "Trends"];

    // History

    // Settings
    const settings = ["UserProfile", "ThemeToggle","TaxAndDiscount","PrinterConfig","Security","Help","Exit"];

    // Home Screen
    if (contentType === "Home") {
        mainContent.innerHTML = `
            <h2>Home</h2>
            <p>Welcome to the default home page!</p>
        `;
        billPanel.style.display = 'block'; // Show bill panel only for Home
    } 
    // Fetch and display food items dynamically
    else {
        const foodItems = await ipcRenderer.invoke("get-food-items", contentType);

        if (foodItems.length > 0) {
            mainContent.innerHTML = `
                <h2>${contentType}</h2>
                <div class="food-items">
                    ${foodItems
                        .map(
                            (item) => `
                            <div class="food-item">
                                <h3>${item.fname} ${item.veg ? "🌱" : "🍖"}</h3>
                                <p>Price: ₹${item.cost}</p>
                            </div>`
                        )
                        .join("")}
                </div>
            `;
            billPanel.style.display = 'block'; // Show bill panel only if food items are present
            
        } 
        // Menu Management
        else if (menuManagement.includes(contentType)) {

            let actionText = {
                "AddItem": "Add an item here",
                "UpdateItem": "Edit an existing item",
                "DeleteItem": "Remove an item from the menu"
            };

            mainContent.innerHTML = `
                <h2>${contentType.replace(/([A-Z])/g, " $1")}</h2>
                <p>${actionText[contentType]}</p>
            `;
            
        } 
        // Analytics
        else if (analytics.includes(contentType)) {
            let analyticsText = {
                "SalesOverview": "Daily, weekly, and monthly sales overview",
                "TopSelling": "Best selling items",
                "Trends": "Latest trends in sales",
            };

            mainContent.innerHTML = `
                <h2>${contentType.replace(/([A-Z])/g, " $1")}</h2>
                <p>${analyticsText[contentType]}</p>
            `;
            
        } 
        // Settings
        else if (settings.includes(contentType)) {
            let settingsText = {
                "UserProfile": "Manage your profile, Add/Update/Delete users",
                "ThemeToggle": "Switch between light and dark themes",
                "TaxAndDiscount": "Set default values for tax rates and discounts",
                "PrinterConfig": "Configure your printer",
                "Security": "Manage security settings, Manage roles and permissions",
                "Help": "Get help and support",
                "Exit": "Exit"
            };
            if (contentType === "Exit") {
                ipcRenderer.send("exit-app");
            }
            mainContent.innerHTML = `
                <h2>${contentType.replace(/([A-Z])/g, " $1")}</h2>
                <p>${settingsText[contentType]}</p>
            `;
            
        } 
        // Add First Category
        else if (contentType === "AddFirstCategory") {
            mainContent.innerHTML = `
                <div style="display: flex; justify-content: center; align-items: center; height: 20vh;">
                    <button id="addCategoryBtn" style="background-color: green; color: white; padding: 20px 40px; font-size: 20px; border: none; cursor: pointer; width: 300px; height: 80px;">
                        Add Category
                    </button>
                </div>
            `;
            
        } 
        // HISTORY TAB
        else if (contentType === 'History') {
            
            mainContent.innerHTML = `
                <style>
                    .date-filters {
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        justify-content: center;
                        gap: 10px;
                        text-align: center;
                        margin: 20px auto;
                    }
                </style>

                <div class="date-filters">
                    <label for="startDate">Start Date:</label>
                    <input type="date" id="startDate">
                    
                    <label for="endDate">End Date:</label>
                    <input type="date" id="endDate">
                    
                    <button onclick="fetchOrderHistory()">Show History</button>
                </div>
                <div id="orderHistory"></div>
            `;
            
        } 
        //MENU TAB
        else if (contentType === "Menu") {
            displayMenu(); // Call the function from menu.js to display menu
        }
        // Default Case
        else {
            mainContent.innerHTML = `
                <h2>${contentType}</h2>
                <p>No items found in this category.</p>
            `;
            
        }
    }

    // Update left panel dynamically
    updateLeftPanel(contentType);
}

// Function to dynamically update the left panel (category or settings buttons)
async function updateLeftPanel(contentType) {
    const categoryPanel = document.getElementById("category-panel");

    switch (contentType) {
        case "Home":
            // Render Home-related buttons
            const categories = await ipcRenderer.invoke("get-categories");

            if (categories.length > 0) {
                categoryPanel.innerHTML = categories
                    .map(
                        (category) =>
                            `<button class="category" id="${category.catname}" onclick="updateMainContent('${category.catname}')">${category.catname}</button>`
                    )
                    .join("");
            } else {
                categoryPanel.innerHTML = "<p>No categories found.</p>";
            }
            break;

        case "Menu":
            // Render Menu-related buttons
            categoryPanel.innerHTML = `
                <button class="category" id="AddItem" onclick="updateMainContent('AddItem')">Add Item</button>
                <button class="category" id="UpdateItem" onclick="updateMainContent('UpdateItem')">Update Item</button>
            `;
            break;

        case "Analytics":
            // Render Analytics-related buttons
            categoryPanel.innerHTML = `
                <button class="category" id="SalesOverview" onclick="updateMainContent('SalesOverview')">Sales Overview</button>
                <button class="category" id="TopSelling" onclick="updateMainContent('TopSelling')">Top Selling</button>
                <button class="category" id="Trends" onclick="updateMainContent('Trends')">Trends</button>
            `;
            break;

        case "History":
            // Render History-related buttons
            categoryPanel.innerHTML = `
                
            `;
            break;

        case "Categories":
            // Render category-related content when no categories exist
            categoryPanel.innerHTML = `
                <p style="text-align: center;" id="AddFirstCategory">No categories added</p>
            `;
            updateMainContent('AddFirstCategory');
            break;

        case "Settings":
            // Render Settings-related buttons
            categoryPanel.innerHTML = `
                <button class="category" id="UserProfile" onclick="updateMainContent('UserProfile')">User Profile</button>
                <button class="category" id="ThemeToggle" onclick="updateMainContent('ThemeToggle')">Light/Dark Mode</button>
                <button class="category" id="TaxAndDiscount" onclick="updateMainContent('TaxAndDiscount')">Tax and Discounts</button>
                <button class="category" id="PrinterConfig" onclick="updateMainContent('PrinterConfig')">Printer Configuration</button>
                <button class="category" id="Security" onclick="updateMainContent('Security')">Security</button>
                <button class="category" id="Help" onclick="updateMainContent('Help')">Help</button>
                <button class="category" id="Exit" onclick="updateMainContent('Exit')">Exit</button>
            `;
            break;
    }
}