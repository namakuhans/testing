const { ChannelType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { COLORS, SELLER_ROLE_ID } = require('../config/constants');

async function createTicketChannel(guild, channelName, categoryId, allowedUserIds = []) {
  try {
    console.log(`🎫 Creating ticket channel: ${channelName}`);
    console.log(`📁 Category ID: ${categoryId}`);
    console.log(`👥 Allowed users: ${allowedUserIds.join(', ')}`);
    
    // Force fetch all channels first
    try {
      await guild.channels.fetch();
      console.log(`🔄 Channels fetched for ticket creation. Cache size: ${guild.channels.cache.size}`);
    } catch (fetchError) {
      console.error('❌ Error fetching channels for ticket creation:', fetchError);
    }
    
    // First try to get from cache
    let ticketCategory = guild.channels.cache.get(categoryId);
    
    console.log(`🔍 Looking for category ${categoryId} in cache...`);
    console.log(`📋 Available categories in cache:`);
    guild.channels.cache.filter(ch => ch.type === 4).forEach(category => {
      console.log(`  - ${category.name} (ID: ${category.id})`);
    });
    
    if (!ticketCategory) {
      console.log('⚠️ Category not found in cache, trying to fetch from API...');
      try {
        const fetchedCategory = await guild.channels.fetch(categoryId);
        if (fetchedCategory && fetchedCategory.type === 4) {
          ticketCategory = fetchedCategory;
          console.log('✅ Category found via API fetch:', ticketCategory.name);
        } else {
          console.error('❌ Fetched channel is not a category:', fetchedCategory?.type);
          return null;
        }
      } catch (fetchError) {
        console.error('❌ Failed to fetch category from API:', fetchError.message);
        return null;
      }
    } else {
      console.log('✅ Category found in cache:', ticketCategory.name);
    }
    
    if (!ticketCategory) {
      console.error('❌ Category still not found after all attempts');
      return null;
    }
    
    // Prepare permission overwrites
    const permissionOverwrites = [
      {
        id: guild.roles.everyone.id,
        deny: [PermissionFlagsBits.ViewChannel],
      }
    ];
    
    // Add permissions for allowed users
    allowedUserIds.forEach(userId => {
      permissionOverwrites.push({
        id: userId,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
      });
    });
    
    console.log('🔧 Creating channel with permissions...');
    const ticketChannel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: categoryId,
      permissionOverwrites: permissionOverwrites,
    });
    
    console.log('✅ Ticket channel created successfully:', ticketChannel.name, 'ID:', ticketChannel.id);
    return ticketChannel;
  } catch (error) {
    console.error('❌ Error creating ticket channel:', error.message);
    console.error('Full error:', error);
    return null;
  }
}

async function sendThankYouMessages(interaction, transactionType, specificMembers = null) {
  try {
    let participants = [];
    
    if (specificMembers) {
      participants = specificMembers.filter(m => m && !m.roles.cache.has(SELLER_ROLE_ID));
    } else {
      // Get channel members excluding seller role
      interaction.channel.permissionOverwrites.cache.forEach((overwrite) => {
        if (overwrite.type === 1 && overwrite.allow.has('ViewChannel')) {
          const member = interaction.guild.members.cache.get(overwrite.id);
          if (member && !member.roles.cache.has(SELLER_ROLE_ID) && member.id !== interaction.user.id) {
            participants.push(member);
          }
        }
      });
    }
    
    for (const participant of participants) {
      try {
        const thankEmbed = new EmbedBuilder()
          .setTitle('🙏 Terima Kasih!')
          .setDescription('Terima kasih telah berpartisipasi dalam transaksi ini!')
          .addFields(
            { name: 'Channel', value: interaction.channel.toString(), inline: true },
            { name: 'Transaksi', value: transactionType, inline: true }
          )
          .setColor(COLORS.SUCCESS)
          .setTimestamp();
        
        await participant.send({ embeds: [thankEmbed] });
      } catch (error) {
        console.log(`Could not send thank you DM to ${participant.user.tag}:`, error);
      }
    }
  } catch (error) {
    console.error('Error sending thank you messages:', error);
  }
}

module.exports = {
  createTicketChannel,
  sendThankYouMessages
};
