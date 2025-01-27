const { ipcRenderer } = require('electron');


//FUNCTION to display the item values in the DATABASE
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

    if (contentType === 'Burgers') {
        // Fetch burger items from the database
        ipcRenderer.invoke('fetch-burgers').then((rows) => {
            mainContent.innerHTML = createTableContent(rows, 'Burgers');
        }).catch((err) => {
            console.error("Error fetching burgers data:", err.message);
        });
    } else if (contentType === 'Milkshakes') {
        // Fetch milkshakes items from the database
        ipcRenderer.invoke('fetch-milkshakes').then((rows) => {
            mainContent.innerHTML = createTableContent(rows, 'Milkshakes');
        }).catch((err) => {
            console.error("Error fetching milkshakes data:", err.message);
        });
    } else if (contentType === 'Icecreams') {
        mainContent.innerHTML = `
            <h2>Ice Creams</h2>
            <p>This is the content for Ice Creams. SHOW ALL THE ITEMS IN ICECREAMS</p>
        `;
    } else if (contentType === 'Home') {
        mainContent.innerHTML = `
            <h2>Home</h2>
            <p>SUPPOSED TO SHOW THE DEFAULT HOME PAGE HERE IDK HOW</p>
        `;
    } else if (contentType === 'Menu') {
        mainContent.innerHTML = `
            <h2>MENU</h2>
            <p>MENU SHOWING MENU ITEMS AND EDITING/UPDATING THEM</p>
        `;
    } else if (contentType === 'Analytics') {
        mainContent.innerHTML = `
            <h2>ANALYTICS</h2>
            <p>ANALYTICS OF THE PAST SALES.ETC AND EVERYTHING ELSE</p>
        `;
    } else if (contentType === 'History') {
        mainContent.innerHTML = `
            <h2>HISTORY</h2>
            <p>HISTORY OF ALL THE TRANSACTIONS WILL BE SHOWN HERE</p>
        `;
    }
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
    // Get the selected quantity for the item
    const quantity = parseInt(document.getElementById(`quantity-${itemId}`).value);

    // Only add the item if the quantity is greater than 0
    if (quantity > 0) {
        // Calculate the total price for the item (price * quantity)
        const totalPrice = price * quantity;

        // Find the bill panel and add the new item
        const billPanel = document.getElementById("bill-panel");

        // Check if the item already exists in the bill
        let existingItem = document.getElementById(`bill-item-${itemId}`);
        if (existingItem) {
            // If the item already exists, update the quantity and total price
            const quantityCell = existingItem.querySelector(".bill-quantity");
            const totalPriceCell = existingItem.querySelector(".bill-total");
            
            let newQuantity = parseInt(quantityCell.textContent) + quantity;
            quantityCell.textContent = newQuantity;
            totalPriceCell.textContent = (price * newQuantity).toFixed(2);
        } else {
            // If the item doesn't exist in the bill, create a new row
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

            // Append the new item to the bill panel
            billPanel.appendChild(billItemRow);
        }

        // Update the total price of the bill
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

    // Loop through all items in the bill panel and calculate the total amount
    const billItems = billPanel.getElementsByClassName("bill-item");
    for (let item of billItems) {
        const totalPrice = parseFloat(item.querySelector(".bill-total").textContent);
        totalAmount += totalPrice;
    }

    // Display message if no items are in the bill
    const totalElement = document.getElementById("total-amount");
    if (billItems.length === 0) {
        totalElement.textContent = 'Total: $0.00 (Your bill is empty)';
    } else {
        totalElement.textContent = `Total: $${totalAmount.toFixed(2)}`;
    }
}lElement.textContent = `Total: $${totalAmount.toFixed(2)}`;
