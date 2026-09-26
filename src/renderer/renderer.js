/**
 * Sprig — Renderer Process
 * Manages account tabs, collapsible sidebar, webviews, and Settings modal.
 */

// ─── API Wrapper ────────────────────────────────────────────────────────────
const api = window.sprig || window.walinux;

// ─── State ──────────────────────────────────────────────────────────────────
let accounts = [];
let settings = {};
let activeAccountId = null;
let contextMenuTarget = null;
const webviewCssKeys = new Map(); // Store insertCSS key per webview

// ─── DOM References ─────────────────────────────────────────────────────────
const sidebar = document.getElementById('sidebar');
const sidebarHeader = document.getElementById('sidebar-header');
const appLogo = document.getElementById('app-logo');
const accountTabsContainer = document.getElementById('account-tabs');
const webviewContainer = document.getElementById('webview-container');
const loadingScreen = document.getElementById('loading-screen');
const loadingText = document.getElementById('loading-text');
const addAccountBtn = document.getElementById('add-account-btn');
const donateBtn = document.getElementById('donate-btn');
const settingsBtn = document.getElementById('settings-btn');
const aboutDonateBtn = document.getElementById('about-donate-btn');
const contextMenu = document.getElementById('context-menu');

// Dialog references
const addDialog = document.getElementById('add-dialog');
const addNameInput = document.getElementById('add-name-input');
const addConfirmBtn = document.getElementById('add-confirm');
const addCancelBtn = document.getElementById('add-cancel');
const serviceOptions = document.querySelectorAll('.service-option');

const renameDialog = document.getElementById('rename-dialog');
const renameInput = document.getElementById('rename-input');
const renameConfirmBtn = document.getElementById('rename-confirm');
const renameCancelBtn = document.getElementById('rename-cancel');

// Settings modal references
const settingsDialog = document.getElementById('settings-dialog');
const settingsCloseBtn = document.getElementById('settings-close');
const settingsTabBtns = document.querySelectorAll('.settings-tab-btn');
const settingsPanels = document.querySelectorAll('.settings-panel');
const settingsAccountList = document.getElementById('settings-account-list');
const settingsNotifAccountList = document.getElementById('settings-notifications-account-list');
const accountNotifSubpanel = document.getElementById('account-notifications-subpanel');
const soundAlertsSettingItem = document.getElementById('sound-alerts-setting-item');

// Settings inputs
const settingAutostart = document.getElementById('setting-autostart');
const settingClosetotray = document.getElementById('setting-closetotray');
const settingStartminimized = document.getElementById('setting-startminimized');
const settingSpellcheck = document.getElementById('setting-spellcheck');
const settingTheme = document.getElementById('setting-theme');
const settingSidebarcollapsed = document.getElementById('setting-sidebarcollapsed');
const settingCompactwa = document.getElementById('setting-compactwa');
const settingZoomlevel = document.getElementById('setting-zoomlevel');
const settingNotifications = document.getElementById('setting-notifications');
const settingSoundalerts = document.getElementById('setting-soundalerts');
const settingTraybadges = document.getElementById('setting-traybadges');
const clearAllCacheBtn = document.getElementById('clear-all-cache-btn');

// Context menu items
const ctxRename = document.getElementById('ctx-rename');
const ctxAvatar = document.getElementById('ctx-avatar');
const ctxRemoveAvatar = document.getElementById('ctx-remove-avatar');
const ctxReload = document.getElementById('ctx-reload');
const ctxRemove = document.getElementById('ctx-remove');
const avatarFileInput = document.getElementById('avatar-file-input');

// Add Dialog Avatar elements
const addAvatarBtn = document.getElementById('add-avatar-btn');
const addAvatarClearBtn = document.getElementById('add-avatar-clear-btn');
const addAvatarPreview = document.getElementById('add-avatar-preview');
const addAvatarInitials = document.getElementById('add-avatar-initials');
const addAvatarImg = document.getElementById('add-avatar-img');

let pendingAddAvatar = null;
let pendingAvatarTargetAccountId = null;

// ─── Constants ──────────────────────────────────────────────────────────────
const DONATION_BASE_URL = 'https://asifiqbal.rocks/donation';
function getDonationUrl(placement = 'app') {
  return `${DONATION_BASE_URL}?utm_source=sprig&utm_medium=desktop_app&utm_campaign=${encodeURIComponent(placement)}&ref=sprig-${encodeURIComponent(placement)}`;
}
const WHATSAPP_URL = 'https://web.whatsapp.com';
const GOOGLE_MESSAGES_URL = 'https://messages.google.com/web';
const CHROME_USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';
const FIREFOX_USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133.0';

