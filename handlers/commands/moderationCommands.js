const { EmbedBuilder } = require('discord.js');
const db = require('../../database/connection');
const { COLORS } = require('../../config/constants');
const { createMainEmbed, createMainButtons } = require('../../utils/storeUtils');

async function handleSetVerify(interaction) {
  const channel = interaction.options.getChannel('channel');
  const emote = interaction.options.getString('emote');
  
  await db.setConfig('verify_channel', channel.id);
  await db.setConfig('verify_emote', emote);
  
  await interaction.reply({ 
    content: `Verification system has been set to channel ${channel.toString()} with emote ${emote}`, 
    ephemeral: true 
  });
}

async function handleSetTicketLog(interaction) {
  const channel = interaction.options.getChannel('channel');
  
  await db.setConfig('ticket_log_channel', channel.id);
  
  await interaction.reply({ 
    content: `Ticket log channel has been set to ${channel.toString()}`, 
    ephemeral: true 
  });
}

async function handleSetReportFeedback(interaction) {
  const channel = interaction.options.getChannel('channel');
  
  await db.setConfig('report_feedback_channel', channel.id);
  
  await interaction.reply({ 
    content: `Report feedback channel has been set to ${channel.toString()}`, 
    ephemeral: true 
  });
}

async function handleSetReportLog(interaction) {
  const channel = interaction.options.getChannel('channel');
  
  await db.setConfig('report_log_channel', channel.id);
  
  await interaction.reply({ 
    content: `Report log channel has been set to ${channel.toString()}`, 
    ephemeral: true 
  });
}

async function handleSetupStore(interaction) {
  const channel = interaction.options.getChannel('channel');
  
  const embed = await createMainEmbed();
  const buttons = createMainButtons();
  
  const message = await channel.send({ embeds: [embed], components: [buttons] });
  
  await db.setConfig('store_channel', channel.id);
  await db.setConfig('store_message', message.id);
  
  await interaction.reply({ 
    content: `Store has been set up in ${channel.toString()}!`, 
    ephemeral: true 
  });
}

async function handleResetReps(interaction) {
  const user = interaction.options.getUser('user');
  
  try {
    const result = await db.getCollection('reputation').deleteMany({ userId: user.id });
    
    const embed = new EmbedBuilder()
      .setTitle('🔄 Reputation Reset')
      .setDescription(`Semua poin reputasi untuk ${user.toString()} telah dihapus.`)
      .addFields(
        { name: 'User', value: user.tag, inline: true },
        { name: 'Records Deleted', value: result.deletedCount.toString(), inline: true },
        { name: 'Reset by', value: interaction.user.tag, inline: true }
      )
      .setColor(0xFF6B6B)
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed], ephemeral: true });
  } catch (error) {
    console.error('Error resetting reputation:', error);
    await interaction.reply({ 
      content: 'Gagal mereset reputasi pengguna.', 
      ephemeral: true 
    });
  }
}

async function handleSetProductLog(interaction) {
  const channel = interaction.options.getChannel('channel');
  
  await db.setConfig('product_log_channel', channel.id);
  
  const embed = new EmbedBuilder()
    .setTitle('📝 Product Log Channel Set')
    .setDescription(`Channel log produk telah diatur ke ${channel.toString()}`)
    .setColor(COLORS.SUCCESS)
    .setTimestamp();
  
  await interaction.reply({ embeds: [embed], ephemeral: true });
}

module.exports = {
  handleSetVerify,
  handleSetTicketLog,
  handleSetReportFeedback,
  handleSetReportLog,
  handleSetupStore,
  handleResetReps,
  handleSetProductLog
};
