// Function to handle category button clicks
function updateMainContent(contentType) {
    const mainContent = document.getElementById("main-content");
    const billPanel = document.getElementById("bill-panel");

    // Show or hide the bill panel based on the category selected
    if (contentType === 'Burgers') {
        mainContent.innerHTML = `
            <h2>Burgers</h2>
            <p>Burgers</p>
        `;
        billPanel.style.display = 'block';
    } else if (contentType === 'Milkshakes') {
        mainContent.innerHTML = `
            <h2>Milkshakes</h2>
            <p>Milkshakes</p>
        `;
        billPanel.style.display = 'block';
    } else if (contentType === 'Momos') {
        mainContent.innerHTML = `
            <h2>MOMOS</h2>
            <p>MOMOS</p>
        `;
        billPanel.style.display = 'block';
    } else if (contentType === 'Wraps') {
        mainContent.innerHTML = `
            <h2>WRAPS</h2>
            <p>WRAPS</p>
        `;
        billPanel.style.display = 'block';
    } else if (contentType === 'Pops') {
        mainContent.innerHTML = `
            <h2>POPS</h2>
            <p>POPS</p>
        `;
        billPanel.style.display = 'block';
    } else if (contentType === 'Fries') {
        mainContent.innerHTML = `
            <h2>FRIES</h2>
            <p>FRIES</p>
        `;
        billPanel.style.display = 'block';
    } else if (contentType === 'Cold Coffee') {
        mainContent.innerHTML = `
            <h2>COLD COFFEE</h2>
            <p>COLD COFFEE</p>
        `;
        billPanel.style.display = 'block';
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
        billPanel.style.display = 'block'; // Hide bill panel on Home page
    } else if (contentType === 'History') {
        mainContent.innerHTML = `
            <h2>Order History</h2>
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
    else {
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
    } else if (contentType === 'AddItem') {
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
    } else if (contentType === 'User Profile') {
        mainContent.innerHTML = `
            <h2>USER PROFILE</h2>
            <p>DELETE AN ITEM</p>
        `;
    } else if (contentType === 'ThemeToggle') {
        mainContent.innerHTML = `
            <h2>THEME TOGGLE</h2>
            <p>DELETE AN ITEM</p>
        `;
    } else if (contentType === 'AddFirstCategory') {
        mainContent.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 20vh;">
            <button id="addCategoryBtn" style="background-color: green; color: white; padding: 20px 40px; font-size: 20px; border: none; cursor: pointer; width: 300px; height: 80px;">
                Add Category
            </button>
        </div>
    `;
    }
    updateLeftPanel(contentType);
}

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
        
      `;
    } else if (contentType === "Categories") {
        // Render Settings-related buttons
        categoryPanel.innerHTML = `
          <p style="text-align: center;" id="AddFirstCategory">No categories added</p>
        `;
        updateMainContent('AddFirstCategory');
        
    } else if (contentType === "Settings") {
      // Render Settings-related buttons
      categoryPanel.innerHTML = `
        <button class="category" id="User Profile" onclick="updateMainContent('User Profile')">User  Profile</button>
        <button class="category" id="ThemeToggle" onclick="updateMainContent('ThemeToggle')">Light/Dark Mode</button>
      `;
    } 
}