const WA_ICON_SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.79 14.07c-.24.68-1.4 1.25-1.93 1.33-.51.08-1.18.11-1.9-.12-.44-.14-1.01-.33-1.74-.65-3.08-1.33-5.09-4.45-5.24-4.66-.15-.2-1.25-1.66-1.25-3.17 0-1.51.79-2.25 1.07-2.55.28-.3.62-.37.83-.37.21 0 .41.01.59.02.19.01.44-.07.69.52.26.6.87 2.12.95 2.27.08.15.13.33.03.53-.1.2-.15.33-.3.51-.15.18-.32.4-.46.54-.15.15-.31.31-.13.62.18.31.8 1.32 1.72 2.14 1.18 1.05 2.18 1.38 2.49 1.53.31.15.49.13.67-.08.18-.21.77-.9 0.98-1.2.21-.3.41-.26.69-.15.28.11 1.78.84 2.08.99.3.15.51.23.59.35.08.13.08.74-.16 1.42z"/></svg>';
const GM_ICON_SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/><circle cx="8" cy="10" r="1.5"/><circle cx="12" cy="10" r="1.5"/><circle cx="16" cy="10" r="1.5"/></svg>';

const COMPACT_WA_CSS = `
  /* Hide WhatsApp Web duplicate left icon rail in Sprig */
  header._aajy,
  div[data-tab="1"] > header,
  header[aria-label="Navigation rail"],
  header[role="navigation"]._aajy,
  ._aajy {
    display: none !important;
  }
`;

function isExternalServiceUrl(url, service) {
  if (!url || typeof url !== 'string') return false;
  if (
    url === 'about:blank' ||
    url.startsWith('blob:') ||
    url.startsWith('data:') ||
    url.startsWith('devtools:') ||
    url.startsWith('chrome-extension:')
  ) {
    return false;
  }

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    if (service === 'google-messages') {
      const isGM =
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
      return !isGM;
    }

    // Default: WhatsApp
    const isWA =
      host === 'web.whatsapp.com' ||
      host === 'whatsapp.com' ||
      host.endsWith('.whatsapp.com') ||
      host.endsWith('.whatsapp.net');
    return !isWA;
  } catch (err) {
    return false;
  }
}

// ─── Initialize ─────────────────────────────────────────────────────────────
async function init() {
  // Load settings and accounts
  settings = await api.getSettings();
  accounts = await api.getAccounts();

  if (accounts.length === 0) {
    const account = await api.addAccount('Account 1');
    accounts = [account];
  }

  // Apply visual settings
  applyTheme(settings.theme || 'dark');
  setSidebarCollapsed(settings.sidebarCollapsed || false);

  // Sync settings UI values
  syncSettingsUI();

  // Render all account tabs
  renderAccountTabs();

  // Create webviews for all accounts
  for (const account of accounts) {
    await createWebview(account);
  }

  // Activate the first account
  switchToAccount(accounts[0].id);

  // Check for startup URL
  const startupUrl = await api.getStartupUrl();
  if (startupUrl) {
    handleIncomingProtocolUrl(startupUrl);
  }

  // Setup keyboard shortcuts & settings listeners
  setupKeyboardShortcuts();
  setupSettingsListeners();

  // Listen for protocol navigation from main process
  api.onProtocolNavigate((url) => {
    handleIncomingProtocolUrl(url);
  });
}

// ─── Theme & Sidebar Helpers ────────────────────────────────────────────────
function applyTheme(theme) {
  if (theme === 'light') {
    document.body.classList.add('light-theme');
  } else {
    document.body.classList.remove('light-theme');
  }
}

function setSidebarCollapsed(collapsed) {
  sidebar.classList.toggle('collapsed', Boolean(collapsed));
  if (settingSidebarcollapsed) {
    settingSidebarcollapsed.checked = Boolean(collapsed);
  }
}

if (sidebarHeader) {
  sidebarHeader.addEventListener('click', () => {
    const isCollapsed = sidebar.classList.contains('collapsed');
    const newState = !isCollapsed;
    setSidebarCollapsed(newState);
    api.setSetting('sidebarCollapsed', newState);
  });
}

// ─── Image Processing Helper ────────────────────────────────────────────────
function processImageFile(file, maxSize = 128) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image'));
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const minDim = Math.min(img.width, img.height);
        canvas.width = maxSize;
        canvas.height = maxSize;
        const ctx = canvas.getContext('2d');
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, maxSize, maxSize);
        const dataUrl = canvas.toDataURL('image/png', 0.9);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Render Account Tabs ────────────────────────────────────────────────────
function renderAccountTabs() {
  accountTabsContainer.innerHTML = '';

  accounts.forEach((account, index) => {
    const tab = document.createElement('div');
    tab.className = `account-tab${account.id === activeAccountId ? ' active' : ''}`;
    tab.dataset.accountId = account.id;
    const isGM = account.service === 'google-messages';
    const serviceLabel = isGM ? 'Google Messages' : 'WhatsApp Web';
    tab.setAttribute('title', `${account.name} (${serviceLabel})`);

    const initials = getInitials(account.name);
    const avatarContent = account.avatar
      ? `<img src="${account.avatar}" class="account-avatar-img" alt="${escapeHtml(account.name)}">`
      : initials;

    tab.innerHTML = `
      <div class="account-avatar-wrapper">
        <div class="account-avatar" style="background: ${account.avatar ? 'transparent' : account.color}">
          ${avatarContent}
        </div>
        <span class="account-service-badge ${isGM ? 'google-messages' : 'whatsapp'}" title="${serviceLabel}">
          ${isGM ? GM_ICON_SVG : WA_ICON_SVG}
        </span>
        <span class="unread-badge ${account.unreadCount > 0 ? '' : 'hidden'}" id="badge-${account.id}">
          ${account.unreadCount || 0}
        </span>
      </div>
      <span class="account-name">${escapeHtml(account.name)}</span>
      ${index < 9 ? `<span class="shortcut-hint">⌃${index + 1}</span>` : ''}
    `;

    // Click to switch
    tab.addEventListener('click', () => {
      switchToAccount(account.id);
    });

    // Right-click for context menu
    tab.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      showContextMenu(e, account);
    });

    accountTabsContainer.appendChild(tab);
  });
}

