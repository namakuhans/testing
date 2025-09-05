const { EmbedBuilder } = require('discord.js');
const db = require('../database/connection');
const { COLORS, IMAGES } = require('../config/constants');

async function logProductAdd(interaction, product) {
  const productLogChannelId = await db.getConfig('product_log_channel');
  if (!productLogChannelId) return;
  
  const logChannel = interaction.client.channels.cache.get(productLogChannelId);
  if (!logChannel) return;
  
  const embed = new EmbedBuilder()
    .setTitle('➕ Product Added')
    .setDescription('Produk baru telah ditambahkan ke toko.')
    .addFields(
      { name: 'Name', value: product.name, inline: true },
      { name: 'Code', value: product.code, inline: true },
      { name: 'Quantity', value: product.quantity.toString(), inline: true },
      { name: 'Price', value: product.price, inline: true },
      { name: 'Added by', value: `<@${interaction.user.id}>`, inline: true },
      { name: 'Date', value: product.createdAt.toLocaleString(), inline: true }
    )
    .setColor(COLORS.SUCCESS)
    .setImage(IMAGES.STORE_OPEN)
    .setTimestamp();
  
  await logChannel.send({ embeds: [embed] });
}

async function logProductEdit(interaction, originalProduct, changes) {
  const productLogChannelId = await db.getConfig('product_log_channel');
  if (!productLogChannelId || changes.length === 0) return;
  
  const logChannel = interaction.client.channels.cache.get(productLogChannelId);
  if (!logChannel) return;
  
  const embed = new EmbedBuilder()
    .setTitle('📝 Product Edited')
    .setDescription('Produk telah diubah di toko.')
    .addFields(
      { name: 'Product Code', value: originalProduct.code, inline: true },
      { name: 'Original Name', value: originalProduct.name, inline: true },
      { name: 'Edited by', value: `<@${interaction.user.id}>`, inline: true },
      { name: 'Changes Made', value: changes.join('\n'), inline: false }
    )
    .setColor(COLORS.WARNING)
    .setImage(IMAGES.STORE_OPEN)
    .setTimestamp();
  
  await logChannel.send({ embeds: [embed] });
}

async function logProductRemove(interaction, product) {
  const productLogChannelId = await db.getConfig('product_log_channel');
  if (!productLogChannelId) return;
  
  const logChannel = interaction.client.channels.cache.get(productLogChannelId);
  if (!logChannel) return;
  
  const embed = new EmbedBuilder()
    .setTitle('🗑️ Product Removed')
    .setDescription('Produk telah dihapus dari toko.')
    .addFields(
      { name: 'Name', value: product.name, inline: true },
      { name: 'Code', value: product.code, inline: true },
      { name: 'Quantity', value: product.quantity.toString(), inline: true },
      { name: 'Price', value: product.price, inline: true },
      { name: 'Removed by', value: `<@${interaction.user.id}>`, inline: true }
    )
    .setColor(COLORS.ERROR)
    .setImage(IMAGES.STORE_OPEN)
    .setTimestamp();
  
  await logChannel.send({ embeds: [embed] });
}

async function logMidmanAdd(interaction, service) {
  const productLogChannelId = await db.getConfig('product_log_channel');
  if (!productLogChannelId) return;
  
  const logChannel = interaction.client.channels.cache.get(productLogChannelId);
  if (!logChannel) return;
  
  const embed = new EmbedBuilder()
    .setTitle('➕ Midman Service Added')
    .setDescription('Layanan mediasi baru telah ditambahkan.')
    .addFields(
      { name: 'Code', value: service.code, inline: true },
      { name: 'Nominal', value: service.nominal, inline: true },
      { name: 'Price', value: service.price, inline: true },
      { name: 'Added by', value: `<@${interaction.user.id}>`, inline: true },
      { name: 'Date', value: service.createdAt.toLocaleString(), inline: true }
    )
    .setColor(COLORS.SUCCESS)
    .setImage(IMAGES.STORE_OPEN)
    .setTimestamp();
  
  await logChannel.send({ embeds: [embed] });
}

async function logMidmanEdit(interaction, originalService, changes) {
  const productLogChannelId = await db.getConfig('product_log_channel');
  if (!productLogChannelId || changes.length === 0) return;
  
  const logChannel = interaction.client.channels.cache.get(productLogChannelId);
  if (!logChannel) return;
  
  const embed = new EmbedBuilder()
    .setTitle('📝 Midman Service Edited')
    .setDescription('Layanan mediasi telah diubah.')
    .addFields(
      { name: 'Service Code', value: originalService.code, inline: true },
      { name: 'Original Nominal', value: originalService.nominal, inline: true },
      { name: 'Edited by', value: `<@${interaction.user.id}>`, inline: true },
      { name: 'Changes Made', value: changes.join('\n'), inline: false }
    )
    .setColor(COLORS.WARNING)
    .setImage(IMAGES.STORE_OPEN)
    .setTimestamp();
  
  await logChannel.send({ embeds: [embed] });
}

async function logMidmanRemove(interaction, service) {
  const productLogChannelId = await db.getConfig('product_log_channel');
  if (!productLogChannelId) return;
  
  const logChannel = interaction.client.channels.cache.get(productLogChannelId);
  if (!logChannel) return;
  
  const embed = new EmbedBuilder()
    .setTitle('🗑️ Midman Service Removed')
    .setDescription('Layanan mediasi telah dihapus.')
    .addFields(
      { name: 'Code', value: service.code, inline: true },
      { name: 'Nominal', value: service.nominal, inline: true },
      { name: 'Price', value: service.price, inline: true },
      { name: 'Removed by', value: `<@${interaction.user.id}>`, inline: true }
    )
    .setColor(COLORS.ERROR)
    .setImage(IMAGES.STORE_OPEN)
    .setTimestamp();
  
  await logChannel.send({ embeds: [embed] });
}

async function logReportAction(interaction, report, action, emoji) {
  const reportLogChannelId = await db.getConfig('report_log_channel');
  if (!reportLogChannelId) return;
  
  const logChannel = interaction.client.channels.cache.get(reportLogChannelId);
  if (!logChannel) return;
  
  const embed = new EmbedBuilder()
    .setTitle(`${emoji} Laporan ${action}`)
    .addFields(
      { name: 'Pengguna yang Dilaporkan', value: `<@${report.reportedUserId}>`, inline: true },
      { name: 'Dilaporkan oleh', value: `<@${report.reporterId}>`, inline: true },
      { name: 'Alasan', value: report.reason, inline: false },
      { name: 'Tindakan oleh', value: interaction.user.toString(), inline: true },
      { name: 'Tindakan', value: action, inline: true }
    )
    .setColor(action === 'Ban' ? COLORS.ERROR : action === 'Kick' ? COLORS.WARNING : COLORS.SECONDARY)
    .setTimestamp();
  
  if (report.attachment) {
    embed.addFields({ name: 'Lampiran', value: report.attachment, inline: false });
  }
  
  await logChannel.send({ embeds: [embed] });
}

module.exports = {
  logProductAdd,
  logProductEdit,
  logProductRemove,
  logMidmanAdd,
  logMidmanEdit,
  logMidmanRemove,
  logReportAction
};
