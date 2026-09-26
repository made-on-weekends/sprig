const { app, BrowserWindow, session, ipcMain, shell, nativeTheme } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { setupProtocolHandler, handleProtocolUrl } = require('./protocol');
const { createTray, updateTrayBadge } = require('./tray');
const { AccountManager, JsonStore } = require('./accounts');

// Disable Chromium SUID sandbox to prevent Linux app startup crashes
app.commandLine.appendSwitch('no-sandbox');

// Enable audio autoplay & disable isolated audio process to fix Linux PulseAudio/PipeWire audio playback
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.commandLine.appendSwitch('disable-features', 'AudioServiceOutOfProcess,AudioServiceSandbox');

// Modern User-Agents to prevent WhatsApp and Google Account blocking
const CHROME_USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';
const FIREFOX_USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133.0';

// Disable AutomationControlled flag which triggers Google "This browser or app may not be secure" block
app.commandLine.appendSwitch('disable-blink-features', 'AutomationControlled');

app.userAgentFallback = CHROME_USER_AGENT;
app.setName('sprig');
if (process.platform === 'linux') {
  app.setDesktopName('sprig.desktop');
}

let mainWindow = null;
let accountManager = null;
let settingsStore = null;
let isQuitting = false;

// ─── Single Instance Lock ────────────────────────────────────────────────────
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine) => {
    // Someone tried to run a second instance — focus our window
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }

    // Check for protocol URL in command line args
    const protocolUrl = commandLine.find(arg => arg.startsWith('whatsapp://') || arg.startsWith('sms:') || arg.startsWith('sms://'));
    if (protocolUrl) {
      handleProtocolUrl(protocolUrl, mainWindow);
    }
  });
}

// ─── User-Agent Spoofing ─────────────────────────────────────────────────────
function spoofUserAgent(sess) {
  if (!sess) return;
  try {
    sess.setUserAgent(CHROME_USER_AGENT);
  } catch (err) {
    console.error('Failed to setUserAgent on session:', err);
  }
  sess.webRequest.onBeforeSendHeaders((details, callback) => {
    let ua = CHROME_USER_AGENT;
    if (details.url.includes('accounts.google.com') || details.url.includes('accounts.youtube.com')) {
      ua = FIREFOX_USER_AGENT;
      delete details.requestHeaders['Sec-Ch-Ua'];
      delete details.requestHeaders['Sec-Ch-Ua-Mobile'];
      delete details.requestHeaders['Sec-Ch-Ua-Platform'];
      delete details.requestHeaders['Sec-Ch-Ua-Platform-Version'];
    }
    details.requestHeaders['User-Agent'] = ua;
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });
}

// ─── Permission Handling ─────────────────────────────────────────────────────
function setupPermissions(sess, partition = null) {
  const allowedPermissions = [
    'notifications',
    'media',           // Camera + Microphone for calls
    'audioCapture',     // Voice message recording & playback
    'speaker-selection',// Output device selection
    'mediaKeySystem',
    'clipboard-read',
    'clipboard-sanitized-write',
    'fullscreen',
    'pointerLock',
    'persistent-storage', // IndexedDB persistence
  ];

  sess.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'notifications') {
      const allowGlobal = settingsStore ? settingsStore.get('notifications', true) : true;
      if (!allowGlobal) return callback(false);
      if (partition && accountManager) {
        const acc = accountManager.getAll().find(a => a.partition === partition);
        if (acc && acc.notifications === false) {
          return callback(false);
        }
      }
      return callback(true);
    }

    if (allowedPermissions.includes(permission)) {
      callback(true);
    } else {
      console.log(`Denied permission request: ${permission}`);
      callback(false);
    }
  });

  sess.setPermissionCheckHandler((webContents, permission) => {
    if (permission === 'notifications') {
      const allowGlobal = settingsStore ? settingsStore.get('notifications', true) : true;
      if (!allowGlobal) return false;
      if (partition && accountManager) {
        const acc = accountManager.getAll().find(a => a.partition === partition);
        if (acc && acc.notifications === false) {
          return false;
        }
      }
      return true;
    }
    return allowedPermissions.includes(permission);
  });
}

