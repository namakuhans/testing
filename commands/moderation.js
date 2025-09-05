const { SlashCommandBuilder } = require('discord.js');

module.exports = [
  new SlashCommandBuilder()
    .setName('setverify')
    .setDescription('Set verification channel and emote')
    .addChannelOption(option => option.setName('channel').setDescription('Verification channel').setRequired(true))
    .addStringOption(option => option.setName('emote').setDescription('Verification emote').setRequired(true)),
  
  new SlashCommandBuilder()
    .setName('setticketlog')
    .setDescription('Set ticket log channel')
    .addChannelOption(option => option.setName('channel').setDescription('Ticket log channel').setRequired(true)),
  
  new SlashCommandBuilder()
    .setName('setreportfeedback')
    .setDescription('Set report feedback channel')
    .addChannelOption(option => option.setName('channel').setDescription('Report feedback channel').setRequired(true)),
  
  new SlashCommandBuilder()
    .setName('setreportlog')
    .setDescription('Set report log channel')
    .addChannelOption(option => option.setName('channel').setDescription('Report log channel').setRequired(true)),
  
  new SlashCommandBuilder()
    .setName('setupstore')
    .setDescription('Setup main store channel')
    .addChannelOption(option => option.setName('channel').setDescription('Store channel').setRequired(true)),
  
  new SlashCommandBuilder()
    .setName('resetreps')
    .setDescription('Reset user reputation points')
    .addUserOption(option => option.setName('user').setDescription('User to reset reputation').setRequired(true)),
  
  new SlashCommandBuilder()
    .setName('setproductlog')
    .setDescription('Set product log channel')
    .addChannelOption(option => option.setName('channel').setDescription('Product log channel').setRequired(true))
];