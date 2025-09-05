const { EmbedBuilder } = require('discord.js');
const db = require('../../database/connection');
const { COLORS, IMAGES } = require('../../config/constants');
const { logProductAdd, logProductEdit, logProductRemove, logMidmanAdd, logMidmanEdit, logMidmanRemove } = require('../../utils/logging');
const { updateMainEmbed } = require('../../utils/storeUtils');

async function handleAddProduct(interaction) {
  const code = interaction.options.getString('code');
  const name = interaction.options.getString('name');
  const quantity = interaction.options.getInteger('quantity');
  const price = interaction.options.getString('price');
  
  const existingProduct = await db.getCollection('products').findOne({ code });
  if (existingProduct) {
    return interaction.reply({ content: `Product with code "${code}" already exists!`, ephemeral: true });
  }
  
  const newProduct = {
    code: code,
    name: name,
    quantity: quantity,
    price: price,
    createdBy: interaction.user.id,
    createdAt: new Date()
  };
  
  await db.getCollection('products').insertOne(newProduct);
  
  // Send log to product log channel
  await logProductAdd(interaction, newProduct);
  
  await interaction.reply({ content: `Product "${name}" with code "${code}" has been added successfully!`, ephemeral: true });
}

async function handleEditProduct(interaction) {
  const code = interaction.options.getString('code');
  const newName = interaction.options.getString('newname');
  const newQuantity = interaction.options.getInteger('newquantity');
  const newPrice = interaction.options.getString('newprice');
  
  const product = await db.getCollection('products').findOne({ code });
  if (!product) {
    return interaction.reply({ content: `Product with code "${code}" not found!`, ephemeral: true });
  }
  
  // Store original values for logging
  const originalProduct = { ...product };
  
  const updateData = {};
  const changes = [];
  
  if (newName) {
    updateData.name = newName;
    changes.push(`**Name:** ${originalProduct.name} → ${newName}`);
  }
  if (newQuantity !== null && newQuantity !== undefined) {
    updateData.quantity = newQuantity;
    changes.push(`**Quantity:** ${originalProduct.quantity} → ${newQuantity}`);
  }
  if (newPrice) {
    updateData.price = newPrice;
    changes.push(`**Price:** ${originalProduct.price} → ${newPrice}`);
  }
  updateData.updatedAt = new Date();
  
  await db.getCollection('products').updateOne({ code }, { $set: updateData });
  
  // Send log to product log channel
  await logProductEdit(interaction, originalProduct, changes);
  
  await interaction.reply({ content: `Product "${code}" has been updated successfully!`, ephemeral: true });
}

async function handleRemoveProduct(interaction) {
  const code = interaction.options.getString('code');
  
  // Get product info before deletion for logging
  const product = await db.getCollection('products').findOne({ code });
  if (!product) {
    return interaction.reply({ content: `Product with code "${code}" not found!`, ephemeral: true });
  }
  
  const result = await db.getCollection('products').deleteOne({ code });
  if (result.deletedCount === 0) {
    return interaction.reply({ content: `Product with code "${code}" not found!`, ephemeral: true });
  }
  
  // Log product removal
  await logProductRemove(interaction, product);
  
  await interaction.reply({ content: `Product "${code}" has been removed successfully!`, ephemeral: true });
}

async function handleAddMidman(interaction) {
  const code = interaction.options.getString('code');
  const nominal = interaction.options.getString('nominal');
  const price = interaction.options.getString('price');
  
  const existingService = await db.getCollection('midman').findOne({ code });
  if (existingService) {
    return interaction.reply({ content: `Mediation service with code "${code}" already exists!`, ephemeral: true });
  }
  
  const newService = {
    code: code,
    nominal: nominal,
    price: price,
    createdBy: interaction.user.id,
    createdAt: new Date()
  };
  
  await db.getCollection('midman').insertOne(newService);
  
  // Log midman service addition
  await logMidmanAdd(interaction, newService);
  
  await interaction.reply({ content: `Mediation service "${code}" has been added successfully!`, ephemeral: true });
}

async function handleEditMidman(interaction) {
  const code = interaction.options.getString('code');
  const newNominal = interaction.options.getString('nominal');
  const newPrice = interaction.options.getString('price');
  
  const service = await db.getCollection('midman').findOne({ code });
  if (!service) {
    return interaction.reply({ content: `Mediation service with code "${code}" not found!`, ephemeral: true });
  }
  
  // Store original values for logging
  const originalService = { ...service };
  
  const updateData = {};
  const changes = [];
  
  if (newNominal) updateData.nominal = newNominal;
  if (newPrice) updateData.price = newPrice;
  updateData.updatedAt = new Date();
  
  if (newNominal) {
    changes.push(`**Nominal:** ${originalService.nominal} → ${newNominal}`);
  }
  if (newPrice) {
    changes.push(`**Price:** ${originalService.price} → ${newPrice}`);
  }
  
  await db.getCollection('midman').updateOne({ code }, { $set: updateData });
  
  // Log midman service edit
  await logMidmanEdit(interaction, originalService, changes);
  
  await interaction.reply({ content: `Mediation service "${code}" has been updated successfully!`, ephemeral: true });
}

