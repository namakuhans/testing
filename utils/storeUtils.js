const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../database/connection');
const { COLORS, IMAGES, MAIN_CHANNEL_ID } = require('../config/constants');

// Store main message for auto-updates
let mainStoreMessage = null;

async function createMainEmbed() {
  if (!db.getCollection('products') || !db.getCollection('midman')) {
    console.log('⚠️ Database collections not initialized yet');
    return null;
  }
  
  const products = await db.getCollection('products').find({}).toArray();
  const midmanServices = await db.getCollection('midman').find({}).toArray();
  const storeStatus = await db.getConfig('store_status') || 'off';
  
  // Create fields array
  const fields = [];
  
  // Add products fields
  if (products.length > 0) {
    products.forEach(product => {
      fields.push({
        name: `📦 ${product.name}`,
        value: `**Code:** ${product.code}\n**Quantity:** ${product.quantity}\n**Price:** ${product.price}`,
        inline: false
      });
    });
  } else {
    fields.push({ name: '📦 Produk', value: 'Tidak ada produk tersedia', inline: false });
  }
  
  // Add midman services fields
  if (midmanServices.length > 0) {
    midmanServices.forEach(service => {
      fields.push({
        name: `🤝 ${service.nominal}`,
        value: `**Code:** ${service.code}\n**Nominal:** ${service.nominal}\n**Price:** ${service.price}`,
        inline: false
      });
    });
  } else {
    fields.push({ name: '🤝 Layanan Mediasi', value: 'Tidak ada layanan mediasi tersedia', inline: false });
  }
  
  // Add how to buy field
  fields.push({ 
    name: '💡 Cara Pembelian', 
    value: '1. Klik tombol **Buy** untuk membeli produk\n2. Klik tombol **Midman** untuk layanan mediasi\n3. Klik tombol **Payment** untuk melihat metode pembayaran\n4. Klik tombol **Status Toko** untuk melihat status toko', 
    inline: false 
  });
  
  // Create timestamp in GMT+7
  const { createGMT7Timestamp } = require('./dateUtils');
  const footerText = createGMT7Timestamp();
  
  const embed = new EmbedBuilder()
    .setTitle('🏪 AUTOSTORE - Toko Otomatis')
    .setDescription('Selamat datang di Autostore! Pilih layanan yang Anda butuhkan:')
    .addFields(fields)
    .setImage(IMAGES.STORE_OPEN)
    .setColor(COLORS.WHITE)
    .setFooter({ text: footerText })
    .setTimestamp();
  
  return embed;
}

function createMainButtons() {
  return new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('buy_button')
        .setLabel('Buy')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🛒'),
      new ButtonBuilder()
        .setCustomId('midman_button')
        .setLabel('Midman')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🤝'),
      new ButtonBuilder()
        .setCustomId('payment_button')
        .setLabel('Payment')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('💳'),
      new ButtonBuilder()
        .setCustomId('status_button')
        .setLabel('Status Toko')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('📊')
    );
}

async function setupMainEmbed(client) {
  try {
    const channel = await client.channels.fetch(MAIN_CHANNEL_ID);
    if (!channel) {
      console.error('❌ Main channel not found:', MAIN_CHANNEL_ID);
      return;
    }
    
    const embed = await createMainEmbed();
    const buttons = createMainButtons();
    
    mainStoreMessage = await channel.send({ 
      embeds: [embed], 
      components: [buttons] 
    });
    
    await db.setConfig('main_store_message_id', mainStoreMessage.id);
    await db.setConfig('main_store_channel_id', MAIN_CHANNEL_ID);
    
    console.log('✅ Main embed sent to channel:', channel.name);
    console.log('📍 Message ID:', mainStoreMessage.id);
  } catch (error) {
    console.error('❌ Error setting up main embed:', error);
  }
}

async function updateMainEmbed(client) {
  try {
    if (!mainStoreMessage) {
      const messageId = await db.getConfig('main_store_message_id');
      const channelId = await db.getConfig('main_store_channel_id');
      
      if (messageId && channelId) {
        try {
          const channel = await client.channels.fetch(channelId);
          mainStoreMessage = await channel.messages.fetch(messageId);
        } catch (fetchError) {
          console.log('📍 Message not found, creating new main embed...');
          await setupMainEmbed(client);
          return;
        }
      }
    }
    
    if (mainStoreMessage) {
      const embed = await createMainEmbed();
      const buttons = createMainButtons();
      
      await mainStoreMessage.edit({ 
        embeds: [embed], 
        components: [buttons] 
      });
      
      console.log('🔄 Main embed updated at:', new Date().toLocaleTimeString());
    }
  } catch (error) {
    console.error('❌ Error updating main embed:', error);
    mainStoreMessage = null;
    console.log('🔄 Creating new main embed...');
    await setupMainEmbed(client);
  }
}

async function updateMainStoreEmbed(client) {
  const storeChannelId = await db.getConfig('store_channel');
  const storeMessageId = await db.getConfig('store_message');
  
  if (storeChannelId && storeMessageId) {
    const storeChannel = client.channels.cache.get(storeChannelId);
    if (storeChannel) {
      try {
        const storeMessage = await storeChannel.messages.fetch(storeMessageId);
        const embed = await createMainEmbed();
        const buttons = createMainButtons();
        
        await storeMessage.edit({ embeds: [embed], components: [buttons] });
      } catch (error) {
        console.error('Error updating store embed:', error);
      }
    }
  }
}

module.exports = {
  createMainEmbed,
  createMainButtons,
  setupMainEmbed,
  updateMainEmbed,
  updateMainStoreEmbed
};
