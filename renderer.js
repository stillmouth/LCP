const { ipcRenderer } = require('electron');

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
    } else if (contentType === 'Icecreams') {
        mainContent.innerHTML = `
            <h2>Ice Creams</h2>
            <p>This is the content for Ice Creams. SHOW ALL THE ITEMS IN ICECREAMS</p>
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
}
updateMainContent('Home'); // Display the default Home page content when application is opened.