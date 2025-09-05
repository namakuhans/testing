require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers
  ]
});

client.once('ready', async () => {
  console.log(`🎉 Logged in as ${client.user.tag}!`);
  
  const guild = client.guilds.cache.first();
  if (!guild) {
    console.log('❌ No guild found');
    return;
  }
  
  console.log(`🏠 Guild: ${guild.name} (${guild.id})`);
  console.log(`🤖 Bot permissions in guild:`, guild.members.me.permissions.toArray());
  
  // Check specific categories
  const buyId = process.env.BUY_CATEGORY_ID;
  const midmanId = process.env.MIDMAN_CATEGORY_ID;
  
  console.log('\n📁 Checking categories...');
  console.log(`🛒 Looking for Buy Category ID: ${buyId}`);
  console.log(`🤝 Looking for Midman Category ID: ${midmanId}`);
  
  // Try to fetch categories
  try {
    const buyCategory = await guild.channels.fetch(buyId);
    console.log(`✅ Buy Category found: ${buyCategory.name} (Type: ${buyCategory.type})`);
    
    // Check bot permissions in category
    const botPermissions = buyCategory.permissionsFor(guild.members.me);
    console.log(`🔑 Bot permissions in buy category:`, botPermissions.toArray());
  } catch (error) {
    console.log(`❌ Buy Category not found: ${error.message}`);
  }
  
  try {
    const midmanCategory = await guild.channels.fetch(midmanId);
    console.log(`✅ Midman Category found: ${midmanCategory.name} (Type: ${midmanCategory.type})`);
    
    // Check bot permissions in category
    const botPermissions = midmanCategory.permissionsFor(guild.members.me);
    console.log(`🔑 Bot permissions in midman category:`, botPermissions.toArray());
  } catch (error) {
    console.log(`❌ Midman Category not found: ${error.message}`);
  }
  
  console.log('\n📋 All categories in server:');
  guild.channels.cache.filter(ch => ch.type === 4).forEach(category => {
    console.log(`  - ${category.name} (ID: ${category.id})`);
  });
  
  console.log('\n📋 All channels in server:');
  guild.channels.cache.forEach(channel => {
    const type = channel.type === 0 ? 'Text' : 
                 channel.type === 2 ? 'Voice' : 
                 channel.type === 4 ? 'Category' : 
                 channel.type === 5 ? 'News' : 
                 channel.type === 13 ? 'Stage' : 
                 channel.type === 15 ? 'Forum' : 'Unknown';
    console.log(`  - ${channel.name} (${type}) - ID: ${channel.id}`);
  });
  
  process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
