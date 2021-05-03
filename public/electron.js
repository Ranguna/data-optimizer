const electron = require("electron");
const path = require("path");

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow;

function createWindow() {
	mainWindow = new BrowserWindow({ width: 900, height: 680 });
	mainWindow.loadURL(app.isPackaged ? `file://${path.join(__dirname, "../build/index.html")}` : "http://localhost:3000");
	mainWindow.on("closed", () => (mainWindow = null));
}
app.on("ready", createWindow);
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});
app.on("activate", () => {
	if (mainWindow === null) {
		createWindow();
	}
});
