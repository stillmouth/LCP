// Function to display menu items
async function displayMenu() {
    const mainContent = document.getElementById("main-content");
    const billPanel = document.getElementById("bill-panel");

    // Show loading message
    mainContent.innerHTML = `
        <div class="loading-message" id="loading-message">
            <p>Loading menu...</p>
        </div>
    `;
    billPanel.style.display = 'none'; // Hide bill panel for Menu
    
    // Fetch food items from the database when 'Menu' is clicked
    ipcRenderer.invoke("get-menu-items").then(foodItems => {
        if (foodItems.length > 0) {
            // Hide the loading message once food items are fetched
            const loadingMessage = document.getElementById('loading-message');
            if (loadingMessage) {
                loadingMessage.style.display = 'none';
            }

            // Render food items in the main content
            let menuContent = `
                <h2>Menu</h2>
                <div class="food-items" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;">
            `;

            foodItems.forEach(item => {
                menuContent += `
                    <div class="food-item" style="border: 1px solid #ccc; padding: 10px; text-align: center;">
                        <h3>${item.fname}<br style="line-height:5px;display:block"> ${item.veg ? "🌱" : "🍖"}</h3>
                        <p>Category: ${item.category_name}</p> <!-- Display the Category Name -->
                        <p>Food ID: ${item.fid}</p> <!-- Display the FoodID -->
                        <p>Price: ₹${item.cost}</p>
                    </div>
                `;
            });

            menuContent += `
                </div>
            `;

            mainContent.innerHTML = menuContent; // Update the content with the fetched menu items
            billPanel.style.display = "none"; // Hide bill panel for Menu
        } else {
            mainContent.innerHTML = `<p>No items available in this category.</p>`;
            billPanel.style.display = 'none';
        }
    }).catch(error => {
        // Handle error in fetching data
        mainContent.innerHTML = `<p>Error loading menu items: ${error.message}</p>`;
        billPanel.style.display = 'none';
    });
}
