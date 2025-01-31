const { app, BrowserWindow, Menu, ipcMain } = require("electron");
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

app.on("ready", () => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        show: false, // Initially hidden until ready-to-show
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
    ipcMain.handle('fetch-burgers', async () => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM MENU WHERE CATEGORY = "BURGERS"', [], (err, rows) => {
                if (err) {
                    console.error("Error querying database:", err.message);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    });

    ipcMain.handle('fetch-milkshakes', async () => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM MENU WHERE CATEGORY = "MILKSHAKES"', [], (err, rows) => {
                if (err) {
                    console.error("Error querying database:", err.message);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    });
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
    console.log("Fetching order history...")
    const query = `
        SELECT * FROM Orders WHERE date BETWEEN ? AND ?
    `;

    //console.log("Start Date:", startDate);
    //console.log("End Date:", endDate);
    
    db.all(
        `SELECT Orders.*, User.uname AS cashier_name 
         FROM Orders 
         JOIN User ON Orders.cashier = User.userid  -- ✅ CORRECT COLUMN NAME
         WHERE date(Orders.date) BETWEEN date(?) AND date(?) 
         ORDER BY date DESC`,
        [startDate.trim(), endDate.trim()],
        (err, rows) => {
            if (err) {
                console.error("Error fetching order history:", err);
                event.reply("order-history-response", []);
            } //else {
               // console.log("Orders fetched:", rows);
                event.reply("order-history-response", rows);
           // }
        }
    );
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

ipcMain.handle("get-food-items", async (event, categoryName) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT f.fname, f.cost, f.veg 
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
