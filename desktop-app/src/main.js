const { app, BrowserWindow, Menu, Tray, shell, dialog, ipcMain } = require('electron');
const path = require('path');
const ServerManager = require('./server');

// Keep global references
let mainWindow;
let serverManager;
let tray;
let isQuiting = false;

const isDev = process.argv.includes('--dev');
const serverPort = 8080;

class LoransMedicalEMS {
    constructor() {
        this.setupApp();
    }

    setupApp() {
        // App event handlers
        app.whenReady().then(() => {
            this.createWindow();
            this.startServer();
            this.createTray();
            this.createMenu();

            app.on('activate', () => {
                if (BrowserWindow.getAllWindows().length === 0) {
                    this.createWindow();
                }
            });
        });

        app.on('before-quit', () => {
            isQuiting = true;
            this.stopServer();
        });

        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                app.quit();
            }
        });
    }

    createWindow() {
        // Create the browser window
        mainWindow = new BrowserWindow({
            width: 1400,
            height: 1000,
            minWidth: 1200,
            minHeight: 800,
            icon: path.join(__dirname, '../assets/icon.png'),
            titleBarStyle: 'default',
            show: false,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                enableRemoteModule: false,
                preload: path.join(__dirname, 'preload.js')
            }
        });

        // Window styling
        mainWindow.setTitle('Lorans Medical EMS - Healthcare Employee Management System');

        // Load the app
        if (isDev) {
            mainWindow.loadURL('http://localhost:8080/');
            mainWindow.webContents.openDevTools();
        } else {
            // Wait for server to start
            setTimeout(() => {
                mainWindow.loadURL('http://localhost:8080/');
            }, 2000);
        }

        // Window events
        mainWindow.once('ready-to-show', () => {
            mainWindow.show();
            
            if (!isDev) {
                this.showStartupDialog();
            }
        });

        mainWindow.on('close', (event) => {
            if (!isQuiting) {
                event.preventDefault();
                mainWindow.hide();
                
                if (process.platform === 'win32') {
                    this.showTrayNotification('Lorans Medical EMS is still running in the system tray');
                }
            }
        });

        // External links
        mainWindow.webContents.setWindowOpenHandler(({ url }) => {
            shell.openExternal(url);
            return { action: 'deny' };
        });
    }

    async startServer() {
        try {
            serverManager = new ServerManager(serverPort);
            await serverManager.start();
            
            if (isDev) {
                console.log('Express server with SQLite started successfully');
            }
        } catch (error) {
            console.error('Failed to start server:', error);
            dialog.showErrorBox(
                'Server Error',
                'Failed to start the Lorans Medical EMS server. Please try again.'
            );
            app.quit();
        }
    }

    async stopServer() {
        if (serverManager) {
            await serverManager.stop();
            serverManager = null;
        }
    }

    createTray() {
        const trayIconPath = path.join(__dirname, '../assets/tray-icon.png');
        
        // Create tray icon (use a simple icon if custom doesn't exist)
        try {
            tray = new Tray(trayIconPath);
        } catch (error) {
            // Create a simple tray for now
            tray = new Tray(path.join(__dirname, '../assets/icon.png'));
        }

        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Show Lorans Medical EMS',
                click: () => {
                    mainWindow.show();
                    mainWindow.focus();
                }
            },
            {
                label: 'Dashboard',
                click: () => {
                    mainWindow.show();
                    mainWindow.loadURL('http://localhost:8080/dashboard');
                }
            },
            { type: 'separator' },
            {
                label: 'About',
                click: () => {
                    this.showAboutDialog();
                }
            },
            {
                label: 'Quit',
                click: () => {
                    isQuiting = true;
                    app.quit();
                }
            }
        ]);

        tray.setToolTip('Lorans Medical EMS - Healthcare Management System');
        tray.setContextMenu(contextMenu);

        tray.on('double-click', () => {
            mainWindow.show();
            mainWindow.focus();
        });
    }

    createMenu() {
        const template = [
            {
                label: 'File',
                submenu: [
                    {
                        label: 'Dashboard',
                        accelerator: 'CmdOrCtrl+D',
                        click: () => {
                            mainWindow.loadURL('http://localhost:8080/dashboard');
                        }
                    },
                    { type: 'separator' },
                    {
                        label: 'Exit',
                        accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                        click: () => {
                            isQuiting = true;
                            app.quit();
                        }
                    }
                ]
            },
            {
                label: 'View',
                submenu: [
                    { role: 'reload' },
                    { role: 'forceReload' },
                    { role: 'toggleDevTools' },
                    { type: 'separator' },
                    { role: 'resetZoom' },
                    { role: 'zoomIn' },
                    { role: 'zoomOut' },
                    { type: 'separator' },
                    { role: 'togglefullscreen' }
                ]
            },
            {
                label: 'Window',
                submenu: [
                    { role: 'minimize' },
                    { role: 'close' }
                ]
            },
            {
                label: 'Help',
                submenu: [
                    {
                        label: 'About Lorans Medical EMS',
                        click: () => {
                            this.showAboutDialog();
                        }
                    },
                    {
                        label: 'Visit GitHub',
                        click: () => {
                            shell.openExternal('https://github.com/bgside/lorans-medical-ems');
                        }
                    },
                    {
                        label: 'Live Demo',
                        click: () => {
                            shell.openExternal('https://bgside.github.io/lorans-medical-ems');
                        }
                    }
                ]
            }
        ];

        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);
    }

    showAboutDialog() {
        dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'About Lorans Medical EMS',
            message: 'Lorans Medical EMS v1.0.0',
            detail: 'Enterprise Healthcare Employee Management System\\n\\n' +
                   'Multi-location management for Syria Call Center and Turkey Clinic\\n' +
                   'Built with Node.js, SQLite, HTML, CSS, and Electron\\n\\n' +
                   'Developer: Ali Emad SALEH\\n' +
                   'GitHub: github.com/bgside/lorans-medical-ems',
            buttons: ['OK']
        });
    }

    showStartupDialog() {
        dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'Welcome to Lorans Medical EMS',
            message: 'Healthcare Employee Management System',
            detail: 'Welcome to the Lorans Medical Employee Management System!\\n\\n' +
                   'This desktop application manages 75+ employees across:\\n' +
                   '• Syria Call Center (70+ sales employees)\\n' +
                   '• Turkey Clinic (5+ medical staff)\\n\\n' +
                   'Default login: admin / password\\n\\n' +
                   'Data is stored locally using SQLite database.',
            buttons: ['Get Started']
        });
    }

    showTrayNotification(message) {
        if (tray && process.platform === 'win32') {
            // Windows balloon notification
            try {
                tray.displayBalloon({
                    title: 'Lorans Medical EMS',
                    content: message
                });
            } catch (error) {
                console.log('Notification:', message);
            }
        }
    }
}

// Initialize the application
new LoransMedicalEMS();

// Export for testing
module.exports = { LoransMedicalEMS };