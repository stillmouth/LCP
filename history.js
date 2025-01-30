const { ipcRenderer } = require("electron");

function fetchOrderHistory() {
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;

    if (!startDate || !endDate) {
        alert("Please select both start and end dates.");
        return;
    }

    ipcRenderer.send("get-order-history", { startDate, endDate });
}

// Receive the order history from the main process and update the UI
ipcRenderer.on("order-history-response", (event, orders) => {
    const orderHistoryDiv = document.getElementById("orderHistory");
    if (orders.length === 0) {
        orderHistoryDiv.innerHTML = "<p>No orders found for the selected date range.</p>";
        return;
    }

    let tableHTML = `
        <table border="1">
            <tr>
                <th>Bill No</th>
                <th>KOT</th>
                <th>Price</th>
                <th>SGST</th>
                <th>CGST</th>
                <th>Tax</th>
                <th>Cashier ID</th>
                <th>Date</th>
            </tr>
    `;

    orders.forEach(order => {
        tableHTML += `
            <tr>
                <td>${order.billno}</td>
                <td>${order.kot}</td>
                <td>${order.price}</td>
                <td>${order.sgst}</td>
                <td>${order.cgst}</td>
                <td>${order.tax}</td>
                <td>${order.cashier_name}</td>
                <td>${order.date}</td>
            </tr>
        `;
    });

    tableHTML += `</table>`;
    orderHistoryDiv.innerHTML = tableHTML;
});

// Export function so it can be used in renderer.js
module.exports = { fetchOrderHistory };
