// 'use strict';

// const path = require('path');
// const { ApplicationCommandType } = require('discord-api-types/v9');
// const { ContextMenuCommandBuilder } = require('discord.js');
// const logger = require('../../../global/utils/log');
// const template = require('../../utils/embed-template');

// const F = f(__filename);

// module.exports = {
//   data: new ContextMenuCommandBuilder()
//     .setName('New Drug Question')
//     .setType(ApplicationCommandType.Message),
//   async execute(interaction) {
//     const embed = template.embedTemplate().setTitle('I would ask a question in #drug-questions on behalf of this user!');
//     await interaction.reply({ embeds: [embed] });
//   },
// };
