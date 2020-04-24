// JavaScript source code
const electron = require("electron");
const url = require("url");
const path = require("path");

//getting app and BrowserWindow object out of electron
const {app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow;
let newProjectWindow;
let existingProjectWindow;
let newTaskWindow;
let viewLogWindow;
 
//Listen for the app to be ready
app.on("ready", function()
{
	//Create new window
	mainWindow = new BrowserWindow({webPreferences: {nodeIntegration: true}});

	//load html into window
	mainWindow.loadURL(url.format({
	pathname: path.join(__dirname, "mainWindow.html"), 
	protocol: "file:", 
	slashes: true
	}));
	//Quit app when closed
	mainWindow.on("closed", function(){
		app.quit();
	});

	//Build the menu from the template
	//'Menu' comes form electron
	const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
	Menu.setApplicationMenu(mainMenu);
});

function createLogWindow()
{
	viewLogWindow = new BrowserWindow({webPreferences: {nodeIntegration: true}});

	const mainMenu = Menu.buildFromTemplate(backMenu);
	Menu.setApplicationMenu(mainMenu);

	viewLogWindow.loadURL(url.format({
	pathname: path.join(__dirname, "log.html"), 
	protocol: "file:", 
	slashes: true
	}));

	viewLogWindow.on("close", function(){
		//existingProjectWindow.show();
		viewLogWindow = null;
	});
}
//handle create task window
function createTaskWindow()
{
	console.log("You have arrived");
	newTaskWindow = new BrowserWindow({webPreferences: {nodeIntegration: true}, frame: false});
	
	//const mainMenu = Menu.buildFromTemplate(existingProjectMenuTemplate);
	//Menu.setApplicationMenu(mainMenu);

	newTaskWindow.loadURL(url.format({
	pathname: path.join(__dirname, "newTask.html"), 
	protocol: "file:", 
	slashes: true
	}));
	

	newTaskWindow.on("close", function(){
		//existingProjectWindow.show();
		newTaskWindow = null;
	});
	//existingProjectWindow.hide();

}
//Handle Create add window
function createProjectWindow()
{
	newProjectWindow = new BrowserWindow({width: 600, height: 400, title: "New Project", webPreferences: {nodeIntegration: true}, frame: false});
	
	const mainMenu = Menu.buildFromTemplate(existingProjectMenuTemplate);
	Menu.setApplicationMenu(mainMenu);

	//load html into window
	newProjectWindow.loadURL(url.format({
	pathname: path.join(__dirname, "newProject.html"), 
	protocol: "file:", 
	slashes: true
	}));

	//const mainMenu = Menu.buildFromTemplate(existingProjectMenuTemplate);
	//Menu.setApplicationMenu(mainMenu);

	//Garbage collection handle, sets window to null once it closes so it 
	//doesn't take up memory space
	newProjectWindow.on("close", function(){
		newProjectWindow = null;
	});
}
//Catch item:add
ipcMain.on("item:add", function(e, item)
{
	console.log(item);
	mainWindow.webContents.send("item:add", item);
	const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
	Menu.setApplicationMenu(mainMenu);
	newProjectWindow.close();

});

//Catch project
ipcMain.on("project", function(e, item)
{
	console.log("hello");
	existingProjectWindow = new BrowserWindow({ title: item, webPreferences: {nodeIntegration: true}});
	
	const mainMenu = Menu.buildFromTemplate(existingProjectMenuTemplate);
	Menu.setApplicationMenu(mainMenu);

	existingProjectWindow.loadURL(url.format({
	pathname: path.join(__dirname, "existingProject.html"), 
	protocol: "file:", 
	slashes: true
	}));
	
	existingProjectWindow.webContents.send("project", item);
	existingProjectWindow.on("close", function(){
		mainWindow.show();
		existingProjectWindow = null;
	});
	//Testing hiding main window after existing project window opens
	mainWindow.hide();
});

//catch created task
ipcMain.on("task:add", function(e, item)
{
	console.log("Task added");
	console.log(item);
	existingProjectWindow.webContents.send("task:add", item);
	newTaskWindow.close();
});

//catch new task
ipcMain.on("task", function(e, item)
{
	console.log("You have arrived");
	newTaskWindow = new BrowserWindow({webPreferences: {nodeIntegration: true}, frame: false});
	
	newTaskWindow.loadURL(url.format({
	pathname: path.join(__dirname, "newTask.html"), 
	protocol: "file:", 
	slashes: true
	}));

	newTaskWindow.on("close", function(){
		//existingProjectWindow.show();
		const mainMenu = Menu.buildFromTemplate(existingProjectMenuTemplate);
		Menu.setApplicationMenu(mainMenu);
		newTaskWindow = null;
	});
	//existingProjectWindow.hide();
});

const backMenu = [
	{
		label: "Exit",
		accelerator: process.platform == "darwin" ? "Command + B": "Ctrl + B",
		click()
		{
			viewLogWindow.close();
			const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
			Menu.setApplicationMenu(mainMenu);
			mainWindow.show();
		}
		
	}
]
const existingProjectMenuTemplate = [
	{
		label:"File",
		submenu:[
			{
				label: "Create Task",
				accelerator:process.platform == "darwin" ? "Command + T": "Ctrl + T",
				click()
				{
					createTaskWindow();
				}
			},
			{
				role: "reload"
			},
			{
				label: "Return to Main",
				accelerator: process.platform == "darwin" ? "Command + M": "Ctrl + M",
				click()
				{
					existingProjectWindow.close();
					const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
					Menu.setApplicationMenu(mainMenu);
					mainWindow.show();
				}
			},
			{
				label: "Quit",	//when you want to add functionality put a comma and then the function
				accelerator: process.platform == "darwin" ? "Command+Q": "Ctrl+Q",	//makes these keys also do the quit function
				click(){
					app.quit();
				}
			}
		]

	},
	{
		label: "Settings",
		submenu:[
			{
				label: ""
			}
		]
	},
	{
		label: "Manage"
		
	},
	{
		label: "Status"
	}
];
//Create menu template, an array
const mainMenuTemplate = [
	{
		label: "File",
		submenu:[
			{
				label: "New Project",
				accelerator: process.platform == "darwin" ? "Command + P": "Ctrl+P",
				click()
				{
					createProjectWindow();
				}
			},
			{
				label: "Clear Projects",
				click()
				{
					mainWindow.webContents.send("item:clear");
				}
			},
			{
				role: "reload"
			},
			{
				label: "Quit",	//when you want to add functionality put a comma and then the function
				accelerator: process.platform == "darwin" ? "Command+Q": "Ctrl+Q",	//makes these keys also do the quit function
				click(){
					app.quit();
				}
			}
		]
	},
	{
		label: "Log",
		submenu:[
			{
				label: "View Log",
				click()
				{
					createLogWindow();
				}
			},
			{
				label: "Edit Log",
				click()
				{
					editLogWindow();
				}
			}
		]
	},
	{
		label: "Settings",
		submenu:[
			{
				label: ""
			}
		]
	},
	{
		label: "Manage"
		
	},
	{
		label: "Status"
	}
];

//if on a Mac, add empty object to menu
if(process.platform === "darwin")
{
	mainMenuTemplate.unshift({}); //puts empty object in front of mainMenuTemplate
}

//add developer tools item if not in production
if(process.env.NODE_ENV !== "production")
{
	mainMenuTemplate.push({
		label: "Developer Tools",
		submenu:[
			{
				label: "Toggle DevTools",
				accelerator: process.platform == "darwin" ? "Command+I": "Ctrl+I",
				click(item, focusedWindow)
				{
					focusedWindow.toggleDevTools();
				}
			}
		]
	});
	existingProjectMenuTemplate.push({
		label: "Developer Tools",
		submenu:[
			{
				label: "Toggle DevTools",
				accelerator: process.platform == "darwin" ? "Command+I": "Ctrl+I",
				click(item, focusedWindow)
				{
					focusedWindow.toggleDevTools();
				}
			}
		]
	});

}