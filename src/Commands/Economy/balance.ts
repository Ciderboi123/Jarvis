import { Command, RunSlashFunction } from '../../Interfaces/Commands'
import { SlashCommandBuilder } from '@discordjs/builders';
import { GuildMember } from 'discord.js';

import { createAccount } from '../../Modules/Economy'
import * as Commands from '../../Configs/commands.json';
import { createEmbed } from '../../Modules/Utils';

export const name = Commands.Economy.Balance.Name
export const description = Commands.Economy.Balance.Description
export const category = Commands.Economy.Balance.Category
export const slashData = new SlashCommandBuilder()
  .setName(name)
  .setDescription(description)
  .addUserOption(o => o.setName('user').setDescription('the user you want to see balance'))

export const runSlash: RunSlashFunction = async (client, interaction) => {
  const user = interaction.options.getMember('user') as GuildMember || interaction.member as GuildMember;
  const account = await createAccount(user);
  if (client.user == user.user) return await interaction.reply({
    embeds: [
      await createEmbed({
        options: {
          Title: 'Balance',
          Description: `Wallet: \\💵999,999,999,999\nBank: \\💵999,999,999,999`,
          Footer: {
            Text: user.user.username,
            IconUrl: user.avatarURL({ dynamic: true }),
          },
          Timestamp: new Date()
        }
      }, user)
    ]
  })
  if (user.user.bot) return await interaction.reply('No seeing balance of a bot.')
  await interaction.reply({
    embeds: [
      await createEmbed({
        options: Commands.Economy.Balance.Response.Embed.Balance,
        variables: [
          { searchFor: /{timestamp}/g, replaceWith: new Date() },
          { searchFor: /{wallet}/g, replaceWith: account.balance.wallet },
          { searchFor: /{bank}/g, replaceWith: account.balance.bank },
        ]
      }, user)
    ]
  })
}
