const { contextBridge, ipcRenderer } = require('electron');

/**
 * Sprig Preload Script
 * Exposes safe APIs to the renderer process via contextBridge.
 */
const api = {
  // ─── Account Management ───────────────────────────────────────────
  getAccounts: () => ipcRenderer.invoke('accounts:getAll'),
  addAccount: (name, service, avatar) => ipcRenderer.invoke('accounts:add', name, service, avatar),
  removeAccount: (id) => ipcRenderer.invoke('accounts:remove', id),
  renameAccount: (id, name) => ipcRenderer.invoke('accounts:rename', id, name),
  setAvatar: (id, avatar) => ipcRenderer.invoke('accounts:setAvatar', id, avatar),
  setAccountNotifications: (id, enabled) => ipcRenderer.invoke('accounts:setNotifications', id, enabled),
  updateUnread: (id, count) => ipcRenderer.invoke('accounts:updateUnread', id, count),

  // ─── Settings Management ──────────────────────────────────────────
  getSettings: () => ipcRenderer.invoke('settings:getAll'),
  setSetting: (key, value) => ipcRenderer.invoke('settings:set', key, value),
  clearCache: (partition) => ipcRenderer.invoke('session:clearCache', partition),
  clearAllCache: () => ipcRenderer.invoke('session:clearAllCache'),

  // ─── Session Management ───────────────────────────────────────────
  setupSession: (partition) => ipcRenderer.invoke('session:setup', partition),

  // ─── App Controls ─────────────────────────────────────────────────
  quit: () => ipcRenderer.invoke('app:quit'),
  getStartupUrl: () => ipcRenderer.invoke('app:getStartupUrl'),
  toggleDevTools: () => ipcRenderer.invoke('app:toggleDevTools'),
  openExternal: (url) => ipcRenderer.invoke('app:openExternal', url),

  // ─── Protocol Navigation ──────────────────────────────────────────
  onProtocolNavigate: (callback) => {
    ipcRenderer.on('protocol:navigate', (event, url) => {
      callback(url);
    });
  },
};

contextBridge.exposeInMainWorld('sprig', api);
contextBridge.exposeInMainWorld('walinux', api); // Alias for backward compatibility
