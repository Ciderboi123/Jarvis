import { Command, RunSlashFunction } from '../../Interfaces/Commands'
import { SlashCommandBuilder } from '@discordjs/builders';
import { GuildMember } from 'discord.js';

import { giveBalance } from '../../Modules/Economy'
import * as Commands from '../../Configs/commands.json';
import { createEmbed } from '../../Modules/Utils';

export const name = Commands.Economy.Give.Name
export const description = Commands.Economy.Give.Description
export const category = Commands.Economy.Give.Category
export const slashData = new SlashCommandBuilder()
  .setName(name)
  .setDescription(description)
  .addUserOption(o => o.setName('to').setDescription('the user you want to send money').setRequired(true))
  .addIntegerOption(o => o.setName('amount').setDescription('the amount you want to send').setRequired(true))

export const runSlash: RunSlashFunction = async (client, interaction) => {
  const to = interaction.options.getMember('to') as GuildMember;
  const amount = interaction.options.getInteger('amount');
  await giveBalance(interaction.member as GuildMember, to, amount, interaction)
}