async function handleRemoveMidman(interaction) {
  const code = interaction.options.getString('code');
  
  // Get service info before deletion for logging
  const service = await db.getCollection('midman').findOne({ code });
  if (!service) {
    return interaction.reply({ content: `Mediation service with code "${code}" not found!`, ephemeral: true });
  }
  
  const result = await db.getCollection('midman').deleteOne({ code });
  if (result.deletedCount === 0) {
    return interaction.reply({ content: `Mediation service with code "${code}" not found!`, ephemeral: true });
  }
  
  // Log midman service removal
  await logMidmanRemove(interaction, service);
  
  await interaction.reply({ content: `Mediation service "${code}" has been removed successfully!`, ephemeral: true });
}

async function handleStore(interaction) {
  const status = interaction.options.getString('status');
  
  await db.setConfig('store_status', status);
  
  // Create embed with different images for open/close
  let embed;
  
  if (status === 'on') {
    embed = new EmbedBuilder()
      .setTitle('🚀 STORE IS OPEN!')
      .setDescription('Toko sedang buka! Silakan berbelanja dengan tenang.')
      .setColor(COLORS.SUCCESS)
      .setImage(IMAGES.STORE_OPEN)
      .setTimestamp();
  } else {
    embed = new EmbedBuilder()
      .setTitle('🚪 STORE IS CLOSE!')
      .setDescription('Toko sedang tutup. Silakan kembali lagi nanti.')
      .setColor(COLORS.ERROR)
      .setImage(IMAGES.STORE_CLOSED)
      .setTimestamp();
  }
  
  // Send @everyone message with embed (not ephemeral)
  await interaction.reply({ content: '@everyone', embeds: [embed] });
}

async function handleAddPayment(interaction) {
  const name = interaction.options.getString('name');
  const attribute = interaction.options.getString('attribute');
  
  await db.getCollection('payments').insertOne({
    name: name,
    attribute: attribute,
    createdBy: interaction.user.id,
    createdAt: new Date()
  });
  
  await interaction.reply({ content: `Payment method "${name}" has been added successfully!`, ephemeral: true });
}

async function handleRemovePayment(interaction) {
  const name = interaction.options.getString('name');
  
  const result = await db.getCollection('payments').deleteOne({ name });
  if (result.deletedCount === 0) {
    return interaction.reply({ content: `Payment method "${name}" not found!`, ephemeral: true });
  }
  
  await interaction.reply({ content: `Payment method "${name}" has been removed successfully!`, ephemeral: true });
}

async function handleDoneBuy(interaction) {
  if (!interaction.channel.name.includes('ticket-buy')) {
    return interaction.reply({ content: 'This command can only be used in ticket buy channels!', ephemeral: true });
  }
  
  const { sendThankYouMessages } = require('../../utils/ticketUtils');
  await sendThankYouMessages(interaction, 'Pembelian Produk');
  
  await interaction.reply({ content: 'Purchase completed successfully! Thank you messages have been sent.', ephemeral: true });
}

async function handleDoneMM(interaction) {
  if (!interaction.channel.name.includes('ticket-midman')) {
    return interaction.reply({ content: 'This command can only be used in ticket midman channels!', ephemeral: true });
  }
  
  const user1 = interaction.options.getUser('user1');
  const user2 = interaction.options.getUser('user2');
  
  const member1 = interaction.guild.members.cache.get(user1.id);
  const member2 = interaction.guild.members.cache.get(user2.id);
  
  const { sendThankYouMessages } = require('../../utils/ticketUtils');
  await sendThankYouMessages(interaction, 'Layanan Mediasi', [member1, member2]);
  
  await interaction.reply({ content: 'Mediation completed successfully! Thank you messages have been sent.', ephemeral: true });
}

module.exports = {
  handleAddProduct,
  handleEditProduct,
  handleRemoveProduct,
  handleAddMidman,
  handleEditMidman,
  handleRemoveMidman,
  handleStore,
  handleAddPayment,
  handleRemovePayment,
  handleDoneBuy,
  handleDoneMM
};
