const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { COLORS } = require('../../config/constants');

function createReportEmbed(userReported, reporter, reason, attachment) {
  const embed = new EmbedBuilder()
    .setTitle('🚨 Laporan Baru')
    .addFields(
      { name: 'Pengguna yang Dilaporkan', value: userReported.toString(), inline: true },
      { name: 'Dilaporkan oleh', value: reporter.toString(), inline: true },
      { name: 'Alasan', value: reason, inline: false }
    )
    .setColor(COLORS.ERROR)
    .setTimestamp();
  
  if (attachment) {
    embed.addFields({ name: 'Lampiran', value: attachment.url, inline: false });
    embed.setImage(attachment.url);
  }
  
  return embed;
}

function createReportButtons(reportId) {
  return new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`response_report_${reportId}`)
        .setLabel('Response')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`ban_report_${reportId}`)
        .setLabel('Ban')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId(`kick_report_${reportId}`)
        .setLabel('Kick')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(`warn_report_${reportId}`)
        .setLabel('Warn')
        .setStyle(ButtonStyle.Secondary)
    );
}

module.exports = {
  createReportEmbed,
  createReportButtons
};