// ─── Linux XDG Autostart Management ──────────────────────────────────────────
function setLinuxAutoStart(enable) {
  try {
    const autostartDir = path.join(os.homedir(), '.config', 'autostart');
    const desktopFilePath = path.join(autostartDir, 'sprig.desktop');

    if (enable) {
      if (!fs.existsSync(autostartDir)) {
        fs.mkdirSync(autostartDir, { recursive: true });
      }

      let execCommand;
      if (process.env.APPIMAGE) {
        execCommand = `"${process.env.APPIMAGE}" --no-sandbox --start-minimized`;
      } else if (app.isPackaged) {
        execCommand = `"${process.execPath}" --no-sandbox --start-minimized`;
      } else {
        execCommand = `"${process.execPath}" --no-sandbox "${app.getAppPath()}" --start-minimized`;
      }

      const desktopEntryContent = [
        '[Desktop Entry]',
        'Type=Application',
        'Version=1.0',
        'Name=Sprig',
        'GenericName=Messaging Client',
        'Comment=Native Multi-Account WhatsApp & Google Messages Client for Linux',
        `Exec=${execCommand}`,
        'Icon=sprig',
        'Terminal=false',
        'StartupNotify=false',
        'Categories=Network;InstantMessaging;',
        'X-GNOME-Autostart-enabled=true',
      ].join('\n') + '\n';

      fs.writeFileSync(desktopFilePath, desktopEntryContent, { encoding: 'utf8', mode: 0o755 });
    } else {
      if (fs.existsSync(desktopFilePath)) {
        fs.unlinkSync(desktopFilePath);
      }
    }
    return true;
  } catch (err) {
    console.error('Failed to update Linux autostart file:', err);
    return false;
  }
}

function configureAutoStart(enable) {
  try {
    app.setLoginItemSettings({
      openAtLogin: Boolean(enable),
      args: ['--no-sandbox', '--start-minimized'],
    });
  } catch (e) {
    console.error('Failed to set login item settings:', e);
  }

  if (process.platform === 'linux') {
    setLinuxAutoStart(Boolean(enable));
  }
}

// ─── Internal URL Validation ──────────────────────────────────────────────────
function isInternalMessagingUrl(url) {
  if (!url || typeof url !== 'string') return false;
  if (
    url === 'about:blank' ||
    url.startsWith('blob:') ||
    url.startsWith('data:') ||
    url.startsWith('devtools:') ||
    url.startsWith('chrome-extension:')
  ) {
    return true;
  }

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    // WhatsApp domains
    const isWhatsApp =
      host === 'web.whatsapp.com' ||
      host === 'whatsapp.com' ||
      host.endsWith('.whatsapp.com') ||
      host.endsWith('.whatsapp.net');

    // Google Messages & Google Account Authentication domains
    const isGoogleMessages =
      host === 'messages.google.com' ||
      host.endsWith('.messages.google.com') ||
      host === 'accounts.google.com' ||
      host === 'accounts.youtube.com' ||
      host === 'myaccount.google.com' ||
      host.endsWith('.gstatic.com') ||
      host.endsWith('.googleusercontent.com') ||
      host === 'apis.google.com' ||
      (host.endsWith('.google.com') &&
        (parsed.pathname.startsWith('/accounts') || parsed.pathname.startsWith('/signin')));

    return isWhatsApp || isGoogleMessages;
  } catch (err) {
    return false;
  }
}