function applyWebviewZoom(webview, zoomLevelStr) {
  if (!webview) return;
  const zoomFactor = parseFloat(zoomLevelStr || '100') / 100;
  try {
    if (typeof webview.setZoomFactor === 'function') {
      webview.setZoomFactor(zoomFactor);
    }
  } catch (err) {
    console.log('setZoomFactor error:', err);
  }
}

function applyWebviewAudioMuted(webview, isMuted) {
  if (!webview) return;
  try {
    if (typeof webview.setAudioMuted === 'function') {
      webview.setAudioMuted(Boolean(isMuted));
    }
  } catch (err) {
    console.log('setAudioMuted error:', err);
  }
}

function isAccountAudioAllowed(account) {
  if (settings.notifications === false) return false;
  if (settings.soundAlerts === false) return false;
  if (account && account.notifications === false) return false;
  return true;
}

function updateAllWebviewsAudio() {
  document.querySelectorAll('#webview-container webview').forEach(wv => {
    const accId = wv.id.replace('webview-', '');
    const acc = accounts.find(a => a.id === accId);
    const isAllowed = isAccountAudioAllowed(acc);
    applyWebviewAudioMuted(wv, !isAllowed);
  });
}

function handleIncomingProtocolUrl(url) {
  if (!url) return;
  const isGoogleMessages = url.includes('messages.google.com');
  const targetService = isGoogleMessages ? 'google-messages' : 'whatsapp';

  const activeAcc = accounts.find(a => a.id === activeAccountId);
  if (!activeAcc || activeAcc.service !== targetService) {
    const matchingAccount = accounts.find(a => a.service === targetService);
    if (matchingAccount) {
      switchToAccount(matchingAccount.id);
    }
  }

  navigateActiveWebview(url);
}

// ─── Inject Compact CSS to Webview ─────────────────────────────────────────
async function updateWebviewCompactMode(webview) {
  if (!webview) return;
  const isCompact = settings.compactWA !== false; // Default true

  if (isCompact) {
    try {
      const cssKey = await webview.insertCSS(COMPACT_WA_CSS);
      webviewCssKeys.set(webview.id, cssKey);
    } catch (err) {
      console.log('insertCSS error:', err);
    }
  } else {
    const cssKey = webviewCssKeys.get(webview.id);
    if (cssKey) {
      try {
        await webview.removeInsertedCSS(cssKey);
      } catch (e) {}
      webviewCssKeys.delete(webview.id);
    }
  }
}

