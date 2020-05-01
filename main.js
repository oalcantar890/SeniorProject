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

function createExistingProjectWindow(windowTitle)
{
    existingProjectWindow = new BrowserWindow({title: windowTitle, webPreferences: { nodeIntegration: true } });

    const mainMenu = Menu.buildFromTemplate(existingProjectMenuTemplate);
    Menu.setApplicationMenu(mainMenu);

    existingProjectWindow.loadURL(url.format({
        pathname: path.join(__dirname, "existingProject.html"),
        protocol: "file:",
        slashes: true
    }));

    existingProjectWindow.on("close", function () {
        mainWindow.show();
        existingProjectWindow = null;
    });
}
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
        viewLogWindow = null;
        const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
        Menu.setApplicationMenu(mainMenu);
        mainWindow.show();
	});
}
//handle create task window
function createTaskWindow()
{
	console.log("You have arrived");
	newTaskWindow = new BrowserWindow({width: 600, height: 500, webPreferences: {nodeIntegration: true}, frame: false});

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
    console.log("Main received: " + item + " Now sending to existingProject");
    createExistingProjectWindow(item);	
	mainWindow.hide();
});

//catch created task
ipcMain.on("task:add", function(e, items)
{
    
    console.log("Task added");
    console.log("Item[0]: " + items[0]);
    console.log("Item[1]: " + items[1]);
    existingProjectWindow.webContents.send("task:add", items);
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
		const mainMenu = Menu.buildFromTemplate(existingProjectMenuTemplate);
		Menu.setApplicationMenu(mainMenu);
		newTaskWindow = null;
	});
});

const backMenu = [
    {
        label: "Exit",
        accelerator: process.platform == "darwin" ? "Command + M" : "Ctrl + M",
        click() {
            viewLogWindow.close();
            const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
            Menu.setApplicationMenu(mainMenu);
            mainWindow.show();
        }

    }
];
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
        label: "Organize",
        submenu: [
            {
                label: "Priority",
            },
            {
                label: "Duration",
            }
        ]

    },
	{
		label: "Settings",
		submenu:[
			{
				label: "Night Mode"
			}
		]
	},
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
                accelerator: process.platform == "darwin" ? "Command+L" : "Ctrl + L",
				click()
				{
                    createLogWindow();
                    mainWindow.hide();
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
				label: "Night Mode"
			}
		]
	},
	{
        label: "Organize",
        submenu: [
            {
                label: "Completion",
            },
            {
                label: "Date",
            }
        ]
		
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