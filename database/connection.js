const { MongoClient } = require('mongodb');

class DatabaseManager {
  constructor() {
    this.client = null;
    this.db = null;
    this.collections = {};
    this.connected = false;
  }

  async connect() {
    try {
      console.log('🔌 Connecting to MongoDB...');
      this.client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
      await this.client.connect();
      this.db = this.client.db('autostore_bot');
      
      // Initialize collections
      this.collections = {
        products: this.db.collection('products'),
        midman: this.db.collection('midman'),
        payments: this.db.collection('payments'),
        reputation: this.db.collection('reputation'),
        config: this.db.collection('config'),
        reports: this.db.collection('reports')
      };
      
      this.connected = true;
      console.log('✅ Connected to MongoDB and collections initialized');
      return true;
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      this.connected = false;
      return false;
    }
  }

  async getConfig(key) {
    if (!this.collections.config) {
      console.log('⚠️ Config collection not initialized yet');
      return null;
    }
    const config = await this.collections.config.findOne({ key });
    return config ? config.value : null;
  }

  async setConfig(key, value) {
    if (!this.collections.config) {
      console.log('⚠️ Config collection not initialized yet');
      return;
    }
    await this.collections.config.updateOne(
      { key },
      { $set: { key, value } },
      { upsert: true }
    );
  }

  getCollection(name) {
    return this.collections[name];
  }

  isConnected() {
    return this.connected;
  }

  async close() {
    if (this.client) {
      await this.client.close();
      this.connected = false;
      console.log('🔌 MongoDB connection closed');
    }
  }
}

module.exports = new DatabaseManager();