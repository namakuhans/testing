const { EmbedBuilder } = require('discord.js');
const db = require('../../database/connection');
const { COLORS } = require('../../config/constants');

async function handleReps(interaction) {
  const user = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason');
  
  if (user.id === interaction.user.id) {
    return interaction.reply({ 
      content: 'Anda tidak dapat memberikan reputasi untuk diri sendiri!', 
      ephemeral: true 
    });
  }
  
  await db.getCollection('reputation').insertOne({
    userId: user.id,
    giverId: interaction.user.id,
    reason: reason,
    timestamp: new Date()
  });
  
  const embed = new EmbedBuilder()
    .setTitle('✅ Reputasi Berhasil Diberikan')
    .setDescription(`**Pengguna:** ${user.toString()}\n**Alasan:** ${reason}\n**Diberikan oleh:** ${interaction.user.toString()}`)
    .setColor(COLORS.SUCCESS)
    .setTimestamp();
  
  await interaction.reply({ embeds: [embed] });
}

async function handleRepstat(interaction) {
  const user = interaction.options.getUser('user');
  const repCount = await db.getCollection('reputation').countDocuments({ userId: user.id });
  
  const embed = new EmbedBuilder()
    .setTitle('📊 Status Reputasi')
    .setDescription(`**Pengguna:** ${user.toString()}\n**Total Reputasi:** ${repCount} poin`)
    .setThumbnail(user.displayAvatarURL())
    .setColor(COLORS.PRIMARY)
    .setTimestamp();
  
  await interaction.reply({ embeds: [embed] });
}

async function handleReport(interaction) {
  const userReported = interaction.options.getUser('userreported');
  const reason = interaction.options.getString('reason');
  const attachment = interaction.options.getAttachment('attachment');
  
  const reportFeedbackChannelId = await db.getConfig('report_feedback_channel');
  if (!reportFeedbackChannelId) {
    return interaction.reply({ 
      content: 'Channel laporan belum diatur. Hubungi administrator.', 
      ephemeral: true 
    });
  }
  
  const reportChannel = interaction.client.channels.cache.get(reportFeedbackChannelId);
  if (!reportChannel) {
    return interaction.reply({ 
      content: 'Channel laporan tidak ditemukan.', 
      ephemeral: true 
    });
  }
  
  const reportId = Date.now().toString();
  
  const { createReportEmbed, createReportButtons } = require('../ui/reportComponents');
  const embed = createReportEmbed(userReported, interaction.user, reason, attachment);
  const buttons = createReportButtons(reportId);
  
  await reportChannel.send({ embeds: [embed], components: [buttons] });
  
  // Save report to database
  await db.getCollection('reports').insertOne({
    reportId: reportId,
    reportedUserId: userReported.id,
    reporterId: interaction.user.id,
    reason: reason,
    attachment: attachment ? attachment.url : null,
    status: 'pending',
    timestamp: new Date()
  });
  
  await interaction.reply({ 
    content: 'Laporan Anda telah dikirim dan akan ditinjau oleh moderator.', 
    ephemeral: true 
  });
}

module.exports = {
  handleReps,
  handleRepstat,
  handleReport
};