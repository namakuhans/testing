// Bot configuration constants
module.exports = {
  // Channel IDs
  MAIN_CHANNEL_ID: process.env.MAIN_CHANNEL_ID,
  BUY_CATEGORY_ID: process.env.BUY_CATEGORY_ID,
  MIDMAN_CATEGORY_ID: process.env.MIDMAN_CATEGORY_ID,
  
  // Role IDs
  SELLER_ROLE_ID: process.env.SELLER_ROLE_ID,
  BUYER_ROLE_ID: process.env.BUYER_ROLE_ID,
  MIDMAN_ROLE_ID: process.env.MIDMAN_ROLE_ID, // This will be "MIDMAN USER" role
  
  // Colors
  COLORS: {
    PRIMARY: 0x5865F2,
    SUCCESS: 0x00FF00,
    ERROR: 0xFF0000,
    WARNING: 0xFFA500,
    WHITE: 0xFFFFFF,
    SECONDARY: 0xFFAA00
  },
  
  // Images
  IMAGES: {
    STORE_OPEN: 'https://cdn.discordapp.com/attachments/1407966960498642965/1410705503692132503/Proyek_Baru_129_F60CEC6.gif',
    STORE_CLOSED: 'https://cdn.discordapp.com/attachments/1407966960498642965/1411040589193154681/imqualtz_1756488678_musicaldown.com.jpg'
  },
  
  // Update intervals
  EMBED_UPDATE_INTERVAL: 5000, // 5 seconds
  
  // Bot intents
  BOT_INTENTS: [
    'Guilds',
    'GuildMessages',
    'GuildMembers',
    'MessageContent',
    'GuildMessageReactions',
    'DirectMessages',
    'GuildIntegrations'
  ]
};
