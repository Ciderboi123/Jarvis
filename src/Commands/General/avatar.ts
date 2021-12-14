import { Command, RunSlashFunction } from '../../Interfaces/Commands'
import { SlashCommandBuilder } from '@discordjs/builders';
import { GuildMember } from 'discord.js';

import * as Commands from '../../Configs/commands.json';
import { createEmbed } from '../../Modules/Utils';

export const name = Commands.General.Avatar.Name
export const description = Commands.General.Avatar.Description
export const category = Commands.General.Avatar.Category
export const slashData = new SlashCommandBuilder()
  .setName(name)
  .setDescription(description)
  .addUserOption(o => o.setName('user').setDescription('the user\'s profile picture to see.').setRequired(true))

export const runSlash: RunSlashFunction = async (client, interaction) => {
  await interaction.reply({
    embeds: [
      await createEmbed({
        options: Commands.General.Avatar.Response.Embed,
        variables: [
          { searchFor: /{timestamp}/g, replaceWith: new Date() },
          { searchFor: /{avatar}/g, replaceWith: interaction.options.getUser('user').avatarURL({ dynamic: true }) }, 
          { searchFor: /{user}/g, replaceWith: interaction.options.getUser('user').username }
        ]
      }, interaction.member as GuildMember)
    ]
  });
}
