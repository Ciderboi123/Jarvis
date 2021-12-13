import { Command, RunSlashFunction } from '../../Interfaces/Commands'
import { SlashCommandBuilder } from '@discordjs/builders';
import { GuildMember, TextChannel, CategoryChannel } from 'discord.js';

import * as Config from '../../Configs/config.json';
import * as Commands from '../../Configs/commands.json';
import { createEmbed } from '../../Modules/Utils';
import { closeTicket } from '../../Modules/Tickets';

export const name = Commands.Tickets.Close.Name
export const description = Commands.Tickets.Close.Description
export const category = Commands.Tickets.Close.Category
export const slashData = new SlashCommandBuilder()
  .setName(name)
  .setDescription(description)
  .addStringOption(o => o.setName('reason').setDescription('Reason to close the ticket').setRequired(false));

export const runSlash: RunSlashFunction = async (client, interaction) => {
  await closeTicket(client, interaction);
}
