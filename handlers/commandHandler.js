const { EmbedBuilder } = require('discord.js');
const db = require('../database/connection');
const { COLORS } = require('../config/constants');

// Import command implementations
const customerHandlers = require('./commands/customerCommands');
const sellerHandlers = require('./commands/sellerCommands');
const moderationHandlers = require('./commands/moderationCommands');

async function handleSlashCommand(interaction) {
  if (!interaction.isChatInputCommand()) return;
  
  const { commandName } = interaction;
  
  try {
    switch (commandName) {
      // Customer commands
      case 'reps':
        await customerHandlers.handleReps(interaction);
        break;
      case 'repstat':
        await customerHandlers.handleRepstat(interaction);
        break;
      case 'report':
        await customerHandlers.handleReport(interaction);
        break;
      
      // Seller commands
      case 'addproduct':
        await sellerHandlers.handleAddProduct(interaction);
        break;
      case 'editproduct':
        await sellerHandlers.handleEditProduct(interaction);
        break;
      case 'removeproduct':
        await sellerHandlers.handleRemoveProduct(interaction);
        break;
      case 'addmidman':
        await sellerHandlers.handleAddMidman(interaction);
        break;
      case 'editmidman':
        await sellerHandlers.handleEditMidman(interaction);
        break;
      case 'removemidman':
        await sellerHandlers.handleRemoveMidman(interaction);
        break;
      case 'store':
        await sellerHandlers.handleStore(interaction);
        break;
      case 'addpayment':
        await sellerHandlers.handleAddPayment(interaction);
        break;
      case 'removepayment':
        await sellerHandlers.handleRemovePayment(interaction);
        break;
      case 'donebuy':
        await sellerHandlers.handleDoneBuy(interaction);
        break;
      case 'donemm':
        await sellerHandlers.handleDoneMM(interaction);
        break;
      
      // Moderation commands
      case 'setverify':
        await moderationHandlers.handleSetVerify(interaction);
        break;
      case 'setticketlog':
        await moderationHandlers.handleSetTicketLog(interaction);
        break;
      case 'setreportfeedback':
        await moderationHandlers.handleSetReportFeedback(interaction);
        break;
      case 'setreportlog':
        await moderationHandlers.handleSetReportLog(interaction);
        break;
      case 'setupstore':
        await moderationHandlers.handleSetupStore(interaction);
        break;
      case 'resetreps':
        await moderationHandlers.handleResetReps(interaction);
        break;
      case 'setproductlog':
        await moderationHandlers.handleSetProductLog(interaction);
        break;
      
      // Help command
      case 'help':
        await handleHelp(interaction);
        break;
    }
  } catch (error) {
    console.error('Error handling command:', error);
    
    // Only reply if interaction is still valid
    if (interaction.isRepliable()) {
      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ 
            content: 'Terjadi kesalahan saat memproses command Anda.', 
            ephemeral: true 
          });
        } else {
          await interaction.reply({ 
            content: 'Terjadi kesalahan saat memproses command Anda.', 
            ephemeral: true 
          });
        }
      } catch (replyError) {
        console.error('Error sending error message:', replyError);
      }
    }
  }
}

async function handleHelp(interaction) {
  const embed = new EmbedBuilder()
    .setTitle('📚 Bot Commands Help')
    .setDescription('List of all available commands:')
    .addFields(
      { 
        name: '👥 Customer Commands', 
        value: '`/reps` - Give reputation\n`/repstat` - Check reputation\n`/report` - Report user', 
        inline: false 
      },
      { 
        name: '🛍️ Seller Commands', 
        value: '`/addproduct` - Add product\n`/editproduct` - Edit product\n`/removeproduct` - Remove product\n`/addmidman` - Add mediation service\n`/editmidman` - Edit mediation service\n`/removemidman` - Remove mediation service\n`/store` - Set store status\n`/addpayment` - Add payment method\n`/removepayment` - Remove payment method\n`/donebuy` - Complete purchase\n`/donemm` - Complete mediation', 
        inline: false 
      },
      { 
        name: '🔧 Moderation Commands', 
        value: '`/setverify` - Set verification\n`/setticketlog` - Set ticket log channel\n`/setreportfeedback` - Set report feedback channel\n`/setreportlog` - Set report log channel\n`/setupstore` - Setup store display\n`/resetreps` - Reset user reputation\n`/setproductlog` - Set product log channel', 
        inline: false 
      }
    )
    .setColor(COLORS.PRIMARY)
    .setTimestamp();
  
  await interaction.reply({ embeds: [embed], ephemeral: true });
}

module.exports = { handleSlashCommand };
