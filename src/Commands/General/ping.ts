import { Command, RunSlashFunction } from '../../Interfaces/Commands'
import { SlashCommandBuilder } from '@discordjs/builders';
import { GuildMember } from 'discord.js';

import * as Commands from '../../Configs/commands.json';
import { createEmbed } from '../../Modules/Utils';

export const name = Commands.General.Ping.Name
export const description = Commands.General.Ping.Description
export const category = Commands.General.Ping.Category
export const slashData = new SlashCommandBuilder()
  .setName(name)
  .setDescription(description)

export const runSlash: RunSlashFunction = async (client, interaction) => {
  await interaction.reply({
    embeds: [
      await createEmbed({
        options: Commands.General.Ping.Response.Embed,
        variables: [
          { searchFor: /{timestamp}/g, replaceWith: new Date() },
          { searchFor: /{ws-ping}/g, replaceWith: client.ws.ping },
          { searchFor: /{bot-ping}/g, replaceWith: new Date().valueOf() - interaction.createdAt.valueOf() }
        ]
      }, interaction.member as GuildMember)
    ]
  });
}
