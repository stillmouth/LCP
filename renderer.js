const { ipcRenderer } = require('electron');



// Function for hiding buttons for staff.
async function hideButtons() {
    const userRole = await ipcRenderer.invoke('get-user-role');
    if (userRole === 'staff') {
        document.getElementById('Analytics').style.display = 'none';
        document.getElementById('History').style.display = 'none';
    }
}
hideButtons();
// Function to display the item values in the database
function createTableContent(rows, category) {
    return `
        <h2>${category}</h2>
        <table style="width: 100%; border-collapse: collapse; text-align: left; border: 1px solid #ccc;">
            <thead>
                <tr>
                    <th style="padding: 8px; border: 1px solid #ccc;">Item ID</th>
                    <th style="padding: 8px; border: 1px solid #ccc;">Item Name</th>
                    <th style="padding: 8px; border: 1px solid #ccc;">Price</th>
                    <th style="padding: 8px; border: 1px solid #ccc;">Quantity</th>
                    <th style="padding: 8px; border: 1px solid #ccc;">Add</th>
                </tr>
            </thead>
            <tbody>
                ${rows.map(row => `
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ccc;">${row.ITEMID}</td>
                        <td style="padding: 8px; border: 1px solid #ccc;">${row.ITEMNAME}</td>
                        <td style="padding: 8px; border: 1px solid #ccc;">${row.PRICE.toFixed(2)}</td>
                        <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">
                            <button class="quantity-btn" onclick="changeQuantity('${row.ITEMID}', -1)" 
                                style="padding: 4px 8px; margin: 0 4px;">-</button>
                            <input type="number" id="quantity-${row.ITEMID}" value="0" min="0" readonly 
                                style="width: 50px; text-align: center; padding: 4px; border: 1px solid #ccc;" />
                            <button class="quantity-btn" onclick="changeQuantity('${row.ITEMID}', 1)" 
                                style="padding: 4px 8px; margin: 0 4px;">+</button>
                        </td>
                        <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">
                            <button onclick="addToBill('${row.ITEMID}', '${row.ITEMNAME}', ${row.PRICE})" 
                                style="padding: 6px 12px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
                                Add to Bill
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Function to handle category button clicks
function updateMainContent(contentType) {
    const mainContent = document.getElementById("main-content");
    const billPanel = document.getElementById("bill-panel");

    // Show or hide the bill panel based on the category selected
    if (contentType === 'Burgers') {
        // Fetch burger items from the database
        ipcRenderer.invoke('fetch-burgers').then((rows) => {
            mainContent.innerHTML = createTableContent(rows, 'Burgers');
            billPanel.style.display = 'block'; // Show bill panel
        }).catch((err) => {
            console.error("Error fetching burgers data:", err.message);
        });
    } else if (contentType === 'Milkshakes') {
        // Fetch milkshakes items from the database
        ipcRenderer.invoke('fetch-milkshakes').then((rows) => {
            mainContent.innerHTML = createTableContent(rows, 'Milkshakes');
            billPanel.style.display = 'block'; // Show bill panel
        }).catch((err) => {
            console.error("Error fetching milkshakes data:", err.message);
        });
    } else if (contentType === 'Momos') {
        mainContent.innerHTML = `
            <h2>MOMOS</h2>
            <p>MOMOS</p>
        `;
    } else if (contentType === 'Wraps') {
        mainContent.innerHTML = `
            <h2>WRAPS</h2>
            <p>WRAPS</p>
        `;
    } else if (contentType === 'Pops') {
        mainContent.innerHTML = `
            <h2>POPS</h2>
            <p>POPS</p>
        `;
    } else if (contentType === 'Fries') {
        mainContent.innerHTML = `
            <h2>FRIES</h2>
            <p>FRIES</p>
        `;
    } else if (contentType === 'Cold Coffee') {
        mainContent.innerHTML = `
            <h2>COLD COFFEE</h2>
            <p>COLD COFFEE</p>
        `;
    } else if (contentType === 'Lassi') {
        mainContent.innerHTML = `
            <h2>LASSI</h2>
            <p>LASSI</p>
        `;
        billPanel.style.display = 'block'; // Show bill panel
    } else if (contentType === 'Home') {
        mainContent.innerHTML = `
            <h2>Home</h2>
            <p>Welcome to the default home page!</p>
        `;
        billPanel.style.display = 'none'; // Hide bill panel on Home page
    } else {
        // For Menu, Analytics, History (hide bill panel)
        mainContent.innerHTML = `
            <h2>${contentType}</h2>
            <p>Content for ${contentType}</p>
        `;
        billPanel.style.display = 'none'; // Hide bill panel for other pages
    } 
    if (contentType === 'Settings') {
        mainContent.innerHTML = `
            <h2>SETTINGS</h2>
            <p>USER PROFILE, THEME etc...</p>
        `;
    }else if (contentType === 'AddItem') {
        mainContent.innerHTML = `
            <h2>This is where item can be added to the menu</h2>
            <p>Add an item here</p>
        `;
    } else if (contentType === 'UpdateItem') {
        mainContent.innerHTML = `
            <h2>Edit an item in the menu</h2>
            <p>EDIT AN ITEM</p>
        `;
    } else if (contentType === 'DeleteItem') {
        mainContent.innerHTML = `
            <h2>Delete an item from the menu</h2>
            <p>DELETE AN ITEM</p>
        `;
    } else if (contentType === 'SalesOverview') {
        mainContent.innerHTML = `
            <h2>Daily, weekly, monthly sales revealed here</h2>
            <p>over view sales</p>
        `;
    } else if (contentType === 'TopSelling') {
        mainContent.innerHTML = `
            <h2>TOP SELLING</h2>
            <p>DELETE AN ITEM</p>
        `;
    } else if (contentType === 'Trends') {
        mainContent.innerHTML = `
            <h2>TRENDS</h2>
            <p>DELETE AN ITEM</p>
        `;
    } else if (contentType === 'OrderHistory') {
        mainContent.innerHTML = `
            <h2>ORDER HISTORY</h2>
            <p>DELETE AN ITEM</p>
        `;
    } else if (contentType === 'UserProfile') {
        mainContent.innerHTML = `
            <h2>USER PROFILE</h2>
            <p>DELETE AN ITEM</p>
        `;
    } else if (contentType === 'ThemeToggle') {
        mainContent.innerHTML = `
            <h2>THEME TOGGLE</h2>
            <p>DELETE AN ITEM</p>
        `;
    }
    updateLeftPanel(contentType);
}

// Change the quantity for a specific item
function changeQuantity(itemId, change) {
    const quantityInput = document.getElementById(`quantity-${itemId}`);
    let currentQuantity = parseInt(quantityInput.value);
    currentQuantity = Math.max(0, currentQuantity + change);  // Prevent going below 0
    quantityInput.value = currentQuantity;
}

// Add an item to the bill
function addToBill(itemId, itemName, price) {
    const quantity = parseInt(document.getElementById(`quantity-${itemId}`).value);
    if (quantity > 0) {
        const totalPrice = price * quantity;
        const billPanel = document.getElementById("bill-panel");

        let existingItem = document.getElementById(`bill-item-${itemId}`);
        if (existingItem) {
            const quantityCell = existingItem.querySelector(".bill-quantity");
            const totalPriceCell = existingItem.querySelector(".bill-total");
            let newQuantity = parseInt(quantityCell.textContent) + quantity;
            quantityCell.textContent = newQuantity;
            totalPriceCell.textContent = (price * newQuantity).toFixed(2);
        } else {
            const billItemRow = document.createElement("div");
            billItemRow.classList.add("bill-item");
            billItemRow.id = `bill-item-${itemId}`;
            billItemRow.innerHTML = `
                <span class="bill-item-name">${itemName}</span>
                <span class="bill-quantity">${quantity}</span>
                x
                <span class="bill-price">${price.toFixed(2)}</span>
                = 
                <span class="bill-total">${totalPrice.toFixed(2)}</span>
                <button onclick="removeFromBill('${itemId}')">Remove</button>
            `;
            billPanel.appendChild(billItemRow);
        }

        updateBillTotal();
    } else {
        alert('Please select a quantity greater than 0 to add to the bill.');
    }
}

// Function to remove an item from the bill
function removeFromBill(itemId) {
    const billItem = document.getElementById(`bill-item-${itemId}`);
    if (billItem) {
        billItem.remove();
        updateBillTotal();
    }
}

// Function to update the total amount of the bill
function updateBillTotal() {
    const billPanel = document.getElementById("bill-panel");
    let totalAmount = 0;

    const billItems = billPanel.getElementsByClassName("bill-item");
    for (let item of billItems) {
        const totalPrice = parseFloat(item.querySelector(".bill-total").textContent);
        totalAmount += totalPrice;
    }

    const totalElement = document.getElementById("total-amount");
    if (billItems.length === 0) {
        totalElement.textContent = 'Total: $0.00 (Your bill is empty)';
    } else {
        totalElement.textContent = `Total: $${totalAmount.toFixed(2)}`;
    }
}lElement.textContent = `Total: $${totalAmount.toFixed(2)}`;


// Function to dynamically update the left panel (category or settings buttons)
function updateLeftPanel(contentType) {
    const categoryPanel = document.getElementById("category-panel");
  
    if (contentType === "Home") {
      // Render Home-related buttons
      categoryPanel.innerHTML = `
        <button class="category" id="Burgers" onclick="updateMainContent('Burgers')">Burger</button>
        <button class="category" id="Milkshakes" onclick="updateMainContent('Milkshakes')">Milkshakes</button>
        <button class="category" id="Momos" onclick="updateMainContent('Momos')">Momos</button>
        <button class="category" id="Wraps" onclick="updateMainContent('Wraps')">Wraps</button>
        <button class="category" id="Pops" onclick="updateMainContent('Pops')">Pops</button>
        <button class="category" id="Fries" onclick="updateMainContent('Fries')">Fries</button>
        <button class="category" id="Cold Coffee" onclick="updateMainContent('Cold Coffee')">Cold Coffee</button>
        <button class="category" id="Lassi" onclick="updateMainContent('Lassi')">Lassi</button>
      `;
    } else if (contentType === "Menu") {
      // Render Menu-related buttons
      categoryPanel.innerHTML = `
        <button class="category" id="AddItem" onclick="updateMainContent('AddItem')">Add Item</button>
        <button class="category" id="UpdateItem" onclick="updateMainContent('UpdateItem')">Update Item</button>
        <button class="category" id="DeleteItem" onclick="updateMainContent('DeleteItem')">Delete Item</button>
      `;
    } else if (contentType === "Analytics") {
      // Render Analytics-related buttons
      categoryPanel.innerHTML = `
        <button class="category" id="SalesOverview" onclick="updateMainContent('SalesOverview')">Sales Overview</button>
        <button class="category" id="TopSelling" onclick="updateMainContent('TopSelling')">Top Selling</button>
        <button class="category" id="Trends" onclick="updateMainContent('Trends')">Trends</button>
      `;
    } else if (contentType === "History") {
      // Render History-related buttons
      categoryPanel.innerHTML = `
        <button class="category" id="OrderHistory" onclick="updateMainContent('OrderHistory')">Order History</button>
      `;
    } else if (contentType === "Settings") {
      // Render Settings-related buttons
      categoryPanel.innerHTML = `
        <button class="category" id="UserProfile" onclick="updateMainContent('UserProfile')">User Profile</button>
        <button class="category" id="ThemeToggle" onclick="updateMainContent('ThemeToggle')">Light/Dark Mode</button>
      `;
    } 
  }