// ─── Create Webview ─────────────────────────────────────────────────────────
async function createWebview(account) {
  if (document.getElementById(`webview-${account.id}`)) return;

  // Set up session permissions for this partition first
  await api.setupSession(account.partition);

  const isGM = account.service === 'google-messages';
  const webview = document.createElement('webview');
  webview.id = `webview-${account.id}`;
  webview.setAttribute('partition', account.partition);
  webview.setAttribute('useragent', CHROME_USER_AGENT);
  webview.setAttribute('allowpopups', 'true');
  webview.setAttribute('autosize', 'on');
  webview.setAttribute('webpreferences', 'autoplayPolicy=no-user-gesture-required');
  webview.src = isGM ? GOOGLE_MESSAGES_URL : WHATSAPP_URL;
  webview._isLoading = true;

  // Inject compact mode CSS, audio muting & zoom factor when webview DOM is ready
  webview.addEventListener('dom-ready', () => {
    if (!isGM) {
      updateWebviewCompactMode(webview);
    }
    applyWebviewZoom(webview, settings.zoomLevel || '100');
    applyWebviewAudioMuted(webview, !isAccountAudioAllowed(account));
  });

  // Listen for title changes to detect unread messages
  webview.addEventListener('page-title-updated', (e) => {
    const title = e.title || '';
    const unreadMatch = title.match(/\((\d+)\)/);
    const unreadCount = unreadMatch ? parseInt(unreadMatch[1], 10) : 0;

    // Update badge & notify main process
    updateUnreadBadge(account.id, unreadCount);
    api.updateUnread(account.id, unreadCount);

    const acc = accounts.find(a => a.id === account.id);
    if (acc) acc.unreadCount = unreadCount;
  });

  // Handle loading state
  webview.addEventListener('did-start-loading', () => {
    webview._isLoading = true;
    if (account.id === activeAccountId) {
      if (loadingText) {
        loadingText.textContent = isGM ? 'Loading Google Messages...' : 'Loading WhatsApp Web...';
      }
      loadingScreen.classList.remove('hidden');
    }
  });

  webview.addEventListener('did-stop-loading', () => {
    webview._isLoading = false;
    if (account.id === activeAccountId) {
      loadingScreen.classList.add('hidden');
    }
  });

  webview.addEventListener('did-fail-load', (e) => {
    console.error('Webview load failed:', e.errorCode, e.errorDescription, e.validatedURL);
    webview._isLoading = false;
    if (account.id === activeAccountId) {
      loadingScreen.classList.add('hidden');
    }
  });

  // Handle navigation to/from Google Accounts and external links
  webview.addEventListener('will-navigate', (e) => {
    if (e.url && (e.url.includes('accounts.google.com') || e.url.includes('accounts.youtube.com'))) {
      try {
        webview.setUserAgent(FIREFOX_USER_AGENT);
      } catch (err) {}
    } else {
      try {
        webview.setUserAgent(CHROME_USER_AGENT);
      } catch (err) {}
    }

    if (isExternalServiceUrl(e.url, account.service)) {
      e.preventDefault();
      if (api && api.openExternal) {
        api.openExternal(e.url);
      } else {
        window.open(e.url, '_blank');
      }
    }
  });

  webview.addEventListener('did-navigate', (e) => {
    if (e.url && (e.url.includes('accounts.google.com') || e.url.includes('accounts.youtube.com'))) {
      try {
        webview.setUserAgent(FIREFOX_USER_AGENT);
      } catch (err) {}
    } else {
      try {
        webview.setUserAgent(CHROME_USER_AGENT);
      } catch (err) {}
    }
  });

  // External link clicks inside webview
  webview.addEventListener('new-window', (e) => {
    e.preventDefault();
    const url = e.url;
    if (url && (url.startsWith('https://') || url.startsWith('http://') || url.startsWith('mailto:'))) {
      if (api && api.openExternal) {
        api.openExternal(url);
      } else {
        window.open(url, '_blank');
      }
    }
  });

  // Permission requests inside webview
  webview.addEventListener('permissionrequest', (e) => {
    if (e.permission === 'notifications') {
      const acc = accounts.find(a => a.id === account.id);
      const allowNotifs = settings.notifications !== false && (acc ? acc.notifications !== false : true);
      if (!allowNotifs) {
        return e.request.deny();
      }
    }
    const allowed = ['media', 'notifications', 'fullscreen', 'pointerLock', 'audioCapture', 'speaker-selection', 'mediaKeySystem', 'clipboard-read', 'clipboard-sanitized-write', 'persistent-storage'];
    if (allowed.includes(e.permission)) {
      e.request.allow();
    } else {
      e.request.deny();
    }
  });

  webviewContainer.appendChild(webview);
}

// ─── Switch Account ─────────────────────────────────────────────────────────
function switchToAccount(accountId) {
  activeAccountId = accountId;

  // Update tab visual state
  document.querySelectorAll('.account-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.accountId === accountId);
  });

  // Show/hide webviews
  document.querySelectorAll('#webview-container webview').forEach(wv => {
    const isActive = wv.id === `webview-${accountId}`;
    wv.classList.toggle('active', isActive);
  });

  const activeAcc = accounts.find(a => a.id === accountId);
  if (loadingText && activeAcc) {
    loadingText.textContent = activeAcc.service === 'google-messages' ? 'Loading Google Messages...' : 'Loading WhatsApp Web...';
  }

  // Safely check loading state without throwing error if not attached/dom-ready
  const activeWebview = document.getElementById(`webview-${accountId}`);
  let isLoading = false;
  if (activeWebview) {
    if (typeof activeWebview._isLoading !== 'undefined') {
      isLoading = activeWebview._isLoading;
    } else {
      try {
        isLoading = typeof activeWebview.isLoading === 'function' ? activeWebview.isLoading() : false;
      } catch (e) {
        isLoading = true;
      }
    }
  }

  if (isLoading) {
    loadingScreen.classList.remove('hidden');
  } else {
    loadingScreen.classList.add('hidden');
  }
}

// ─── Navigate Active Webview ────────────────────────────────────────────────
function navigateActiveWebview(url) {
  const webview = document.getElementById(`webview-${activeAccountId}`);
  if (webview) {
    webview.loadURL(url);
  }
}

// ─── Update Unread Badge ────────────────────────────────────────────────────
function updateUnreadBadge(accountId, count) {
  const badge = document.getElementById(`badge-${accountId}`);
  if (badge) {
    badge.textContent = count;
    badge.classList.toggle('hidden', count === 0);
  }
}