// ─── Create Main Window ──────────────────────────────────────────────────────
function createMainWindow(startMinimized = false) {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 860,
    minHeight: 600,
    show: !startMinimized,
    title: 'Sprig',
    icon: path.join(__dirname, '..', 'assets', 'brand', 'hicolor', '512.png'),
    backgroundColor: '#0E1512',
    darkTheme: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, '..', 'renderer', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,
      spellcheck: true,
      sandbox: false,
    },
  });

  // Apply saved theme preference
  const savedTheme = settingsStore.get('theme', 'dark');
  nativeTheme.themeSource = savedTheme;

  // Load the renderer
  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

  // Spoof UA for the main window's session
  spoofUserAgent(mainWindow.webContents.session);

  // Set up permissions for the main session
  setupPermissions(mainWindow.webContents.session);

  // Handle external links — open in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://') || url.startsWith('mailto:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // Minimize to tray or close based on settings
  mainWindow.on('close', (event) => {
    const closeToTray = settingsStore.get('closeToTray', true);
    if (!isQuitting && closeToTray) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Open DevTools only if --devtools flag is explicitly passed
  if (process.argv.includes('--devtools')) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  return mainWindow;
}

// ─── IPC Handlers ────────────────────────────────────────────────────────────
function setupIPC() {
  // Toggle DevTools
  ipcMain.handle('app:toggleDevTools', () => {
    if (mainWindow) {
      if (mainWindow.webContents.isDevToolsOpened()) {
        mainWindow.webContents.closeDevTools();
      } else {
        mainWindow.webContents.openDevTools({ mode: 'detach' });
      }
    }
  });
  // Account management
  ipcMain.handle('accounts:getAll', () => {
    return accountManager.getAll();
  });

  ipcMain.handle('accounts:add', (event, name, service, avatar) => {
    return accountManager.add(name, service, avatar);
  });

  ipcMain.handle('accounts:remove', (event, id) => {
    return accountManager.remove(id);
  });

  ipcMain.handle('accounts:rename', (event, id, name) => {
    return accountManager.rename(id, name);
  });

  ipcMain.handle('accounts:setAvatar', (event, id, avatar) => {
    return accountManager.setAvatar(id, avatar);
  });

  ipcMain.handle('accounts:setNotifications', (event, id, enabled) => {
    return accountManager.setNotifications(id, enabled);
  });

  ipcMain.handle('accounts:updateUnread', (event, id, count) => {
    accountManager.updateUnread(id, count);
    const trayBadges = settingsStore.get('trayBadges', true);
    const total = trayBadges ? accountManager.getTotalUnread() : 0;
    updateTrayBadge(total);
    try {
      app.setBadgeCount(total);
    } catch (e) {}
  });

  // Settings management
  ipcMain.handle('settings:getAll', () => {
    return settingsStore.data;
  });

  ipcMain.handle('settings:set', (event, key, value) => {
    settingsStore.set(key, value);

    if (key === 'theme') {
      nativeTheme.themeSource = value;
    } else if (key === 'autoStart') {
      configureAutoStart(Boolean(value));
    } else if (key === 'trayBadges') {
      const total = value ? accountManager.getTotalUnread() : 0;
      updateTrayBadge(total);
      try {
        app.setBadgeCount(total);
      } catch (e) {}
    } else if (key === 'spellCheck') {
      const isEnabled = Boolean(value);
      if (mainWindow && mainWindow.webContents && mainWindow.webContents.session) {
        mainWindow.webContents.session.setSpellCheckerEnabled(isEnabled);
      }
      const accs = accountManager.getAll();
      for (const acc of accs) {
        try {
          const sess = session.fromPartition(acc.partition);
          sess.setSpellCheckerEnabled(isEnabled);
        } catch (e) {}
      }
    }

    return settingsStore.data;
  });

  ipcMain.handle('session:clearCache', async (event, partition) => {
    try {
      const sess = session.fromPartition(partition);
      await sess.clearCache();
      await sess.clearStorageData({
        storages: ['appcache', 'cookies', 'filesystem', 'indexdb', 'localstorage', 'shadercache', 'websql', 'serviceworkers', 'cachestorage']
      });
      return true;
    } catch (err) {
      console.error('Failed to clear session data:', err);
      return false;
    }
  });

  ipcMain.handle('session:clearAllCache', async () => {
    try {
      const accs = accountManager.getAll();
      for (const acc of accs) {
        const sess = session.fromPartition(acc.partition);
        await sess.clearCache();
        await sess.clearStorageData({
          storages: ['appcache', 'cookies', 'filesystem', 'indexdb', 'localstorage', 'shadercache', 'websql', 'serviceworkers', 'cachestorage']
        });
      }
      return true;
    } catch (err) {
      console.error('Failed to clear all session cache:', err);
      return false;
    }
  });

  // Session setup for webview partitions
  ipcMain.handle('session:setup', (event, partition) => {
    const sess = session.fromPartition(partition);
    spoofUserAgent(sess);
    setupPermissions(sess, partition);
    const isSpellCheck = settingsStore ? settingsStore.get('spellCheck', true) : true;
    try {
      sess.setSpellCheckerEnabled(Boolean(isSpellCheck));
    } catch (e) {}
    return true;
  });

  // Open external URL
  ipcMain.handle('app:openExternal', (event, url) => {
    if (url && (url.startsWith('https://') || url.startsWith('http://') || url.startsWith('mailto:'))) {
      shell.openExternal(url);
      return true;
    }
    return false;
  });

  // App controls
  ipcMain.handle('app:quit', () => {
    isQuitting = true;
    app.quit();
  });

  // Get protocol URL if app was started by one
  ipcMain.handle('app:getStartupUrl', () => {
    const url = process.argv.find(arg => arg.startsWith('whatsapp://') || arg.startsWith('sms:') || arg.startsWith('sms://'));
    return url || null;
  });
}

// ─── App Lifecycle ───────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  // Initialize stores
  settingsStore = new JsonStore('settings', {
    autoStart: false,
    closeToTray: true,
    startMinimized: false,
    theme: 'dark',
    notifications: true,
    soundAlerts: true,
    trayBadges: true,
    sidebarCollapsed: false,
    compactWA: true,
    spellCheck: true,
    zoomLevel: '100',
  });

  accountManager = new AccountManager();

  // Sync autostart settings with the operating system
  configureAutoStart(Boolean(settingsStore.get('autoStart', false)));

  // Setup IPC handlers
  setupIPC();

  // Register protocol handler
  setupProtocolHandler();

  // Check if app should start minimized
  const startMinimizedArg = process.argv.includes('--start-minimized') || process.argv.includes('--hidden');
  const shouldStartMinimized = startMinimizedArg || settingsStore.get('startMinimized', false);

  // Create the main window
  createMainWindow(shouldStartMinimized);

  if (shouldStartMinimized) {
    mainWindow.hide();
  }

  // Create system tray
  createTray(mainWindow, () => {
    isQuitting = true;
    app.quit();
  });

  // Handle protocol URLs on app start (Linux)
  const startupUrl = process.argv.find(arg => arg.startsWith('whatsapp://') || arg.startsWith('sms:') || arg.startsWith('sms://'));
  if (startupUrl) {
    mainWindow.webContents.once('did-finish-load', () => {
      handleProtocolUrl(startupUrl, mainWindow);
    });
  }
});

