const { handleBuyButton, handleMidmanButton, handlePaymentButton, handleStatusButton, handleCallSeller, handleCloseTicket } = require('./buttons/mainButtons');
const { handleResponseReport, handleBanReport, handleKickReport, handleWarnReport } = require('./buttons/reportButtons');

async function handleButtonInteraction(interaction) {
  if (!interaction.isButton()) return;
  
  try {
    // Handle report buttons with reportId
    if (interaction.customId.startsWith('response_report_') ||
        interaction.customId.startsWith('ban_report_') ||
        interaction.customId.startsWith('kick_report_') ||
        interaction.customId.startsWith('warn_report_')) {
      const action = interaction.customId.split('_')[0];
      switch (action) {
        case 'response':
          await handleResponseReport(interaction);
          break;
        case 'ban':
          await handleBanReport(interaction);
          break;
        case 'kick':
          await handleKickReport(interaction);
          break;
        case 'warn':
          await handleWarnReport(interaction);
          break;
      }
      return;
    }
    
    switch (interaction.customId) {
      case 'buy_button':
        await handleBuyButton(interaction);
        break;
      case 'midman_button':
        await handleMidmanButton(interaction);
        break;
      case 'payment_button':
        await handlePaymentButton(interaction);
        break;
      case 'status_button':
        await handleStatusButton(interaction);
        break;
      case 'call_seller':
        await handleCallSeller(interaction);
        break;
      case 'close_ticket':
        await handleCloseTicket(interaction);
        break;
    }
  } catch (error) {
    console.error('Error handling button interaction:', error);
    
    // Only reply if interaction is still valid
    if (interaction.isRepliable()) {
      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ 
            content: 'Terjadi kesalahan saat memproses permintaan Anda.', 
            ephemeral: true 
          });
        } else {
          await interaction.reply({ 
            content: 'Terjadi kesalahan saat memproses permintaan Anda.', 
            ephemeral: true 
          });
        }
      } catch (replyError) {
        console.error('Error sending error message:', replyError);
      }
    }
  }
}

module.exports = { handleButtonInteraction };
