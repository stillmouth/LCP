// i add this comment line to test git
const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

let mainWindow;
//Reevan added this lmao
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
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, // Enable Node.js in the renderer process
        },
    });

    mainWindow.maximize();

    mainWindow.once("ready-to-show", () => {
        mainWindow.show();
    });

    Menu.setApplicationMenu(null);
    mainWindow.loadFile('index.html');

    mainWindow.on("closed", () => {
        mainWindow = null;
        db.close(); // Close the database connection when the app is closed
    });

    // Handle the Burgers button request from the renderer
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
                nodeIntegration: true,
            },
        });
        mainWindow.loadFile('index.html');
    }
});
