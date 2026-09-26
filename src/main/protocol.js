const { app } = require('electron');
const path = require('path');

/**
 * Register the app as the default handler for whatsapp:// and sms: URLs.
 * On Linux this works alongside the .desktop file's MimeType entry.
 */
function setupProtocolHandler() {
  const protocols = ['whatsapp', 'sms'];
  protocols.forEach((proto) => {
    if (process.defaultApp) {
      if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient(proto, process.execPath, [
          path.resolve(process.argv[1]),
        ]);
      }
    } else {
      app.setAsDefaultProtocolClient(proto);
    }
  });
}

/**
 * Convert a whatsapp:// or sms: protocol URL to a target web URL.
 */
function convertToWebUrl(protocolUrl) {
  try {
    if (protocolUrl.startsWith('sms:')) {
      return 'https://messages.google.com/web';
    }

    const url = new URL(protocolUrl);
    const action = url.hostname || url.pathname.replace(/^\/+/, '');
    const params = url.searchParams;

    switch (action) {
      case 'send': {
        const phone = params.get('phone');
        const text = params.get('text');
        if (phone) {
          const cleanPhone = phone.replace(/[^0-9]/g, '');
          let webUrl = `https://web.whatsapp.com/send?phone=${cleanPhone}`;
          if (text) {
            webUrl += `&text=${encodeURIComponent(text)}`;
          }
          return webUrl;
        }
        return 'https://web.whatsapp.com';
      }

      case 'chat': {
        const code = params.get('code');
        if (code) {
          return `https://web.whatsapp.com/accept?code=${code}`;
        }
        return 'https://web.whatsapp.com';
      }

      default:
        return 'https://web.whatsapp.com';
    }
  } catch (err) {
    console.error('Failed to parse protocol URL:', err);
    return 'https://web.whatsapp.com';
  }
}

/**
 * Handle an incoming whatsapp:// or sms: protocol URL.
 * Sends the converted web URL to the renderer process.
 */
function handleProtocolUrl(protocolUrl, mainWindow) {
  if (!mainWindow) return;

  const webUrl = convertToWebUrl(protocolUrl);
  console.log(`Protocol URL: ${protocolUrl} → ${webUrl}`);

  // Show and focus the window
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();

  // Send the URL to the renderer for navigation
  mainWindow.webContents.send('protocol:navigate', webUrl);
}

module.exports = { setupProtocolHandler, handleProtocolUrl, convertToWebUrl };
