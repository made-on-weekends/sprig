const fs = require('fs');
const path = require('path');
const { app } = require('electron');

// Color palette for account avatars
const ACCOUNT_COLORS = [
  '#00a884', // WhatsApp green
  '#5b72e8', // Blue
  '#e85b8b', // Pink
  '#e8a85b', // Orange
  '#8b5be8', // Purple
  '#5be8c6', // Teal
  '#e85b5b', // Red
  '#5bb8e8', // Sky blue
];

/**
 * Simple JSON file store (replaces electron-store to avoid ESM issues).
 */
class JsonStore {
  constructor(name, defaults = {}) {
    const userDataPath = app.getPath('userData');
    this.filePath = path.join(userDataPath, `${name}.json`);
    this.data = { ...defaults };

    // Load existing data
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        this.data = { ...defaults, ...JSON.parse(raw) };
      }
    } catch (err) {
      console.error('Failed to load store:', err);
    }
  }

  get(key, defaultValue) {
    const value = this.data[key];
    return value !== undefined ? value : defaultValue;
  }

  set(key, value) {
    this.data[key] = value;
    this._save();
  }

  _save() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save store:', err);
    }
  }
}

class AccountManager {
  constructor() {
    this.store = new JsonStore('accounts', {
      accounts: [],
      nextColorIndex: 0,
    });

    // Ensure at least one account exists
    if (this.store.get('accounts').length === 0) {
      this.add('Account 1', 'whatsapp');
    } else {
      // Migrate legacy accounts without service or avatar property
      const existingAccounts = this.store.get('accounts');
      let migrated = false;
      existingAccounts.forEach((acc, idx) => {
        if (acc.name === 'Sprig') {
          acc.name = `Account ${idx + 1}`;
          migrated = true;
        }
        if (!acc.service) {
          acc.service = 'whatsapp';
          migrated = true;
        }
        if (typeof acc.avatar === 'undefined') {
          acc.avatar = null;
          migrated = true;
        }
        if (typeof acc.notifications === 'undefined') {
          acc.notifications = true;
          migrated = true;
        }
      });
      if (migrated) {
        this.store.set('accounts', existingAccounts);
      }
    }
  }

  /**
   * Generate a unique ID for a new account.
   */
  _generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  /**
   * Get the next color from the palette.
   */
  _getNextColor() {
    const index = this.store.get('nextColorIndex', 0);
    const color = ACCOUNT_COLORS[index % ACCOUNT_COLORS.length];
    this.store.set('nextColorIndex', index + 1);
    return color;
  }

  /**
   * Get all accounts.
   */
  getAll() {
    return this.store.get('accounts');
  }

  /**
   * Add a new account.
   * @param {string} [name]
   * @param {'whatsapp'|'google-messages'} [service='whatsapp']
   * @param {string|null} [avatar=null]
   */
  add(name, service = 'whatsapp', avatar = null) {
    const accounts = this.getAll();
    const id = this._generateId();
    const serviceType = service === 'google-messages' ? 'google-messages' : 'whatsapp';
    const defaultName = serviceType === 'google-messages'
      ? `Messages ${accounts.filter(a => a.service === 'google-messages').length + 1}`
      : `Account ${accounts.length + 1}`;

    const partitionPrefix = serviceType === 'google-messages' ? 'gm' : 'wa';

    const account = {
      id,
      name: name || defaultName,
      service: serviceType,
      partition: `persist:${partitionPrefix}-${id}`,
      color: this._getNextColor(),
      avatar: avatar || null,
      notifications: true,
      unreadCount: 0,
      createdAt: Date.now(),
    };
    accounts.push(account);
    this.store.set('accounts', accounts);
    return account;
  }

  /**
   * Remove an account by ID.
   */
  remove(id) {
    const accounts = this.getAll().filter(a => a.id !== id);
    // Don't allow removing the last account
    if (accounts.length === 0) return false;
    this.store.set('accounts', accounts);
    return true;
  }

  /**
   * Rename an account.
   */
  rename(id, name) {
    const accounts = this.getAll();
    const account = accounts.find(a => a.id === id);
    if (account) {
      account.name = name;
      this.store.set('accounts', accounts);
      return true;
    }
    return false;
  }

  /**
   * Set custom avatar for an account.
   * @param {string} id
   * @param {string|null} avatar Base64 data URL or null
   */
  setAvatar(id, avatar) {
    const accounts = this.getAll();
    const account = accounts.find(a => a.id === id);
    if (account) {
      account.avatar = avatar || null;
      this.store.set('accounts', accounts);
      return true;
    }
    return false;
  }

  /**
   * Set notifications enabled/disabled for an account.
   * @param {string} id
   * @param {boolean} enabled
   */
  setNotifications(id, enabled) {
    const accounts = this.getAll();
    const account = accounts.find(a => a.id === id);
    if (account) {
      account.notifications = Boolean(enabled);
      this.store.set('accounts', accounts);
      return true;
    }
    return false;
  }

  /**
   * Update unread count for an account.
   */
  updateUnread(id, count) {
    const accounts = this.getAll();
    const account = accounts.find(a => a.id === id);
    if (account) {
      account.unreadCount = count;
      this.store.set('accounts', accounts);
    }
  }

  /**
   * Get total unread messages across all accounts.
   */
  getTotalUnread() {
    return this.getAll().reduce((total, account) => total + (account.unreadCount || 0), 0);
  }
}

module.exports = { AccountManager, JsonStore };
