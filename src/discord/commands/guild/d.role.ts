/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ChatInputCommandInteraction,
  GuildMember,
  Role,
  SlashCommandBuilder,
  TextChannel,
} from 'discord.js';
import { db } from '../../../global/utils/knex';
import {
  ReactionRoles,
} from '../../../global/@types/pgdb';
import { SlashCommand } from '../../@types/commandDef';
import { embedTemplate } from '../../utils/embedTemplate';
import { startLog } from '../../utils/startLog';

const F = f(__filename);

export default dRole;

async function setup(
  interaction:ChatInputCommandInteraction,
  description:string,
  emoji:string,
  role:Role,
) {
  const mindsetEmbed = embedTemplate()
    .setDescription(description);

  // log.debug(F, `Emoji length is ${emoji.length}`);

  await (interaction.channel as TextChannel).send({ embeds: [mindsetEmbed] })
    .then(async msg => {
      if (emoji.includes('<')) {
        const emojiId = emoji.slice(emoji.indexOf(':', 3) + 1, emoji.indexOf('>'));
        // log.debug(F, `Emoji ID is ${emojiId}!`);
        // const emojiId = emoji.split(':')[2].replace('>', '');
        try {
          await msg.react(emojiId);
        } catch (err) {
          // If there's an error adding the emoji, delete the message
          msg.delete();
          interaction.reply({
            content: 'Reaction role message NOT created!\n\nMake sure you used a proper emoji that this bot can see!',
            ephemeral: true,
          });
          return false;
        }
      } else {
        try {
          await msg.react(emoji);
        } catch (err) {
          // If there's an error adding the emoji, delete the message
          msg.delete();
          interaction.reply({
            content: 'Reaction role message NOT created!\n\nMake sure you used a proper emoji that this bot can see!',
            ephemeral: true,
          });
          return false;
        }
      }
      const reactionRoleInfo = [
        {
          guild_id: msg.channel.guild.id,
          channel_id: msg.channel.id,
          message_id: msg.id,
          reaction_id: emoji,
          role_id: role.id,
        },
      ];
      await db<ReactionRoles>('reaction_roles')
        .insert(reactionRoleInfo)
        .onConflict(['role_id', 'reaction_id'])
        .merge();
      interaction.reply({ content: 'Reaction role message created!', ephemeral: true });
      return true;
    });
}

export const dRole: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('Add or remove roles.')
    .addSubcommand(subcommand => subcommand
      .setName('add')
      .setDescription('Add a role.')
      .addStringOption(option => option.setName('role')
        .setDescription('The role to add.')
        .setAutocomplete(true)
        .setRequired(true))
      .addUserOption(option => option.setName('user')
        .setDescription('(Mod only, defaults to you) The user to give the role.'))
      .addBooleanOption(option => option.setName('restrict')
        .setDescription('(Mod only, defaults false) Restrict user to this role.')))
    .addSubcommand(subcommand => subcommand
      .setName('remove')
      .setDescription('Remove a role.')
      .addStringOption(option => option.setName('role')
        .setDescription('The role to remove.')
        .setAutocomplete(true)
        .setRequired(true))
      .addUserOption(option => option.setName('user')
        .setDescription('(Mod only, defaults to you) The user to remove the role.'))
      .addBooleanOption(option => option.setName('restrict')
        .setDescription('(Mod only, defaults false) Restrict user from this role.')))
    .addSubcommand(subcommand => subcommand
      .setName('msgsetup')
      .setDescription('(Mod Only) Set up a reaction role message!')
      .addStringOption(option => option.setName('description')
        .setDescription('What should the message say?')
        .setRequired(true))
      .addStringOption(option => option.setName('emoji')
        .setDescription('What emoji should be used?')
        .setRequired(true))
      .addRoleOption(option => option.setName('role')
        .setDescription('What role should be applied?')
        .setRequired(true))),
  async execute(interaction) {
    startlog(F, interaction);
    if (!interaction.guild) return false;
    const command = interaction.options.getSubcommand();
    const role = interaction.options.getRole('role', true) as Role;
    if (command === 'add') {
      const user = interaction.options.getUser('user') ?? interaction.user;
      const member = await interaction.guild.members.fetch(user.id);
      await member.roles.add(role);
      await interaction.reply({ content: `Added ${role.name} to ${member.nickname}!`, ephemeral: true });
    } else if (command === 'remove') {
      const user = interaction.options.getUser('user', true);
      const member = await interaction.guild.members.fetch(user.id);
      await member.roles.add(role);
      await interaction.reply({ content: `Removed ${role.name} from ${member.nickname}!`, ephemeral: true });
    } else if (command === 'setup') {
      if ((interaction.member as GuildMember).roles.cache.find(r => r.id === env.ROLE_DEVELOPER) === undefined) {
        await interaction.reply({ content: 'You do not have permission to use this command!', ephemeral: true });
        return false;
      }
      const description = interaction.options.getString('description', true);
      const emoji = interaction.options.getString('emoji', true);
      await setup(
        interaction,
        description,
        emoji,
        role,
      );
    }
    return true;
  },
};