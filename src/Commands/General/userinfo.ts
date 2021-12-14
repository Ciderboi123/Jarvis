import { Command, RunSlashFunction } from '../../Interfaces/Commands'
import { SlashCommandBuilder } from '@discordjs/builders';
import { User, GuildMember, MessageEmbed, MessageActionRow } from 'discord.js';
import { resolveUser, createEmbed, parseVariables, calculateButton } from '../../Modules/Utils'

import Config from '../../Configs/config.json'
import Commands from '../../Configs/commands.json'

export const name = Commands.General.UserInfo.Name
export const description = Commands.General.UserInfo.Description
export const category = Commands.General.UserInfo.Category
export const slashData = new SlashCommandBuilder()
  .setName(name)
  .setDescription(description)
  .addUserOption(o => o.setName('user').setDescription('The user you are looking for').setRequired(true))

export const permission = Commands.General.UserInfo.Permission

export const runSlash: RunSlashFunction = async (client, interaction) => {
  const member: GuildMember = interaction.options.getMember('user') as GuildMember ? interaction.options.getMember('user') as GuildMember : interaction.member as GuildMember;
  const user: User = interaction.options.getUser('user') as User ? interaction.options.getUser('user') as User : interaction.user as User;

  await interaction.reply({
    embeds: [
      await createEmbed({
        options: Commands.General.UserInfo.Response.Embed,
        variables: [
          { searchFor: /{user}/g, replaceWith: user.username },
          { searchFor: /{nickname}/g, replaceWith: member.nickname ? member.nickname : user.username},
          { searchFor: /{user-smol-pfp}/g, replaceWith: user.avatarURL({dynamic:true})},
          { searchFor: /{id}/g, replaceWith: user.id },
          { searchFor: /{tag}/g, replaceWith: user.discriminator },
          { searchFor: /{isBot}/g, replaceWith: user.bot },
          { searchFor: /{isAdmin}/g, replaceWith: member.permissions.has('ADMINISTRATOR') },
          { searchFor: /{acc-created}/g, replaceWith: user.createdAt.toDateString() },
          { searchFor: /{join-on}/g, replaceWith: member.joinedAt.toDateString() },
          { searchFor: /{role-count}/g, replaceWith: member.roles.cache.size - 1 },
          { searchFor: /{role-top}/g, replaceWith: member.roles.highest },
          { searchFor: /{timestamp}/g, replaceWith: new Date() },
        ]
      }, member)
    ]
  })
}
