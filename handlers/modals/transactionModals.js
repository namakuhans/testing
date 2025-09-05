const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');
const db = require('../../database/connection');
const { BUY_CATEGORY_ID, MIDMAN_CATEGORY_ID, SELLER_ROLE_ID, COLORS } = require('../../config/constants');
const { findUserInGuild } = require('../../utils/userUtils');

async function handleBuyModal(interaction) {
  // Force fetch guild channels to ensure cache is populated
  try {
    await interaction.guild.channels.fetch();
    console.log(`🔄 Guild channels fetched. Cache size: ${interaction.guild.channels.cache.size}`);
  } catch (fetchError) {
    console.error('❌ Error fetching guild channels:', fetchError);
  }
  
  const productName = interaction.fields.getTextInputValue('product_name');
  const quantity = parseInt(interaction.fields.getTextInputValue('product_quantity'));
  
  // Validate quantity
  if (isNaN(quantity) || quantity <= 0) {
    return interaction.reply({ 
      content: 'Quantity harus berupa angka yang valid dan lebih dari 0!', 
      ephemeral: true 
    });
  }
  
  // Find product
  const product = await db.getCollection('products').findOne({ 
    name: { $regex: new RegExp(`^${productName}$`, 'i') }
  });
  
  if (!product) {
    const availableProducts = await db.getCollection('products').find({}).toArray();
    const productList = availableProducts.length > 0 
      ? availableProducts.map(p => `• ${p.name}`).join('\n')
      : 'Tidak ada produk tersedia';
    
    return interaction.reply({ 
      content: `Produk "${productName}" tidak ditemukan!\n\n**Produk yang tersedia:**\n${productList}`, 
      ephemeral: true 
    });
  }
  
  // Check stock
  if (quantity > product.quantity) {
    return interaction.reply({ 
      content: `Stok tidak mencukupi! Stok tersedia: ${product.quantity}, Anda meminta: ${quantity}`, 
      ephemeral: true 
    });
  }
  
  // Calculate total price
  const unitPrice = parseInt(product.price.replace(/[^\d]/g, ''));
  const totalPrice = unitPrice * quantity;
  
  // Create ticket channel
  const { createTicketChannel } = require('../../utils/ticketUtils');
  
  // Get category channel
  console.log(`🎫 Creating buy ticket for user: ${interaction.user.username}`);
  console.log(`📁 Using category ID: ${BUY_CATEGORY_ID}`);
  
  // Create ticket channel directly
  const ticketChannel = await createTicketChannel(
    interaction.guild, 
    `ticket-buy-${interaction.user.username}-${Date.now()}`,
    BUY_CATEGORY_ID,
    [interaction.user.id]
  );
  
  if (!ticketChannel) {
    return interaction.reply({ 
      content: `❌ Gagal membuat tiket buy!\n\n**Kemungkinan masalah:**\n• Kategori ID: ${BUY_CATEGORY_ID}\n• Bot tidak memiliki permission\n• Kategori tidak ada\n\nHubungi administrator.`, 
      ephemeral: true 
    });
  }
  
  await createBuyTicketEmbed(interaction, product, quantity, ticketChannel);
}

async function createBuyTicketEmbed(interaction, product, quantity, ticketChannel) {
  // Get seller role for display
  const sellerRole = interaction.guild.roles.cache.get(SELLER_ROLE_ID);
  const sellerDisplay = sellerRole ? sellerRole.toString() : 'Seller tidak ditemukan';
  
  const embed = new EmbedBuilder()
    .setTitle('🛒 PURCHASE TRANSACTION DETAILS')
    .addFields(
      { name: 'Product Name', value: product.name, inline: true },
      { name: 'Quantity Purchased', value: quantity.toString(), inline: true },
      { name: 'Total Price', value: `Rp ${totalPrice.toLocaleString()}`, inline: true },
      { name: 'Buyer', value: interaction.user.toString(), inline: true },
      { name: 'Seller', value: sellerDisplay, inline: true }
    )
    .setColor(COLORS.SUCCESS)
    .setTimestamp();
  
  const buttons = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('call_seller')
        .setLabel('Call Seller')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📞'),
      new ButtonBuilder()
        .setCustomId('payment_button')
        .setLabel('Payment')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('💳'),
      new ButtonBuilder()
        .setCustomId('close_ticket')
        .setLabel('Close')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('❌')
    );
  
  const tagMessage = `<@${interaction.user.id}> <@&${SELLER_ROLE_ID}>`;
  await ticketChannel.send({ content: tagMessage, embeds: [embed], components: [buttons] });
  
  await interaction.reply({ 
    content: `Tiket pembelian Anda telah dibuat: ${ticketChannel.toString()}`, 
    ephemeral: true 
  });
}