// ─── Avatar File Input Handling ─────────────────────────────────────────────
if (avatarFileInput) {
  avatarFileInput.addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    try {
      const dataUrl = await processImageFile(file, 128);
      if (pendingAvatarTargetAccountId === 'new') {
        pendingAddAvatar = dataUrl;
        if (addAvatarImg && addAvatarInitials && addAvatarClearBtn) {
          addAvatarImg.src = dataUrl;
          addAvatarImg.classList.remove('hidden');
          addAvatarInitials.classList.add('hidden');
          addAvatarClearBtn.classList.remove('hidden');
        }
      } else if (pendingAvatarTargetAccountId) {
        const targetId = pendingAvatarTargetAccountId;
        await api.setAvatar(targetId, dataUrl);
        const acc = accounts.find(a => a.id === targetId);
        if (acc) acc.avatar = dataUrl;
        renderAccountTabs();
        renderSettingsAccountList();
      }
    } catch (err) {
      console.error('Failed to process avatar image:', err);
    }
  });
}

if (addAvatarBtn) {
  addAvatarBtn.addEventListener('click', () => {
    pendingAvatarTargetAccountId = 'new';
    avatarFileInput.value = '';
    avatarFileInput.click();
  });
}

if (addAvatarClearBtn) {
  addAvatarClearBtn.addEventListener('click', () => {
    pendingAddAvatar = null;
    if (addAvatarImg && addAvatarInitials && addAvatarClearBtn) {
      addAvatarImg.src = '';
      addAvatarImg.classList.add('hidden');
      addAvatarInitials.classList.remove('hidden');
      addAvatarClearBtn.classList.add('hidden');
    }
  });
}

// ─── Add Account & Service Selector ─────────────────────────────────────────
serviceOptions.forEach(opt => {
  opt.addEventListener('click', () => {
    serviceOptions.forEach(o => o.classList.remove('active'));
    opt.classList.add('active');
    const radio = opt.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;

    const service = opt.dataset.service;
    if (!addNameInput.value || addNameInput.dataset.autoFilled === 'true') {
      const isGM = service === 'google-messages';
      const count = accounts.filter(a => a.service === service).length + 1;
      const defaultName = isGM ? `Messages ${count}` : `Account ${accounts.length + 1}`;
      addNameInput.value = defaultName;
      addNameInput.dataset.autoFilled = 'true';
      if (addAvatarInitials) {
        addAvatarInitials.textContent = getInitials(defaultName);
      }
    }
  });
});

addNameInput.addEventListener('input', () => {
  addNameInput.dataset.autoFilled = 'false';
  if (addAvatarInitials && !pendingAddAvatar) {
    addAvatarInitials.textContent = getInitials(addNameInput.value.trim() || 'A');
  }
});

addAccountBtn.addEventListener('click', () => {
  addNameInput.value = '';
  addNameInput.dataset.autoFilled = 'true';
  pendingAddAvatar = null;
  if (addAvatarImg && addAvatarInitials && addAvatarClearBtn) {
    addAvatarImg.src = '';
    addAvatarImg.classList.add('hidden');
    addAvatarInitials.classList.remove('hidden');
    addAvatarInitials.textContent = 'A';
    addAvatarClearBtn.classList.add('hidden');
  }
  // Reset service selection to whatsapp
  const waOption = document.querySelector('.service-option[data-service="whatsapp"]');
  if (waOption) waOption.click();
  addDialog.classList.remove('hidden');
  setTimeout(() => addNameInput.focus(), 100);
});

addConfirmBtn.addEventListener('click', async () => {
  const selectedRadio = document.querySelector('input[name="account-service"]:checked');
  const service = selectedRadio ? selectedRadio.value : 'whatsapp';
  const defaultName = service === 'google-messages'
    ? `Messages ${accounts.filter(a => a.service === 'google-messages').length + 1}`
    : `Account ${accounts.length + 1}`;
  const name = addNameInput.value.trim() || defaultName;

  const account = await api.addAccount(name, service, pendingAddAvatar);
  accounts.push(account);
  renderAccountTabs();
  await createWebview(account);
  switchToAccount(account.id);
  addDialog.classList.add('hidden');
});

addCancelBtn.addEventListener('click', () => {
  addDialog.classList.add('hidden');
});

addNameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addConfirmBtn.click();
  if (e.key === 'Escape') addCancelBtn.click();
});

// ─── Context Menu ───────────────────────────────────────────────────────────
function showContextMenu(event, account) {
  contextMenuTarget = account;

  const menuWidth = 180;
  const menuHeight = 180;
  const x = Math.min(event.clientX, window.innerWidth - menuWidth - 8);
  const y = Math.min(event.clientY, window.innerHeight - menuHeight - 8);

  contextMenu.style.left = `${Math.max(8, x)}px`;
  contextMenu.style.top = `${Math.max(8, y)}px`;
  contextMenu.classList.remove('hidden');

  if (ctxRemoveAvatar) {
    ctxRemoveAvatar.style.display = account.avatar ? 'flex' : 'none';
  }

  ctxRemove.disabled = accounts.length <= 1;
  ctxRemove.style.opacity = accounts.length <= 1 ? '0.4' : '1';
  ctxRemove.style.pointerEvents = accounts.length <= 1 ? 'none' : 'auto';
}

document.addEventListener('click', () => {
  contextMenu.classList.add('hidden');
});

if (ctxAvatar) {
  ctxAvatar.addEventListener('click', () => {
    contextMenu.classList.add('hidden');
    if (!contextMenuTarget) return;
    pendingAvatarTargetAccountId = contextMenuTarget.id;
    avatarFileInput.value = '';
    avatarFileInput.click();
  });
}

