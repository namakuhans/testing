const { EmbedBuilder } = require('discord.js');
const db = require('../../database/connection');
const { COLORS } = require('../../config/constants');

async function handleResponseModal(interaction) {
  const reportId = interaction.customId.split('_')[2];
  const responseMessage = interaction.fields.getTextInputValue('response_message');
  
  const report = await db.getCollection('reports').findOne({ reportId });
  if (!report) {
    return interaction.reply({ content: 'Laporan tidak ditemukan.', ephemeral: true });
  }
  
  try {
    const reporter = await interaction.client.users.fetch(report.reporterId);
    
    const responseEmbed = new EmbedBuilder()
      .setTitle('📨 Response dari Moderator')
      .setDescription('Moderator telah merespons laporan Anda.')
      .addFields(
        { name: 'Laporan Anda tentang', value: `<@${report.reportedUserId}>`, inline: true },
        { name: 'Alasan Laporan', value: report.reason, inline: false },
        { name: 'Response Moderator', value: responseMessage, inline: false },
        { name: 'Moderator', value: interaction.user.tag, inline: true }
      )
      .setColor(COLORS.PRIMARY)
      .setTimestamp();
    
    await reporter.send({ embeds: [responseEmbed] });
    
    // Update report status
    await db.getCollection('reports').updateOne({ reportId }, { 
      $set: { 
        status: 'responded', 
        resolvedBy: interaction.user.id, 
        resolvedAt: new Date(),
        action: 'response',
        responseMessage: responseMessage
      } 
    });
    
    // Log to report log channel
    const reportLogChannelId = await db.getConfig('report_log_channel');
    if (reportLogChannelId) {
      const logChannel = interaction.client.channels.cache.get(reportLogChannelId);
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setTitle('📨 Response Dikirim')
          .addFields(
            { name: 'Report ID', value: reportId, inline: true },
            { name: 'Response dari', value: interaction.user.toString(), inline: true },
            { name: 'Pelapor', value: `<@${report.reporterId}>`, inline: true },
            { name: 'Response Message', value: responseMessage, inline: false }
          )
          .setColor(COLORS.PRIMARY)
          .setTimestamp();
        
        await logChannel.send({ embeds: [logEmbed] });
      }
    }
    
    await interaction.message.delete();
    await interaction.reply({ 
      content: 'Response telah dikirim ke pelapor.', 
      ephemeral: true 
    });
    
  } catch (error) {
    console.error('Error sending response:', error);
    await interaction.reply({ 
      content: 'Gagal mengirim response. Pelapor mungkin memiliki DM yang tertutup.', 
      ephemeral: true 
    });
  }
}

module.exports = {
  handleResponseModal
};