// Intercept window open & external navigation across all webContents (including <webview>)
app.on('web-contents-created', (event, contents) => {
  // Handle new windows / popups / target="_blank"
  contents.setWindowOpenHandler(({ url }) => {
    if (url && (url.startsWith('https://') || url.startsWith('http://') || url.startsWith('mailto:'))) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // Handle in-page / top-level navigation to external links in webviews
  contents.on('will-navigate', (e, navigationUrl) => {
    if (contents.getType() === 'webview' && !isInternalMessagingUrl(navigationUrl)) {
      e.preventDefault();
      if (navigationUrl.startsWith('https://') || navigationUrl.startsWith('http://') || navigationUrl.startsWith('mailto:')) {
        shell.openExternal(navigationUrl);
      }
    }
  });

  // Handle main frame navigation in webviews
  contents.on('will-frame-navigate', (e) => {
    if (e.isMainFrame && contents.getType() === 'webview' && !isInternalMessagingUrl(e.url)) {
      e.preventDefault();
      if (e.url.startsWith('https://') || e.url.startsWith('http://') || e.url.startsWith('mailto:')) {
        shell.openExternal(e.url);
      }
    }
  });
});

app.on('window-all-closed', () => {
  // Keep app active in tray on Linux
});

app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow();
  } else {
    mainWindow.show();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
});
