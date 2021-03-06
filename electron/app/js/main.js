const {app, BrowserWindow, Menu, MenuItem, dialog, ipcMain} = require("electron");

// node js core module path
const path = require("path");
// url module
const url = require("url");
const {readFileSync} = require("fs");

let win;
let split_win;
let json_filter = [{name: "json", extensions: ["json"]}];
let default_window_settings = {
    minWidth: 400, 
    minHeight: 300, 
    width: 400,
    height: 300,
    fullscreenable: false,
    icon: path.join(__dirname, "../../images/icon.ico"),
    webPreferences: {
        preload: path.join(__dirname, "preload.js")
    } 
} 

function create_window() {

    // create browser window
    win = new BrowserWindow(default_window_settings);
    
    // disable menu bar
    win.setMenu(null);

    // create custom context menu
    const menu = new Menu();

    menu.append(new MenuItem({
        label: "Edit Split",
        click: create_split_win
    }))

    menu.append(new MenuItem({
        label: "Load Split",
        click: () => {
            win.webContents.send("set-loaded-splits", load_split());
        }
    }));
    
    menu.append(new MenuItem({
        label: "Set Background",
        click: () => {
            win.webContents.send("set-background", pick_image());
        }
    }));
    
    // attach context menu to app
    win.webContents.on("context-menu", (e, params) => {
        menu.popup(win, params.x, params.y)
    });
    
    // open dev tools on start
    win.webContents.openDevTools();
    
    // load index.html
    win.loadURL(url.format({
        pathname: path.join(__dirname, "../html/index.html"),
        protocol: "file:",
        slashes: true
    }));
    
    win.on("closed", () => win = null);
}

function create_split_win() {

    // create browser window
    split_win = new BrowserWindow(default_window_settings);
    
    // disable menu bar
    split_win.setMenu(null);

    // create custom context menu
    const menu = new Menu();
    menu.append(new MenuItem({
        label: "Load Split",
        click: () => {
            split_win.webContents.send("set-loaded-splits", load_split());
        }
    }));
    
    // attach context menu to app
    split_win.webContents.on("context-menu", (e, params) => {
        menu.popup(split_win, params.x, params.y)
    });
    
    // open dev tools on start
    split_win.webContents.openDevTools();
    
    // load index.html
    split_win.loadURL(url.format({
        pathname: path.join(__dirname, "../html/split.html"),
        protocol: "file:",
        slashes: true
    }));
}

function load_split() {
    const files = dialog.showOpenDialogSync(win, {
        filter: json_filter,
        properties: ["openFile"]
    });
    return files ? readFileSync(files[0]).toString() : null;
}

function save_split(message) {
    return dialog.showMessageBoxSync(win, {
        type: "question",
        buttons: ["Yes", "No"],
        message: message
    })
}

function pick_directory(message) {
    const files = dialog.showOpenDialogSync(win, {
        filters: json_filter,
        properties: ["promptToCreate"]
    })
    return files ? files[0] : null;
} 

function pick_image(message) {
    const files = dialog.showOpenDialogSync(win, {
        filters: [{name: "Image", 
                extensions: ["png", "jpg", "jpeg"]
        }],
        properties: ["promptToCreate"]
    })
    return files ? files[0] : null;
}

// open dialog to save split
ipcMain.on("get-save-split", (event, arg) => {
    event.sender.send("get-save-split-response", save_split(
        "It seems that you have beat your previous time. Save?"));
});
    
ipcMain.on("get-directory", (event, arg) => {
    event.sender.send("get-directory-response", pick_directory());
});

ipcMain.on("request-splits", (event, arg) => {
    win.webContents.send("request-splits", "");
});

ipcMain.on("request-splits-response", (event, arg) => {
    split_win.webContents.send("request-splits-response", arg);
});

ipcMain.on("edited-splits", (event, arg) => {
    win.webContents.send("edited-splits", arg)
});

// run create window function
app.on("ready", () => create_window())

// quit when all windows are closed
app.on("window-all-closed", () => {
    // check for macos, !== for value and type
    if (process.platform !== "darwin") {
        app.quit();
    }
});

