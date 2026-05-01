import database from '../data/database.json';

class LocalDatabase {
  constructor() {
    this.data = { 
      ...database,
      users: [ // Add demo users for authentication
        {
          id: "admin-001",
          username: "admin",
          email: "admin@projecthub.com",
          password: "admin123",
          full_name: "Admin User",
          role: "admin",
          created_date: new Date().toISOString()
        },
        {
          id: "member-001", 
          username: "member",
          email: "member@projecthub.com",
          password: "member123",
          full_name: "Team Member",
          role: "member",
          created_date: new Date().toISOString()
        }
      ],
      passwordResetTokens: [] // Add password reset tokens
    };
    this.listeners = new Map();
  }

  // Generate unique ID
  generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Get all items from a collection
  list(collection, sortBy = 'created_date') {
    const items = this.data[collection] || [];
    if (sortBy) {
      return items.sort((a, b) => {
        if (sortBy.startsWith('-')) {
          const field = sortBy.substring(1);
          return new Date(b[field] || 0).getTime() - new Date(a[field] || 0).getTime();
        }
        return new Date(a[sortBy] || 0).getTime() - new Date(b[sortBy] || 0).getTime();
      });
    }
    return items;
  }

  // Filter items based on criteria
  filter(collection, criteria) {
    const items = this.data[collection] || [];
    return items.filter(item => {
      return Object.keys(criteria).every(key => item[key] === criteria[key]);
    });
  }

  // Get a single item by ID
  get(collection, id) {
    const items = this.data[collection] || [];
    return items.find(item => item.id === id);
  }

  // Create a new item
  create(collection, data) {
    const items = this.data[collection] || [];
    const newItem = {
      id: this.generateId(),
      created_date: new Date().toISOString(),
      ...data
    };
    items.push(newItem);
    this.notifyListeners(collection, 'create', newItem);
    return newItem;
  }

  // Update an existing item
  update(collection, id, data) {
    const items = this.data[collection] || [];
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...data };
      this.notifyListeners(collection, 'update', items[index]);
      return items[index];
    }
    throw new Error(`Item with id ${id} not found in ${collection}`);
  }

  // Delete an item
  delete(collection, id) {
    const items = this.data[collection] || [];
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      const deletedItem = items.splice(index, 1)[0];
      this.notifyListeners(collection, 'delete', deletedItem);
      return deletedItem;
    }
    throw new Error(`Item with id ${id} not found in ${collection}`);
  }

  // Subscribe to changes (for real-time updates)
  subscribe(collection, callback) {
    if (!this.listeners.has(collection)) {
      this.listeners.set(collection, []);
    }
    this.listeners.get(collection).push(callback);
  }

  // Notify listeners of changes
  notifyListeners(collection, action, item) {
    const callbacks = this.listeners.get(collection) || [];
    callbacks.forEach(callback => callback(action, item));
  }

  // Save data to localStorage (optional persistence)
  saveToLocalStorage() {
    localStorage.setItem('localDatabase', JSON.stringify(this.data));
  }

  // Load data from localStorage (optional persistence)
  loadFromLocalStorage() {
    const saved = localStorage.getItem('localDatabase');
    if (saved) {
      this.data = JSON.parse(saved);
    }
  }
}

// Create singleton instance
const localDb = new LocalDatabase();

// Create entities object that mimics Base44 structure
const entities = {
  Project: {
    list: (sortBy) => localDb.list('projects', sortBy),
    get: (id) => localDb.get('projects', id),
    create: (data) => localDb.create('projects', data),
    update: (id, data) => localDb.update('projects', id, data),
    delete: (id) => localDb.delete('projects', id),
    filter: (criteria) => localDb.filter('projects', criteria)
  },
  Task: {
    list: (sortBy) => localDb.list('tasks', sortBy),
    get: (id) => localDb.get('tasks', id),
    create: (data) => localDb.create('tasks', data),
    update: (id, data) => localDb.update('tasks', id, data),
    delete: (id) => localDb.delete('tasks', id),
    filter: (criteria) => localDb.filter('tasks', criteria)
  },
  TeamMember: {
    list: (sortBy) => localDb.list('team_members', sortBy),
    get: (id) => localDb.get('team_members', id),
    create: (data) => localDb.create('team_members', data),
    update: (id, data) => localDb.update('team_members', id, data),
    delete: (id) => localDb.delete('team_members', id),
    filter: (criteria) => localDb.filter('team_members', criteria)
  },
  User: {
    list: (sortBy) => localDb.list('users', sortBy),
    get: (id) => localDb.get('users', id),
    create: (data) => localDb.create('users', data),
    update: (id, data) => localDb.update('users', id, data),
    delete: (id) => localDb.delete('users', id),
    filter: (criteria) => localDb.filter('users', criteria),
    findByEmail: (email) => {
      const users = localDb.data.users || [];
      return users.find(user => user.email === email);
    },
    authenticate: (email, password) => {
      const users = localDb.data.users || [];
      const user = users.find(user => user.email === email);
      if (user && user.password === password) {
        return { ...user, password: undefined }; // Remove password from response
      }
      return null;
    },
    createPasswordResetToken: (email) => {
      const token = Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour expiry
      localDb.create('passwordResetTokens', {
        email,
        token,
        expiresAt,
        createdAt: new Date().toISOString()
      });
      return token;
    },
    validateResetToken: (token) => {
      const tokens = localDb.data.passwordResetTokens || [];
      const resetToken = tokens.find(t => t.token === token);
      if (!resetToken) return null;
      
      // Check if token is expired
      if (new Date() > new Date(resetToken.expiresAt)) {
        localDb.delete('passwordResetTokens', resetToken.id);
        return null;
      }
      
      return resetToken;
    },
    resetPassword: (token, newPassword) => {
      const tokens = localDb.data.passwordResetTokens || [];
      const resetToken = tokens.find(t => t.token === token);
      if (!resetToken) return false;
      
      // Check if token is expired
      if (new Date() > new Date(resetToken.expiresAt)) {
        localDb.delete('passwordResetTokens', resetToken.id);
        return false;
      }
      
      const users = localDb.data.users || [];
      const user = users.find(u => u.email === resetToken.email);
      if (user) {
        localDb.update('users', user.id, { password: newPassword });
        // Remove the used token
        localDb.delete('passwordResetTokens', resetToken.id);
        return true;
      }
      return false;
    }
  }
};

// Add auth and users objects for compatibility
const auth = {
  updateMe: async (data) => {
    // Mock implementation - in real app this would update user profile
    console.log('Updating user profile:', data);
    return Promise.resolve(data);
  }
};

const users = {
  inviteUser: async (email, role) => {
    // Mock implementation - in real app this would send invitation
    // console.log('Inviting user:', email, 'with role:', role);
    return Promise.resolve({ email, role, status: 'invited' });
  }
};

export const localDatabase = {
  entities,
  db: localDb,
  auth,
  users
};

export default localDatabase;
