const { app, BrowserWindow, Menu, ipcMain, dialog } = require("electron");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

let mainWindow;
let userRole = null;

// Handle login logic and return user role
ipcMain.handle('login', (event, password) => {
    if (password === '1212') {
        userRole = 'admin'; // Set role for admin
    } else if (password === '1000') {
        userRole = 'staff'; // Set role for staff
    } else {
        userRole = null; // Invalid password
    }
    return userRole; // Return the role (or null if invalid)
});

// Connect to the SQLite database
const db = new sqlite3.Database('LC.db', (err) => {
    if (err) {
        console.error("Failed to connect to the database:", err.message);
    } else {
        console.log("Connected to the SQLite database.");
    }
});

//Close database connection
// Function to close the database connection gracefully
function closeDatabase() {
    if (db) {
        db.close((err) => {
            if (err) {
                console.error("Error closing database", err);
            } else {
                console.log("Database connection closed");
            }
        });
    }
}


app.on("ready", () => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        show: false, // Initially hidden until ready-to-show
        fullscreen: false,
        webPreferences: {
            nodeIntegration: true, // Allow Node.js in the renderer process
            contextIsolation: false, // Optional: enable or disable context isolation
        },
    });

    // Maximize the window after creation
    mainWindow.maximize();

    // Show window once it's ready
    mainWindow.once("ready-to-show", () => {
        mainWindow.show();
    });

    Menu.setApplicationMenu(null);

    // Skip the login process and directly load index.html for testing
    mainWindow.loadFile('index.html').catch(err => {
        console.error("Failed to load index.html:", err);
    });

    // Send the user role after loading index.html
    mainWindow.webContents.once('did-finish-load', () => {
        mainWindow.webContents.send('set-user-role', userRole);
    });

    // Handle the user role request
    ipcMain.handle('get-user-role', async () => {
        return userRole;
    });

    // Handle database queries
});

app.on("activate", () => {
    if (mainWindow === null) {
        mainWindow = new BrowserWindow({
            width: 1200,
            height: 800,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                contextIsolation: true,
            }
        });

        // Skip login and load index.html directly
        mainWindow.loadFile('index.html').catch(err => {
            console.error("Failed to load index.html:", err);
        });
    }
});

let addCategoryWindow;

// Handle opening the Add Category window
ipcMain.on("open-add-category-window", () => {
    addCategoryWindow = new BrowserWindow({
        width: 400,
        height: 250,
        resizable: false,
        title: "Add Category",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    addCategoryWindow.loadFile("addCategory.html");

    addCategoryWindow.on("closed", () => {
        addCategoryWindow = null;
    });
});

// Handle category addition
ipcMain.on("add-category", (event, categoryName) => {
    if (!categoryName.trim()) {
        event.reply("category-add-failed", "Category name cannot be empty.");
        return;
    }

    const query = "INSERT INTO Category (catname, active) VALUES (?, 1)";
    db.run(query, [categoryName], function (err) {
        if (err) {
            console.error("Error adding category:", err.message);
            event.reply("category-add-failed", "Error adding category.");
        } else {
            event.reply("category-added-success");
            if (addCategoryWindow) addCategoryWindow.close();
        }
    });
});

// Listen for order history requests
ipcMain.on("get-order-history", (event, { startDate, endDate }) => {
    console.log("Fetching order history...");
    
    const query = `
        SELECT 
            Orders.*, 
            User.uname AS cashier_name, 
            GROUP_CONCAT(FoodItem.fname || ' (x' || OrderDetails.quantity || ')', ', ') AS food_items
        FROM Orders
        JOIN User ON Orders.cashier = User.userid
        JOIN OrderDetails ON Orders.billno = OrderDetails.orderid
        JOIN FoodItem ON OrderDetails.foodid = FoodItem.fid
        WHERE date(Orders.date) BETWEEN date(?) AND date(?)
        GROUP BY Orders.billno
        ORDER BY Orders.date DESC
    `;

    db.all(query, [startDate, endDate], (err, rows) => {
        if (err) {
            console.error("Error fetching order history:", err);
            event.reply("fetchOrderHistoryResponse", { success: false, orders: [] });
            return;
        }
        console.log("Order history fetched:", rows); 
        event.reply("order-history-response", { success: true, orders: rows });
    });
});



ipcMain.handle("get-categories", async () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT catname FROM Category WHERE active = 1", [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
});
//MENU TAB FOOD ITEMS:
// Fetch Food Items when requested from the renderer process
ipcMain.handle("get-menu-items", async (event) => {
    const query = `
        SELECT FoodItem.fid, FoodItem.fname, FoodItem.category, FoodItem.cost, FoodItem.sgst, FoodItem.cgst,FoodItem.veg, Category.catname AS category_name
        FROM FoodItem
        JOIN Category ON FoodItem.category = Category.catid
        WHERE FoodItem.active = 1 AND FoodItem.is_on = 1
    `;
    
    try {
        // Wrapping db.all() in a promise to use async/await correctly
        const rows = await new Promise((resolve, reject) => {
            db.all(query, (err, rows) => {
                if (err) {
                    reject(err); // Reject on error
                } else {
                    resolve(rows); // Resolve with rows if successful
                }
            });
        });
        
        return rows; // Return the fetched rows to the renderer process
    } catch (err) {
        console.error('Error fetching food items:', err);
        return []; // Return an empty array if an error occurs
    }
});
//DELETING MENU ITEM
// IPC Event to Delete a Menu Item
ipcMain.handle("delete-menu-item", async (event, fid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM FoodItem WHERE fid = ?", [fid], function (err) {
            if (err) {
                console.error("Error deleting item:", err);
                reject(err);
            } else {
                resolve(true);
            }
        });
    });
});

//-------------------

ipcMain.handle("get-food-items", async (event, categoryName) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT f.fid,f.fname, f.cost, f.veg 
            FROM FoodItem f 
            JOIN Category c ON f.category = c.catid 
            WHERE c.catname = ? AND f.active = 1 AND f.is_on = 1
        `;
        db.all(query, [categoryName], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
});
//EXIT THE APP
// Event listener to handle exit request
ipcMain.on("exit-app", (event) => {
    // Show a confirmation dialog
    const choice = dialog.showMessageBoxSync({
        type: "question",
        buttons: ["Cancel", "Exit"],
        defaultId: 1,
        title: "Confirm Exit",
        message: "Are you sure you want to exit?",
    });

    if (choice === 1) {
        // Close the database connection before quitting
        closeDatabase();
        app.quit(); // Close the app
    }
});