if (ctxRemoveAvatar) {
  ctxRemoveAvatar.addEventListener('click', async () => {
    contextMenu.classList.add('hidden');
    if (!contextMenuTarget) return;
    await api.setAvatar(contextMenuTarget.id, null);
    const acc = accounts.find(a => a.id === contextMenuTarget.id);
    if (acc) acc.avatar = null;
    renderAccountTabs();
    renderSettingsAccountList();
  });
}

ctxRename.addEventListener('click', () => {
  contextMenu.classList.add('hidden');
  if (!contextMenuTarget) return;

  renameInput.value = contextMenuTarget.name;
  renameDialog.classList.remove('hidden');
  setTimeout(() => {
    renameInput.focus();
    renameInput.select();
  }, 100);
});

renameConfirmBtn.addEventListener('click', async () => {
  if (!contextMenuTarget) return;
  const newName = renameInput.value.trim();
  if (newName) {
    await api.renameAccount(contextMenuTarget.id, newName);
    const acc = accounts.find(a => a.id === contextMenuTarget.id);
    if (acc) acc.name = newName;
    renderAccountTabs();
  }
  renameDialog.classList.add('hidden');
});

renameCancelBtn.addEventListener('click', () => {
  renameDialog.classList.add('hidden');
});

renameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') renameConfirmBtn.click();
  if (e.key === 'Escape') renameCancelBtn.click();
});

ctxReload.addEventListener('click', () => {
  contextMenu.classList.add('hidden');
  if (!contextMenuTarget) return;

  const webview = document.getElementById(`webview-${contextMenuTarget.id}`);
  if (webview) webview.reload();
});

ctxRemove.addEventListener('click', async () => {
  contextMenu.classList.add('hidden');
  if (!contextMenuTarget || accounts.length <= 1) return;

  const confirmed = confirm(`Remove "${contextMenuTarget.name}"? This will log you out of this account.`);
  if (!confirmed) return;

  const success = await api.removeAccount(contextMenuTarget.id);
  if (success) {
    const webview = document.getElementById(`webview-${contextMenuTarget.id}`);
    if (webview) webview.remove();

    accounts = accounts.filter(a => a.id !== contextMenuTarget.id);
    if (activeAccountId === contextMenuTarget.id) {
      switchToAccount(accounts[0].id);
    }
    renderAccountTabs();
  }
});

// ─── Settings Modal Logic ───────────────────────────────────────────────────
function setupSettingsListeners() {
  settingsBtn.addEventListener('click', async () => {
    settings = await api.getSettings();
    syncSettingsUI();
    renderNotificationsAccountList();
    renderSettingsAccountList();

    // Ensure active tab button & panel are in sync
    const activeBtn = document.querySelector('.settings-tab-btn.active') || settingsTabBtns[0];
    if (activeBtn) {
      const tabName = activeBtn.dataset.tab;
      settingsTabBtns.forEach(b => b.classList.toggle('active', b === activeBtn));
      settingsPanels.forEach(p => p.classList.toggle('active', p.id === `tab-${tabName}`));
    }

    settingsDialog.classList.remove('hidden');
  });

  settingsCloseBtn.addEventListener('click', () => {
    settingsDialog.classList.add('hidden');
  });

  // Settings Tabs Navigation
  settingsTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      settingsTabBtns.forEach(b => b.classList.toggle('active', b === btn));
      settingsPanels.forEach(p => p.classList.toggle('active', p.id === `tab-${tabName}`));
    });
  });

  // Toggle switch listeners
  settingAutostart.addEventListener('change', (e) => api.setSetting('autoStart', e.target.checked));
  settingClosetotray.addEventListener('change', (e) => api.setSetting('closeToTray', e.target.checked));
  settingStartminimized.addEventListener('change', (e) => api.setSetting('startMinimized', e.target.checked));
  settingSpellcheck.addEventListener('change', (e) => api.setSetting('spellCheck', e.target.checked));
  
  settingNotifications.addEventListener('change', (e) => {
    const val = e.target.checked;
    settings.notifications = val;
    api.setSetting('notifications', val);
    syncSettingsUI();
    updateAllWebviewsAudio();
  });

  settingSoundalerts.addEventListener('change', (e) => {
    const val = e.target.checked;
    settings.soundAlerts = val;
    api.setSetting('soundAlerts', val);
    updateAllWebviewsAudio();
  });

  settingTraybadges.addEventListener('change', (e) => api.setSetting('trayBadges', e.target.checked));

  settingTheme.addEventListener('change', (e) => {
    const val = e.target.value;
    applyTheme(val);
    api.setSetting('theme', val);
  });

  settingSidebarcollapsed.addEventListener('change', (e) => {
    const val = e.target.checked;
    setSidebarCollapsed(val);
    api.setSetting('sidebarCollapsed', val);
  });

  settingCompactwa.addEventListener('change', (e) => {
    const val = e.target.checked;
    settings.compactWA = val;
    api.setSetting('compactWA', val);
    document.querySelectorAll('#webview-container webview').forEach(wv => {
      updateWebviewCompactMode(wv);
    });
  });

  settingZoomlevel.addEventListener('change', (e) => {
    const val = e.target.value;
    settings.zoomLevel = val;
    api.setSetting('zoomLevel', val);
    document.querySelectorAll('#webview-container webview').forEach(wv => {
      applyWebviewZoom(wv, val);
    });
  });

  if (clearAllCacheBtn) {
    clearAllCacheBtn.addEventListener('click', async () => {
      clearAllCacheBtn.textContent = 'Clearing All Cache...';
      const success = await api.clearAllCache();
      clearAllCacheBtn.textContent = success ? 'All Session Cache Cleared!' : 'Error Clearing Cache';
      setTimeout(() => {
        clearAllCacheBtn.textContent = 'Clear All Session Cache';
      }, 2500);
    });
  }

  // Support & Donation handlers
  if (donateBtn) {
    donateBtn.addEventListener('click', () => openDonationPage('sidebar'));
  }

  if (aboutDonateBtn) {
    aboutDonateBtn.addEventListener('click', () => openDonationPage('about_tab'));
  }
}

