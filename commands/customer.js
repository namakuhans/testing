const { SlashCommandBuilder } = require('discord.js');

module.exports = [
  new SlashCommandBuilder()
    .setName('reps')
    .setDescription('Give reputation point to a user')
    .addUserOption(option => option.setName('user').setDescription('User to give reputation').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason for reputation').setRequired(true)),
  
  new SlashCommandBuilder()
    .setName('repstat')
    .setDescription('Check user reputation status')
    .addUserOption(option => option.setName('user').setDescription('User to check reputation').setRequired(true)),
  
  new SlashCommandBuilder()
    .setName('report')
    .setDescription('Report a user')
    .addUserOption(option => option.setName('userreported').setDescription('User to report').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason for report').setRequired(true))
    .addAttachmentOption(option => option.setName('attachment').setDescription('Optional attachment').setRequired(false))
];