const {app, BrowserWindow, Menu, MenuItem, dialog, ipcMain} = require("electron");

// node js core module path
const path = require("path");
// url module
const url = require("url");
const {readFileSync} = require("fs");

// init window object
let win;
var loaded_split = null;
// background image
var image_path = null;
let json_filter = [{name: "json", extensions: ["json"]}];

function create_window() {

    // create browser window
    win = new BrowserWindow({
        minWidth: 400, 
        minHeight: 300, 
        width: 400,
        height: 300,
        // frame: false, // disabling because of issues with dragging and context menu
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        } 
    });
    
    // disable menu bar
    win.setMenu(null);
    
    // create custom context menu
    const menu = new Menu();
    menu.append(new MenuItem({
        label: "Load Split",
        click: () => {
            loaded_split = load_split();
        }
    }));
    
    menu.append(new MenuItem({
        label: "Set Background",
        click: () => {
            image_path = pick_image();
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
        pathname: path.join(__dirname, "index.html"),
        protocol: "file:",
        slashes: true
    }));

    win.on("closed", () => win = null);
}

function load_split() {
    const file = dialog.showOpenDialogSync(win, {
        filter: json_filter,
        properties: ["openFile"]
    });

    if (!file) {
        return null;
    }
    else {
        // file[0] because of array
        return readFileSync(file[0]).toString();
    }
}

function save_split(message) {
    return dialog.showMessageBoxSync(win, {
        type: "question",
        buttons: ["Yes", "No"],
        message: message
    })
}

// choose directory
function pick_directory(message) {
    const files = dialog.showOpenDialogSync(win, {
        filters: json_filter,
        properties: ["promptToCreate"]
    })
    if (!files) {
        return;
    }
    else {
        // array, return first file
        return files[0];
    }
} 

function pick_image(message) {
    const files = dialog.showOpenDialogSync(win, {
        filters: [{name: "Image", 
                extensions: ["png", "jpg", "jpeg"]
        }],
        properties: ["promptToCreate"]
    })
    if (!files) {
        return;
    }
    else {
        // array, return first file
        return files[0];
    }
}

// send context menu item state
ipcMain.on("get-load-split", (event, arg) => {
    if (loaded_split) {
        event.sender.send("get-load-split-response", loaded_split);
        loaded_split = null;
    }
});

// open dialog to save split
ipcMain.on("get-save-split", (event, arg) => {
    event.sender.send("get-save-split-response", save_split(
        "It seems that you have beat your previous time. Save?"));
});
    
ipcMain.on("get-directory", (event, arg) => {
    event.sender.send("get-directory-response", pick_directory());
});

ipcMain.on("get-image-path", (event, arg) => {
    if (image_path) {
        event.sender.send("get-image-path-response", image_path);
        image_path = null;
    }
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