function adjustZoom(deltaPercent) {
  const current = parseInt(settings.zoomLevel || '100', 10);
  let next;
  if (deltaPercent === 0) {
    next = 100;
  } else {
    next = Math.min(150, Math.max(70, current + deltaPercent));
  }
  const nextStr = String(next);
  settings.zoomLevel = nextStr;
  if (settingZoomlevel) {
    settingZoomlevel.value = nextStr;
  }
  api.setSetting('zoomLevel', nextStr);
  document.querySelectorAll('#webview-container webview').forEach(wv => {
    applyWebviewZoom(wv, nextStr);
  });
}

function openDonationPage(placement = 'app') {
  const url = getDonationUrl(placement);
  if (api && api.openExternal) {
    api.openExternal(url);
  } else {
    window.open(url, '_blank');
  }
}

function syncSettingsUI() {
  settingAutostart.checked = Boolean(settings.autoStart);
  settingClosetotray.checked = settings.closeToTray !== false;
  settingStartminimized.checked = Boolean(settings.startMinimized);
  settingSpellcheck.checked = settings.spellCheck !== false;
  settingTheme.value = settings.theme || 'dark';
  settingSidebarcollapsed.checked = Boolean(settings.sidebarCollapsed);
  settingCompactwa.checked = settings.compactWA !== false;
  settingZoomlevel.value = settings.zoomLevel || '100';
  
  const isNotifGloballyOn = settings.notifications !== false;
  settingNotifications.checked = isNotifGloballyOn;
  settingSoundalerts.checked = settings.soundAlerts !== false;
  settingTraybadges.checked = settings.trayBadges !== false;

  // Sound alerts & per-account notifications rely on Desktop Notifications
  settingSoundalerts.disabled = !isNotifGloballyOn;
  if (soundAlertsSettingItem) {
    soundAlertsSettingItem.classList.toggle('disabled', !isNotifGloballyOn);
  }
  if (accountNotifSubpanel) {
    accountNotifSubpanel.classList.toggle('disabled', !isNotifGloballyOn);
  }
}

function renderNotificationsAccountList() {
  if (!settingsNotifAccountList) return;
  settingsNotifAccountList.innerHTML = '';

  accounts.forEach(account => {
    const row = document.createElement('div');
    row.className = 'settings-notif-account-row';
    const initials = getInitials(account.name);
    const isGM = account.service === 'google-messages';
    const avatarContent = account.avatar
      ? `<img src="${account.avatar}" class="account-avatar-img" alt="${escapeHtml(account.name)}">`
      : initials;
    const isNotifOn = account.notifications !== false;

    row.innerHTML = `
      <div class="settings-account-info">
        <div class="account-avatar" style="background: ${account.avatar ? 'transparent' : account.color}; width: 28px; height: 28px; min-width: 28px; font-size: 11px;">
          ${avatarContent}
        </div>
        <div style="display: flex; flex-direction: column; gap: 1px;">
          <span class="account-name" style="font-size: 13px; font-weight: 500;">${escapeHtml(account.name)}</span>
          <span style="font-size: 10px; color: var(--text-muted);">${isGM ? 'Google Messages' : 'WhatsApp Web'}</span>
        </div>
      </div>
      <label class="switch switch-small" title="Toggle notifications for ${escapeHtml(account.name)}">
        <input type="checkbox" class="account-notif-toggle" data-id="${account.id}" ${isNotifOn ? 'checked' : ''}>
        <span class="slider"></span>
      </label>
    `;

    const toggleInput = row.querySelector('.account-notif-toggle');
    if (toggleInput) {
      toggleInput.addEventListener('change', async (e) => {
        const nextState = e.target.checked;
        account.notifications = nextState;
        await api.setAccountNotifications(account.id, nextState);
        updateAllWebviewsAudio();
      });
    }

    settingsNotifAccountList.appendChild(row);
  });
}

