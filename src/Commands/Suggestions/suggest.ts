import { Command, RunSlashFunction } from '../../Interfaces/Commands'
import { SlashCommandBuilder } from '@discordjs/builders';
import { TextChannel } from 'discord.js';

import { createSuggestion } from '../../Modules/Suggestion';
import * as Commands from '../../Configs/commands.json';
import { createEmbed } from '../../Modules/Utils';

export const name = Commands.Suggestion.Suggest.Name
export const description = Commands.Suggestion.Suggest.Description
export const category = Commands.Suggestion.Suggest.Category
export const slashData = new SlashCommandBuilder()
  .setName(name)
  .setDescription(description)
  .addStringOption(o => o.setName('idea').setDescription('The idea you want to propose').setRequired(true))

export const runSlash: RunSlashFunction = async (client, interaction) => {
  await createSuggestion(client, interaction);
}
