import { Command, RunSlashFunction } from '../../Interfaces/Commands'
import { SlashCommandBuilder } from '@discordjs/builders';
import { GuildMember, TextChannel, CategoryChannel } from 'discord.js';

import * as Config from '../../Configs/config.json';
import * as Commands from '../../Configs/commands.json';
import { createEmbed } from '../../Modules/Utils';
import { createTicket } from '../../Modules/Tickets';

export const name = Commands.Tickets.New.Name
export const description = Commands.Tickets.New.Description
export const category = Commands.Tickets.New.Category
export const slashData = new SlashCommandBuilder()
  .setName(name)
  .setDescription(description)

export const runSlash: RunSlashFunction = async (client, interaction) => {
  await createTicket(client, interaction);
}
