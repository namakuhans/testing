const { SlashCommandBuilder } = require('discord.js');

// Import command handlers
const customerCommands = require('./customer');
const sellerCommands = require('./seller');
const moderationCommands = require('./moderation');

// Combine all commands
const commands = [
  ...customerCommands,
  ...sellerCommands,
  ...moderationCommands,
  
  // Help command
  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available commands')
];

module.exports = commands;