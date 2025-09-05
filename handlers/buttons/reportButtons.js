const { EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const db = require('../../database/connection');
const { COLORS } = require('../../config/constants');

async function handleResponseReport(interaction) {
  const reportId = interaction.customId.split('_')[2];
  
  const modal = new ModalBuilder()
    .setCustomId(`response_modal_${reportId}`)
    .setTitle('Response to Reporter');

  const messageInput = new TextInputBuilder()
    .setCustomId('response_message')
    .setLabel('Pesan untuk Pelapor')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Tulis pesan yang akan dikirim ke pelapor...')
    .setRequired(true);

  const actionRow = new ActionRowBuilder().addComponents(messageInput);
  modal.addComponents(actionRow);

  await interaction.showModal(modal);
}

async function handleBanReport(interaction) {
  const reportId = interaction.customId.split('_')[2];
  const report = await db.getCollection('reports').findOne({ reportId });
  
  if (!report) {
    return interaction.reply({ content: 'Laporan tidak ditemukan.', ephemeral: true });
  }
  
  try {
    const member = await interaction.guild.members.fetch(report.reportedUserId).catch(() => null);
    
    if (!member) {
      return interaction.reply({ 
        content: 'Pengguna tidak ditemukan di server ini. Mungkin sudah keluar atau di-ban sebelumnya.', 
        ephemeral: true 
      });
    }
    
    if (!member.bannable) {
      return interaction.reply({ 
        content: 'Tidak dapat ban pengguna ini. Kemungkinan memiliki role yang lebih tinggi dari bot.', 
        ephemeral: true 
      });
    }
    
    await member.ban({ reason: `Report: ${report.reason}` });
    
    // Send DM to banned user
    try {
      const dmEmbed = new EmbedBuilder()
        .setTitle('🔨 You have been banned')
        .setDescription('Anda telah di-ban dari server berdasarkan laporan.')
        .addFields(
          { name: 'Reason', value: report.reason, inline: false },
          { name: 'Server', value: interaction.guild.name, inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true }
        )
        .setColor(COLORS.ERROR)
        .setTimestamp();
      
      await member.user.send({ embeds: [dmEmbed] });
    } catch (error) {
      console.log('Could not send DM to banned user:', error);
    }
    
    // Update report status
    await db.getCollection('reports').updateOne({ reportId }, { 
      $set: { 
        status: 'resolved-ban', 
        resolvedBy: interaction.user.id, 
        resolvedAt: new Date(),
        action: 'ban'
      } 
    });
    
    const { logReportAction } = require('../../utils/logging');
    await logReportAction(interaction, report, 'Ban', '🔨');
    await interaction.message.delete();
    await interaction.reply({ 
      content: `Pengguna ${member.user.tag} telah di-ban berdasarkan laporan.`, 
      ephemeral: true 
    });
    
  } catch (error) {
    console.error('Error banning user:', error);
    await interaction.reply({ 
      content: 'Gagal melakukan ban. Terjadi kesalahan sistem.', 
      ephemeral: true 
    });
  }
}

async function handleKickReport(interaction) {
  const reportId = interaction.customId.split('_')[2];
  const report = await db.getCollection('reports').findOne({ reportId });
  
  if (!report) {
    return interaction.reply({ content: 'Laporan tidak ditemukan.', ephemeral: true });
  }
  
  try {
    const member = await interaction.guild.members.fetch(report.reportedUserId).catch(() => null);
    
    if (!member) {
      return interaction.reply({ 
        content: 'Pengguna tidak ditemukan di server ini. Mungkin sudah keluar sebelumnya.', 
        ephemeral: true 
      });
    }
    
    if (!member.kickable) {
      return interaction.reply({ 
        content: 'Tidak dapat kick pengguna ini. Kemungkinan memiliki role yang lebih tinggi dari bot.', 
        ephemeral: true 
      });
    }
    
    await member.kick(`Report: ${report.reason}`);
    
    // Send DM to kicked user
    try {
      const dmEmbed = new EmbedBuilder()
        .setTitle('🦶 You have been kicked')
        .setDescription('Anda telah di-kick dari server berdasarkan laporan.')
        .addFields(
          { name: 'Reason', value: report.reason, inline: false },
          { name: 'Server', value: interaction.guild.name, inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true }
        )
        .setColor(COLORS.WARNING)
        .setTimestamp();
      
      await member.user.send({ embeds: [dmEmbed] });
    } catch (error) {
      console.log('Could not send DM to kicked user:', error);
    }
    
    // Update report status
    await db.getCollection('reports').updateOne({ reportId }, { 
      $set: { 
        status: 'resolved-kick', 
        resolvedBy: interaction.user.id, 
        resolvedAt: new Date(),
        action: 'kick'
      } 
    });
    
    const { logReportAction } = require('../../utils/logging');
    await logReportAction(interaction, report, 'Kick', '🦶');
    await interaction.message.delete();
    await interaction.reply({ 
      content: `Pengguna ${member.user.tag} telah di-kick berdasarkan laporan.`, 
      ephemeral: true 
    });
    
  } catch (error) {
    console.error('Error kicking user:', error);
    await interaction.reply({ 
      content: 'Gagal melakukan kick. Terjadi kesalahan sistem.', 
      ephemeral: true 
    });
  }
}

async function handleWarnReport(interaction) {
  const reportId = interaction.customId.split('_')[2];
  const report = await db.getCollection('reports').findOne({ reportId });
  
  if (!report) {
    return interaction.reply({ content: 'Laporan tidak ditemukan.', ephemeral: true });
  }
  
  try {
    const reportedUser = await interaction.client.users.fetch(report.reportedUserId);
    
    const warnEmbed = new EmbedBuilder()
      .setTitle('⚠️ Warning')
      .setDescription('Anda menerima peringatan dari moderator.')
      .addFields(
        { name: 'Alasan Laporan', value: report.reason, inline: false },
        { name: 'Server', value: interaction.guild.name, inline: true },
        { name: 'Moderator', value: interaction.user.tag, inline: true }
      )
      .setColor(COLORS.SECONDARY)
      .setTimestamp();
    
    await reportedUser.send({ embeds: [warnEmbed] });
    
    // Update report status
    await db.getCollection('reports').updateOne({ reportId }, { 
      $set: { 
        status: 'resolved-warn', 
        resolvedBy: interaction.user.id, 
        resolvedAt: new Date(),
        action: 'warn'
      } 
    });
    
    const { logReportAction } = require('../../utils/logging');
    await logReportAction(interaction, report, 'Warning', '⚠️');
    await interaction.message.delete();
    await interaction.reply({ 
      content: 'Warning telah dikirim kepada pengguna yang dilaporkan.', 
      ephemeral: true 
    });
    
  } catch (error) {
    console.error('Error sending warning:', error);
    await interaction.reply({ 
      content: 'Gagal mengirim warning. Pengguna mungkin memiliki DM yang tertutup.', 
      ephemeral: true 
    });
  }
}

module.exports = {
  handleResponseReport,
  handleBanReport,
  handleKickReport,
  handleWarnReport
};
