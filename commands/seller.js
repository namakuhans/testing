const { SlashCommandBuilder } = require('discord.js');

module.exports = [
  new SlashCommandBuilder()
    .setName('addproduct')
    .setDescription('Add a new product')
    .addStringOption(option => option.setName('code').setDescription('Product code').setRequired(true))
    .addStringOption(option => option.setName('name').setDescription('Product name').setRequired(true))
    .addIntegerOption(option => option.setName('quantity').setDescription('Product quantity').setRequired(true))
    .addStringOption(option => option.setName('price').setDescription('Product price').setRequired(true)),
  
  new SlashCommandBuilder()
    .setName('editproduct')
    .setDescription('Edit existing product')
    .addStringOption(option => option.setName('code').setDescription('Product code').setRequired(true))
    .addStringOption(option => option.setName('newname').setDescription('New product name').setRequired(false))
    .addIntegerOption(option => option.setName('newquantity').setDescription('New product quantity').setRequired(false))
    .addStringOption(option => option.setName('newprice').setDescription('New product price').setRequired(false)),
  
  new SlashCommandBuilder()
    .setName('removeproduct')
    .setDescription('Remove a product')
    .addStringOption(option => option.setName('code').setDescription('Product code').setRequired(true)),
  
  new SlashCommandBuilder()
    .setName('addmidman')
    .setDescription('Add mediation service')
    .addStringOption(option => option.setName('code').setDescription('Service code').setRequired(true))
    .addStringOption(option => option.setName('nominal').setDescription('Service nominal').setRequired(true))
    .addStringOption(option => option.setName('price').setDescription('Service price').setRequired(true)),
  
  new SlashCommandBuilder()
    .setName('editmidman')
    .setDescription('Edit mediation service')
    .addStringOption(option => option.setName('code').setDescription('Service code').setRequired(true))
    .addStringOption(option => option.setName('nominal').setDescription('New service nominal').setRequired(false))
    .addStringOption(option => option.setName('price').setDescription('New service price').setRequired(false)),
  
  new SlashCommandBuilder()
    .setName('removemidman')
    .setDescription('Remove mediation service')
    .addStringOption(option => option.setName('code').setDescription('Service code').setRequired(true)),
  
  new SlashCommandBuilder()
    .setName('store')
    .setDescription('Set store status')
    .addStringOption(option => option.setName('status').setDescription('Store status').setRequired(true).addChoices(
      { name: 'on', value: 'on' },
      { name: 'off', value: 'off' }
    )),
  
  new SlashCommandBuilder()
    .setName('addpayment')
    .setDescription('Add payment method')
    .addStringOption(option => option.setName('name').setDescription('Payment method name').setRequired(true))
    .addStringOption(option => option.setName('attribute').setDescription('Payment attribute').setRequired(true)),
  
  new SlashCommandBuilder()
    .setName('removepayment')
    .setDescription('Remove payment method')
    .addStringOption(option => option.setName('name').setDescription('Payment method name').setRequired(true)),
  
  new SlashCommandBuilder()
    .setName('donebuy')
    .setDescription('Complete purchase transaction (use in ticket buy channel only)'),
  
  new SlashCommandBuilder()
    .setName('donemm')
    .setDescription('Complete mediation transaction (use in ticket midman channel only)')
    .addUserOption(option => option.setName('user1').setDescription('First user').setRequired(true))
    .addUserOption(option => option.setName('user2').setDescription('Second user').setRequired(true))
];
