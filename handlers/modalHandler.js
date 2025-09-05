const { handleBuyModal, handleMidmanModal } = require('./modals/transactionModals');
const { handleResponseModal } = require('./modals/reportModals');

async function handleModalInteraction(interaction) {
  if (!interaction.isModalSubmit()) return;
  
  // Check if interaction is still valid
  if (!interaction.isRepliable()) {
    console.log('Interaction is no longer repliable');
    return;
  }
  
  try {
    if (interaction.customId === 'buy_modal') {
      await handleBuyModal(interaction);
    } else if (interaction.customId === 'midman_modal') {
      await handleMidmanModal(interaction);
    } else if (interaction.customId.startsWith('response_modal_')) {
      await handleResponseModal(interaction);
    }
  } catch (error) {
    console.error('Error handling modal:', error);
    
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
            flags: 64 // MessageFlags.Ephemeral
          });
        }
      } catch (replyError) {
        console.error('Error sending error message:', replyError);
      }
    }
  }
}

module.exports = { handleModalInteraction };