async function handleMidmanModal(interaction) {
  const transactionUser = interaction.fields.getTextInputValue('transaction_user');
  const transactionAmount = interaction.fields.getTextInputValue('transaction_amount');
  const transactionDetails = interaction.fields.getTextInputValue('transaction_details') || 'Tidak ada detail tambahan';
  
  // Defer reply to prevent timeout
  await interaction.deferReply({ ephemeral: true });
  
  // Force fetch guild channels to ensure cache is populated
  try {
    await interaction.guild.channels.fetch();
    console.log(`🔄 Guild channels fetched for midman. Cache size: ${interaction.guild.channels.cache.size}`);
  } catch (fetchError) {
    console.error('❌ Error fetching guild channels for midman:', fetchError);
  }
  
  // Find second party user
  const secondPartyMember = await findUserInGuild(interaction.guild, transactionUser);
  
  if (!secondPartyMember) {
    return interaction.editReply({ 
      content: `❌ User "${transactionUser}" tidak ditemukan di server ini!\n\n**Tips pencarian:**\n• Gunakan username lengkap (contoh: username123)\n• Gunakan display name\n• Gunakan mention (<@userid>)\n• Pastikan user masih ada di server`
    });
  }
  
  console.log(`🎫 Creating midman ticket for users: ${interaction.user.username} & ${secondPartyMember.user.username}`);
  console.log(`📁 Using category ID: ${MIDMAN_CATEGORY_ID}`);
  
  // Create ticket channel
  const ticketChannel = await createTicketChannel(
    interaction.guild,
    `ticket-midman-${interaction.user.username}-${Date.now()}`,
    MIDMAN_CATEGORY_ID,
    [interaction.user.id, secondPartyMember.id]
  );
  
  if (!ticketChannel) {
    return interaction.editReply({ 
      content: `❌ Gagal membuat tiket midman!\n\n**Kemungkinan masalah:**\n• Kategori ID: ${MIDMAN_CATEGORY_ID}\n• Bot tidak memiliki permission\n• User tidak valid\n\nHubungi administrator.`
    });
  }
  
  await createMidmanTicketEmbed(interaction, secondPartyMember, transactionAmount, transactionDetails, ticketChannel);
}

async function createMidmanTicketEmbed(interaction, secondPartyMember, transactionAmount, transactionDetails, ticketChannel) {
  const embed = new EmbedBuilder()
    .setTitle('🤝 MIDMAN SERVICE TRANSACTION DETAILS')
    .addFields(
      { name: 'Nominal Transaction', value: transactionAmount, inline: true },
      { name: 'First Party Username', value: interaction.user.toString(), inline: true },
      { name: 'Second Party Username', value: secondPartyMember.toString(), inline: true },
      { name: 'Details', value: transactionDetails, inline: false }
    )
    .setColor(COLORS.SUCCESS)
    .setTimestamp();
  
  const buttons = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('call_seller')
        .setLabel('Call Seller')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📞'),
      new ButtonBuilder()
        .setCustomId('payment_button')
        .setLabel('Payment')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('💳'),
      new ButtonBuilder()
        .setCustomId('close_ticket')
        .setLabel('Close')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('❌')
    );
  
  const tagMessage = `<@${interaction.user.id}> <@${secondPartyMember.id}> <@&${SELLER_ROLE_ID}>`;
  await ticketChannel.send({ content: tagMessage, embeds: [embed], components: [buttons] });
  
  await interaction.editReply({ 
    content: `✅ Tiket mediasi Anda telah dibuat: ${ticketChannel.toString()}\n✅ ${secondPartyMember.user.tag} telah ditambahkan ke channel.`
  });
}

module.exports = {
  handleBuyModal,
  handleMidmanModal
};
