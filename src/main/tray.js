const { Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

let tray = null;
let normalIcon = null;
let unreadIcon = null;

/**
 * Create a tray icon from the app icon, resized for system tray.
 */
function createTrayIcon() {
  const png22Path = path.join(__dirname, '..', 'assets', 'tray-icon-22.png');
  const symbolicSvgPath = path.join(__dirname, '..', 'assets', 'brand', 'svg', 'sprig-symbolic.svg');
  const whiteSvgPath = path.join(__dirname, '..', 'assets', 'tray-icon-white.svg');
  const iconPngPath = path.join(__dirname, '..', 'assets', 'brand', 'hicolor', '512.png');

  try {
    let icon;
    if (fs.existsSync(png22Path)) {
      icon = nativeImage.createFromPath(png22Path);
    } else if (fs.existsSync(symbolicSvgPath)) {
      icon = nativeImage.createFromPath(symbolicSvgPath).resize({ width: 22, height: 22 });
    } else if (fs.existsSync(whiteSvgPath)) {
      icon = nativeImage.createFromPath(whiteSvgPath).resize({ width: 22, height: 22 });
    } else {
      icon = nativeImage.createFromPath(iconPngPath).resize({ width: 22, height: 22, quality: 'best' });
    }
    normalIcon = icon;
    unreadIcon = icon;
    return normalIcon;
  } catch (err) {
    console.error('Failed to create tray icon:', err);
    return nativeImage.createEmpty();
  }
}

/**
 * Create the system tray icon with context menu.
 */
function createTray(mainWindow, quitCallback) {
  const icon = createTrayIcon();
  
  tray = new Tray(icon);
  tray.setToolTip('Sprig — Native WhatsApp & Google Messages for Linux');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Sprig',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        if (quitCallback) quitCallback();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  // Click to toggle window visibility
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });

  return tray;
}

/**
 * Update the tray icon/tooltip to reflect unread message count.
 */
function updateTrayBadge(count) {
  if (!tray) return;

  if (count > 0) {
    tray.setToolTip(`Sprig — ${count} unread message${count > 1 ? 's' : ''}`);
  } else {
    tray.setToolTip('Sprig — Native WhatsApp & Google Messages for Linux');
  }
}

module.exports = { createTray, updateTrayBadge };
