const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

let mainWindow;
let userRole = null;

// // Handle login logic and return user role
ipcMain.handle('login', (event, password) => {
    console.log("Received login request with password:", password); // ✅ Debugging log

    if (password === '') {
        userRole = 'admin'; 
    } else if (password === '1000') {
        userRole = 'staff'; 
    } else {
        userRole = null; 
    }

    console.log("Returning user role:", userRole); // ✅ Debugging log
    return userRole;
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
        event.sender.send("category-add-failed", "Category name cannot be empty.");
        return;
    }

    const query = "INSERT INTO Category (catname, active) VALUES (?, 1)";
    db.run(query, [categoryName], function (err) {
        if (err) {
            console.error("Error adding category:", err.message);
            event.sender.send("category-add-failed", "Error adding category.");
        } else {
            // Send success message to the main window, not the closing window
            event.sender.send("category-added-success");

            // Ensure this event also reaches the main window
            BrowserWindow.getAllWindows().forEach((win) => {
                if (win !== addCategoryWindow) {
                    win.webContents.send("category-added-success");
                }
            });

            // Close the add category window
            if (addCategoryWindow) addCategoryWindow.close();
        }
    });
});
