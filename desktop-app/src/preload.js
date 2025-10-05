const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // System info
    getVersion: () => process.versions.electron,
    getPlatform: () => process.platform,
    
    // Window controls
    minimize: () => ipcRenderer.invoke('window-minimize'),
    maximize: () => ipcRenderer.invoke('window-maximize'),
    close: () => ipcRenderer.invoke('window-close'),
    
    // App controls
    openExternal: (url) => ipcRenderer.invoke('open-external', url),
    showAbout: () => ipcRenderer.invoke('show-about'),
    
    // Notifications
    showNotification: (title, body) => ipcRenderer.invoke('show-notification', { title, body }),
    
    // Database connection status
    checkConnection: () => ipcRenderer.invoke('check-db-connection'),
    
    // File operations
    selectFile: () => ipcRenderer.invoke('select-file'),
    saveFile: (data) => ipcRenderer.invoke('save-file', data),
    
    // Settings
    getSetting: (key) => ipcRenderer.invoke('get-setting', key),
    setSetting: (key, value) => ipcRenderer.invoke('set-setting', key, value),
    
    // Events
    on: (channel, callback) => {
        const validChannels = ['database-status', 'server-status', 'notification'];
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, callback);
        }
    },
    
    removeAllListeners: (channel) => {
        ipcRenderer.removeAllListeners(channel);
    }
});

// Add desktop-specific styling and features when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    // Add desktop app class to body for specific styling
    document.body.classList.add('desktop-app');
    
    // Add version info to footer if exists
    const footer = document.querySelector('footer, .footer');
    if (footer) {
        const versionInfo = document.createElement('div');
        versionInfo.className = 'desktop-version-info';
        versionInfo.innerHTML = `<small>Desktop App v1.0.0 | Electron v${process.versions.electron}</small>`;
        footer.appendChild(versionInfo);
    }
    
    // Custom right-click menu
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        // Could implement custom context menu here
    });
    
    // Prevent drag and drop of files
    document.addEventListener('dragover', (e) => {
        e.preventDefault();
    });
    
    document.addEventListener('drop', (e) => {
        e.preventDefault();
    });
});

// Console branding
console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                        Lorans Medical EMS                           ║
║                 Healthcare Employee Management System                ║
║                                                                      ║
║  Desktop App v1.0.0 | Built with Electron + PHP                    ║
║  Developer: Ali Emad SALEH                                          ║
║  GitHub: github.com/bgside/lorans-medical-ems                       ║
╚══════════════════════════════════════════════════════════════════════╝
`);

// Environment info for debugging
if (process.env.NODE_ENV === 'development') {
    console.log('Development mode enabled');
    console.log('Electron version:', process.versions.electron);
    console.log('Chrome version:', process.versions.chrome);
    console.log('Node version:', process.versions.node);
}