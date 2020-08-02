const {app, BrowserWindow, Menu, MenuItem} = require("electron");

// node js core module path
const path = require("path");
// url module
const url = require("url");

// init window object
let win;

function create_window() {

    // remove menu bar
    //Menu.setApplicationMenu(null);

    // create browser window, frame false to remove frame
    win = new BrowserWindow({width: 400, height: 300, frame: false, 
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        } 
    });

    // load index.html
    win.loadURL(url.format({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file:",
        slashes: true
    }));

    const menu = new Menu();
    menu.append(new MenuItem({
        label: "Load Split"
    }))
    
    // attach context menu to app
    win.webContents.on("context-menu", (e, params) => {
        menu.popup(win, params.x, params.y)
    })

    // open dev tools on start
    win.webContents.openDevTools();

    win.on("closed", () => win = null);
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