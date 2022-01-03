import { SlashCommandBuilder } from '@discordjs/builders';
import { GuildMember, MessageEmbed } from 'discord.js';

import { Command, RunSlashFunction } from '../../Interfaces/Commands'
import * as Commands from '../../Configs/commands.json';
import { createEmbed } from '../../Modules/Utils';
import { getAccount } from '../../Interfaces/Account';

export const name = Commands.Economy.Balance.Name
export const description =Commands.Economy.Balance.Description
export const category =Commands.Economy.Balance.Category
export const slashData = new SlashCommandBuilder()
  .setName(name)
  .setDescription(description)

export const runSlash: RunSlashFunction = async (client, interaction) => {
  const acc = await getAccount(interaction.member as GuildMember);
  await interaction.reply({
    embeds: [
      await createEmbed({
        options: Commands.Economy.Balance.Response.Embed,
        variables: [
          { searchFor: /{timestamp}/g, replaceWith: new Date() },
          { searchFor: /{wallet}/g, replaceWith: acc.balance.wallet },
          { searchFor: /{bank}/g, replaceWith: acc.balance.bank }
        ]
      }, interaction.member as GuildMember)
    ]
  });
}
