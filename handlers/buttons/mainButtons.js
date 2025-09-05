const { EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database/connection');
const { COLORS, SELLER_ROLE_ID } = require('../../config/constants');

async function handleBuyButton(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('buy_modal')
    .setTitle('Form Pembelian Produk');
  
  const productInput = new TextInputBuilder()
    .setCustomId('product_name')
    .setLabel('Nama Produk')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Masukkan nama produk yang tersedia')
    .setRequired(true);
  
  const quantityInput = new TextInputBuilder()
    .setCustomId('product_quantity')
    .setLabel('Quantity')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Masukkan jumlah yang ingin dibeli')
    .setRequired(true);
  
  const firstActionRow = new ActionRowBuilder().addComponents(productInput);
  const secondActionRow = new ActionRowBuilder().addComponents(quantityInput);
  
  modal.addComponents(firstActionRow, secondActionRow);
  
  await interaction.showModal(modal);
}

async function handleMidmanButton(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('midman_modal')
    .setTitle('Form Layanan Mediasi');
  
  const userInput = new TextInputBuilder()
    .setCustomId('transaction_user')
    .setLabel('User yang diajak bertransaksi')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Masukkan username atau mention user')
    .setRequired(true);
  
  const amountInput = new TextInputBuilder()
    .setCustomId('transaction_amount')
    .setLabel('Nominal Transaksi')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Masukkan nominal transaksi')
    .setRequired(true);
  
  const detailsInput = new TextInputBuilder()
    .setCustomId('transaction_details')
    .setLabel('Detail Transaksi (Opsional)')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Masukkan detail tambahan transaksi (opsional)')
    .setRequired(false);
  
  const firstActionRow = new ActionRowBuilder().addComponents(userInput);
  const secondActionRow = new ActionRowBuilder().addComponents(amountInput);
  const thirdActionRow = new ActionRowBuilder().addComponents(detailsInput);
  
  modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);
  
  await interaction.showModal(modal);
}

async function handlePaymentButton(interaction) {
  const payments = await db.getCollection('payments').find({}).toArray();
  
  let paymentList = 'Tidak ada metode pembayaran tersedia';
  if (payments.length > 0) {
    paymentList = payments.map(p => `**${p.name}:** ${p.attribute}`).join('\n');
  }
  
  const embed = new EmbedBuilder()
    .setTitle('💳 Metode Pembayaran')
    .setDescription(paymentList)
    .setColor(COLORS.SUCCESS)
    .setTimestamp();
  
  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handleStatusButton(interaction) {
  const storeStatus = await db.getConfig('store_status') || 'off';
  
  const embed = new EmbedBuilder()
    .setTitle('📊 Status Toko')
    .setDescription(`Status toko saat ini: **${storeStatus === 'on' ? 'BUKA' : 'TUTUP'}**`)
    .setColor(storeStatus === 'on' ? COLORS.SUCCESS : COLORS.ERROR)
    .setTimestamp();
  
  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handleCallSeller(interaction) {
  const sellerRole = interaction.guild.roles.cache.get(SELLER_ROLE_ID);
  
  if (sellerRole) {
    await interaction.reply({ 
      content: `${sellerRole.toString()} Anda dipanggil ke channel ini untuk membantu pelanggan!` 
    });
  } else {
    await interaction.reply({ 
      content: 'Role seller tidak ditemukan! Hubungi administrator.' 
    });
  }
}

async function handleCloseTicket(interaction) {
  const ticketLogChannelId = await db.getConfig('ticket_log_channel');
  
  if (ticketLogChannelId) {
    const logChannel = interaction.client.channels.cache.get(ticketLogChannelId);
    if (logChannel) {
      const embed = new EmbedBuilder()
        .setTitle('🎫 Tiket Ditutup')
        .addFields(
          { name: 'Channel', value: interaction.channel.name, inline: true },
          { name: 'Ditutup oleh', value: interaction.user.toString(), inline: true },
          { name: 'Waktu', value: new Date().toLocaleString(), inline: true }
        )
        .setColor(COLORS.ERROR)
        .setTimestamp();
      
      await logChannel.send({ embeds: [embed] });
    }
  }
  
  await interaction.reply({ content: 'Tiket akan ditutup dalam 5 detik...' });
  
  setTimeout(async () => {
    await interaction.channel.delete();
  }, 5000);
}

module.exports = {
  handleBuyButton,
  handleMidmanButton,
  handlePaymentButton,
  handleStatusButton,
  handleCallSeller,
  handleCloseTicket
};
