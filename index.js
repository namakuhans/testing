require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const db = require('./database/connection');
const commands = require('./commands');
const { handleSlashCommand } = require('./handlers/commandHandler');
const { handleButtonInteraction } = require('./handlers/buttonHandler');
const { handleModalInteraction } = require('./handlers/modalHandler');
const { setupMainEmbed, updateMainEmbed } = require('./utils/storeUtils');
const { BOT_INTENTS, EMBED_UPDATE_INTERVAL } = require('./config/constants');

// Initialize Discord client with all required intents
const client = new Client({
  intents: Object.values(GatewayIntentBits).filter(intent => 
    BOT_INTENTS.includes(intent.name)
  )
});

// Initialize commands collection
client.commands = new Collection();

// Main bot ready event
client.once('ready', async () => {
  console.log(`🎉 Logged in as ${client.user.tag}!`);
  
  // Debug: Check guild and channels
  const guild = client.guilds.cache.first();
  if (guild) {
    console.log(`🏠 Connected to guild: ${guild.name} (${guild.id})`);
    console.log(`📊 Total channels: ${guild.channels.cache.size}`);
    
    // Force fetch all channels to ensure cache is populated
    try {
      console.log('🔄 Fetching all guild channels...');
      await guild.channels.fetch();
      console.log(`✅ Channels fetched. Cache size: ${guild.channels.cache.size}`);
    } catch (fetchError) {
      console.error('❌ Error fetching channels:', fetchError);
    }
    
    // Check specific categories
    const buyCategory = guild.channels.cache.get(process.env.BUY_CATEGORY_ID);
    const midmanCategory = guild.channels.cache.get(process.env.MIDMAN_CATEGORY_ID);
    
    console.log(`🛒 Buy Category (${process.env.BUY_CATEGORY_ID}):`, buyCategory ? `✅ ${buyCategory.name}` : '❌ Not found');
    console.log(`🤝 Midman Category (${process.env.MIDMAN_CATEGORY_ID}):`, midmanCategory ? `✅ ${midmanCategory.name}` : '❌ Not found');
    
    // List all categories
    console.log('📁 Available categories:');
    guild.channels.cache.filter(ch => ch.type === 4).forEach(category => {
      console.log(`  - ${category.name} (ID: ${category.id})`);
    });
  }
  
  // Connect to database first
  const dbSuccess = await db.connect();
  if (!dbSuccess) {
    console.error('❌ Failed to connect to database. Bot will not function properly.');
    return;
  }
  
  // Register slash commands
  try {
    console.log('🔄 Registering slash commands...');
    await client.application.commands.set(commands);
    console.log('✅ Successfully registered slash commands.');
  } catch (error) {
    console.error('❌ Error registering commands:', error);
  }
  
  // Setup main embed
  await setupMainEmbed(client);
  
  // Start auto-update interval
  if (db.isConnected()) {
    setInterval(() => updateMainEmbed(client), EMBED_UPDATE_INTERVAL);
    console.log('✅ Auto-update started: Main embed will update every 5 seconds');
  }
});

// Event listeners
client.on('interactionCreate', handleSlashCommand);
client.on('interactionCreate', handleButtonInteraction);
client.on('interactionCreate', handleModalInteraction);

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Shutting down bot gracefully...');
  await db.close();
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Shutting down bot gracefully...');
  await db.close();
  client.destroy();
  process.exit(0);
});

// Login to Discord
console.log('🚀 Starting AutoStore Discord Bot...');

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('❌ DISCORD_TOKEN not found in environment variables!');
  console.log('Please create a .env file with your Discord bot token.');
  process.exit(1);
}

client.login(token).then(() => {
  console.log('🎉 AutoStore Bot connected successfully!');
}).catch(error => {
  console.error('❌ Login failed:', error.message);
  process.exit(1);
});
