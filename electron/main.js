const {app, BrowserWindow, Menu, MenuItem, dialog, ipcMain} = require("electron");

// node js core module path
const path = require("path");
// url module
const url = require("url");
const { readFileSync, writeFileSync } = require("fs");

// init window object
let win;

var load_split_t = null; 

function create_window() {

    // remove menu bar
    //Menu.setApplicationMenu(null);

    // create browser window
    win = new BrowserWindow({width: 400, height: 300, 
        // frame: false, // disabling because of issues with dragging and context menu
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        } 
    });

    // disable menu bar
    win.setMenu(null);

    // load index.html
    win.loadURL(url.format({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file:",
        slashes: true
    }));

    // create custom context menu
    const menu = new Menu();
    menu.append(new MenuItem({
        label: "Load Split",
        click: () => {
            load_split_t = true;
        }
    }));
    
    // attach context menu to app
    win.webContents.on("context-menu", (e, params) => {
        menu.popup(win, params.x, params.y)
    });

    // open dev tools on start
    win.webContents.openDevTools();

    win.on("closed", () => win = null);
}

function load_split() {
    const file = dialog.showOpenDialogSync(win, {
        properties: ["openFile"]
    })

    if (!file) {
        return null;
    }
    else {
        // file[0] because of array
        return readFileSync(file[0]).toString();
    }
}

// run create window function
app.on("ready", () => create_window())

// quit when all windows are closed
app.on("window-all-closed", () => {
    // check for macos, !== for value and type
    if (process.platform !== "darwin") {
        app.quit();
    }
})

// send context menu item state
ipcMain.on("get-load-split", (event, arg) => {
    if (load_split_t) {
        const file_content = load_split();
        event.sender.send("get-load-split-response", file_content);
        load_split_t = null;
    }
    else {
        event.sender.send("get-load-split-response", load_split_t);
    }
});