function renderSettingsAccountList() {
  settingsAccountList.innerHTML = '';

  accounts.forEach(account => {
    const row = document.createElement('div');
    row.className = 'settings-account-row';
    const initials = getInitials(account.name);
    const isGM = account.service === 'google-messages';
    const avatarContent = account.avatar
      ? `<img src="${account.avatar}" class="account-avatar-img" alt="${escapeHtml(account.name)}">`
      : initials;

    row.innerHTML = `
      <div class="settings-account-info">
        <div class="account-avatar" style="background: ${account.avatar ? 'transparent' : account.color}; width: 32px; height: 32px; min-width: 32px; font-size: 12px; position: relative; cursor: pointer;" title="Change Avatar">
          ${avatarContent}
        </div>
        <div style="display: flex; flex-direction: column; gap: 2px;">
          <span class="account-name">${escapeHtml(account.name)}</span>
          <span style="font-size: 11px; color: var(--text-muted);">${isGM ? 'Google Messages' : 'WhatsApp Web'}</span>
        </div>
      </div>
      <div style="display: flex; gap: 6px; align-items: center;">
        <button class="btn-small change-avatar-btn" data-id="${account.id}" title="Change Avatar">Avatar</button>
        <button class="btn-small clear-cache-btn" data-partition="${account.partition}">Clear Cache</button>
        ${accounts.length > 1 ? `<button class="btn-small btn-danger delete-account-btn" data-id="${account.id}" title="Delete Account">Delete</button>` : ''}
      </div>
    `;

    const avatarElem = row.querySelector('.account-avatar');
    const changeAvatarBtn = row.querySelector('.change-avatar-btn');
    const handleAvatarClick = () => {
      pendingAvatarTargetAccountId = account.id;
      avatarFileInput.value = '';
      avatarFileInput.click();
    };
    avatarElem.addEventListener('click', handleAvatarClick);
    changeAvatarBtn.addEventListener('click', handleAvatarClick);

    const clearBtn = row.querySelector('.clear-cache-btn');
    clearBtn.addEventListener('click', async () => {
      clearBtn.textContent = 'Clearing...';
      const success = await api.clearCache(account.partition);
      clearBtn.textContent = success ? 'Cleared!' : 'Error';
      setTimeout(() => { clearBtn.textContent = 'Clear Cache'; }, 2000);
    });

    const deleteBtn = row.querySelector('.delete-account-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', async () => {
        if (accounts.length <= 1) return;
        const confirmed = confirm(`Delete "${account.name}"? This will log you out of this account.`);
        if (!confirmed) return;

        const success = await api.removeAccount(account.id);
        if (success) {
          const webview = document.getElementById(`webview-${account.id}`);
          if (webview) webview.remove();

          accounts = accounts.filter(a => a.id !== account.id);
          if (activeAccountId === account.id) {
            switchToAccount(accounts[0].id);
          }
          renderAccountTabs();
          renderNotificationsAccountList();
          renderSettingsAccountList();
          updateAllWebviewsAudio();
        }
      });
    }

    settingsAccountList.appendChild(row);
  });
}

// ─── Keyboard Shortcuts ─────────────────────────────────────────────────────
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl+1 through Ctrl+9
    if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
      e.preventDefault();
      const index = parseInt(e.key, 10) - 1;
      if (index < accounts.length) switchToAccount(accounts[index].id);
    }

    // Ctrl+N
    if (e.ctrlKey && e.key === 'n') {
      e.preventDefault();
      addAccountBtn.click();
    }

    // Ctrl+Tab / Ctrl+Shift+Tab
    if (e.ctrlKey && e.key === 'Tab') {
      e.preventDefault();
      const currentIndex = accounts.findIndex(a => a.id === activeAccountId);
      const nextIndex = e.shiftKey
        ? (currentIndex - 1 + accounts.length) % accounts.length
        : (currentIndex + 1) % accounts.length;
      switchToAccount(accounts[nextIndex].id);
    }

    // Ctrl + = / Ctrl + + (Zoom In)
    if (e.ctrlKey && (e.key === '=' || e.key === '+')) {
      e.preventDefault();
      adjustZoom(10);
    }

    // Ctrl + - (Zoom Out)
    if (e.ctrlKey && e.key === '-') {
      e.preventDefault();
      adjustZoom(-10);
    }

    // Ctrl + 0 (Reset Zoom)
    if (e.ctrlKey && e.key === '0') {
      e.preventDefault();
      adjustZoom(0);
    }

    // Ctrl+Shift+I / F12 to toggle DevTools on demand
    if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i') || e.key === 'F12') {
      e.preventDefault();
      if (api.toggleDevTools) api.toggleDevTools();
    }

    // Escape
    if (e.key === 'Escape') {
      addDialog.classList.add('hidden');
      renameDialog.classList.add('hidden');
      contextMenu.classList.add('hidden');
      settingsDialog.classList.add('hidden');
    }
  });
}

// ─── Utility Functions ──────────────────────────────────────────────────────
function getInitials(name) {
  return name.split(/\s+/).map(w => w[0]).join('').toUpperCase().substr(0, 2);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ─── Start ──────────────────────────────────────────────────────────────────
init().catch(console.error);
