const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');
const db = require('../../database/connection');
const { BUY_CATEGORY_ID, MIDMAN_CATEGORY_ID, SELLER_ROLE_ID, COLORS } = require('../../config/constants');

async function findUserInGuild(guild, searchTerm) {
  let targetMember = null;
  
  try {
    // Clean search term
    const cleanSearchTerm = searchTerm.trim();
    
    // Check if it's a mention format <@userID>
    if (cleanSearchTerm.includes('<@') && cleanSearchTerm.includes('>')) {
      const userId = cleanSearchTerm.replace(/[<@!>]/g, '').trim();
      if (!isNaN(userId)) {
        targetMember = await guild.members.fetch(userId).catch(() => null);
      }
    }
    
    // Check if it's a direct user ID
    if (!targetMember && !isNaN(cleanSearchTerm) && cleanSearchTerm.length >= 17) {
      targetMember = await guild.members.fetch(cleanSearchTerm).catch(() => null);
    }
    
    // If not found, search by username/displayname
    if (!targetMember) {
      // Search in cached members first
      targetMember = guild.members.cache.find(member => 
        member.user.username.toLowerCase() === cleanSearchTerm.toLowerCase() ||
        member.displayName.toLowerCase() === cleanSearchTerm.toLowerCase() ||
        member.user.tag.toLowerCase() === cleanSearchTerm.toLowerCase() ||
        member.user.globalName?.toLowerCase() === cleanSearchTerm.toLowerCase()
      );
      
      // If still not found, fetch all members and search
      if (!targetMember) {
        try {
          await guild.members.fetch({ limit: 1000, time: 5000 }); // 5 second timeout
        } catch (fetchError) {
          console.log('Could not fetch all members, searching in cache only:', fetchError.message);
        }
        targetMember = guild.members.cache.find(member => 
          member.user.username.toLowerCase() === cleanSearchTerm.toLowerCase() ||
          member.displayName.toLowerCase() === cleanSearchTerm.toLowerCase() ||
          member.user.tag.toLowerCase() === cleanSearchTerm.toLowerCase() ||
          member.user.globalName?.toLowerCase() === cleanSearchTerm.toLowerCase()
        );
      }
    }
  } catch (error) {
    console.log('Error searching for user:', error.message);
  }
  
  return targetMember;
}

async function createTicketChannel(guild, channelName, categoryId, allowedUserIds = []) {
  try {
    console.log(`🎫 Creating ticket channel: ${channelName}`);
    console.log(`📁 Category ID: ${categoryId}`);
    console.log(`👥 Allowed users: ${allowedUserIds.join(', ')}`);
    
    // Force fetch all channels first
    try {
      await guild.channels.fetch();
      console.log(`🔄 Channels fetched for ticket creation. Cache size: ${guild.channels.cache.size}`);
    } catch (fetchError) {
      console.error('❌ Error fetching channels for ticket creation:', fetchError);
    }
    
    // First try to get from cache
    let ticketCategory = guild.channels.cache.get(categoryId);
    
    console.log(`🔍 Looking for category ${categoryId} in cache...`);
    console.log(`📋 Available categories in cache:`);
    guild.channels.cache.filter(ch => ch.type === 4).forEach(category => {
      console.log(`  - ${category.name} (ID: ${category.id})`);
    });
    
    if (!ticketCategory) {
      console.log('⚠️ Category not found in cache, trying to fetch from API...');
      try {
        const fetchedCategory = await guild.channels.fetch(categoryId);
        if (fetchedCategory && fetchedCategory.type === 4) {
          ticketCategory = fetchedCategory;
          console.log('✅ Category found via API fetch:', ticketCategory.name);
        } else {
          console.error('❌ Fetched channel is not a category:', fetchedCategory?.type);
          return null;
        }
      } catch (fetchError) {
        console.error('❌ Failed to fetch category from API:', fetchError.message);
        return null;
      }
    } else {
      console.log('✅ Category found in cache:', ticketCategory.name);
    }
    
    if (!ticketCategory) {
      console.error('❌ Category still not found after all attempts');
      return null;
    }
    
    // Prepare permission overwrites
    const permissionOverwrites = [
      {
        id: guild.roles.everyone.id,
        deny: [PermissionFlagsBits.ViewChannel],
      }
    ];
    
    // Add permissions for allowed users
    allowedUserIds.forEach(userId => {
      permissionOverwrites.push({
        id: userId,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
      });
    });
    
    console.log('🔧 Creating channel with permissions...');
    const ticketChannel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: categoryId,
      permissionOverwrites: permissionOverwrites,
    });
    
    console.log('✅ Ticket channel created successfully:', ticketChannel.name, 'ID:', ticketChannel.id);
    return ticketChannel;
  } catch (error) {
    console.error('❌ Error creating ticket channel:', error.message);
    console.error('Full error:', error);
    return null;
  }
}

async function handleBuyModal(interaction) {
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
  
  // Force fetch guild channels to ensure cache is populated
  try {
    await interaction.guild.channels.fetch();
    console.log(`🔄 Guild channels fetched. Cache size: ${interaction.guild.channels.cache.size}`);
  } catch (fetchError) {
    console.error('❌ Error fetching guild channels:', fetchError);
  }
  
  console.log(`🎫 Creating buy ticket for user: ${interaction.user.username}`);
  console.log(`📁 Using category ID: ${BUY_CATEGORY_ID}`);
  
  // Create ticket channel
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
  
  await createBuyTicketEmbed(interaction, product, quantity, totalPrice, ticketChannel);
}

async function createBuyTicketEmbed(interaction, product, quantity, totalPrice, ticketChannel) {
  // Get seller role for display
  const sellerRole = interaction.guild.roles.cache.get(SELLER_ROLE_ID);
  const sellerDisplay = sellerRole ? sellerRole.toString() : 'Seller tidak ditemukan';
  
  const embed = new EmbedBuilder()
    .setTitle('🛒 DETAIL OF PURCHASE MADE!')
    .addFields(
      { name: 'Product Name', value: product.name, inline: true },
      { name: 'Quantity of Product', value: quantity.toString(), inline: true },
      { name: 'Total Price', value: `Rp ${totalPrice.toLocaleString()}`, inline: true },
      { name: 'Buyer Name', value: interaction.user.username, inline: true }
    )
    .setColor(COLORS.SUCCESS)
    .setTimestamp();
  
  const buttons = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('payment_button')
        .setLabel('Payment')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('💳'),
      new ButtonBuilder()
        .setCustomId('call_seller')
        .setLabel('Call Seller')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📞'),
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
    .setTitle('🤝 DETAIL OF MID-MAN MADE!')
    .addFields(
      { name: 'First Party', value: `<@${interaction.user.id}>`, inline: true },
      { name: 'Second Party', value: `<@${secondPartyMember.id}>`, inline: true },
      { name: 'Nominal Value', value: transactionAmount, inline: false },
      { name: 'Details', value: transactionDetails, inline: false }
    )
    .setColor(COLORS.SUCCESS)
    .setTimestamp();
  
  const buttons = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('payment_button')
        .setLabel('Payment')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('💳'),
      new ButtonBuilder()
        .setCustomId('call_seller')
        .setLabel('Call Seller')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📞'),
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