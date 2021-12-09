import { CommandInteraction, CategoryChannel, GuildMember } from 'discord.js';
import { MessageActionRow, MessageButton } from 'discord.js';

import { createEmbed, ButtonOptions, calculateButton } from '../Modules/Utils'
import * as Commands from '../Configs/commands.json'
import { client as Bot } from '../index';
import * as Config from '../Configs/config.json';

export async function createTicket(client: typeof Bot, interaction: CommandInteraction) {
  const category = interaction.guild.channels.cache.get(Config.Module.Tickets.TicketCategory) as CategoryChannel
  const channel = await category.createChannel(Config.Module.Tickets.TicketName.replace(/{user}/g, interaction.user.username));
  const row = new MessageActionRow();
  for (let _btn in Commands.Tickets.New.Response.Buttons) {
    const buttonSettings: ButtonOptions = Commands.Tickets.New.Response.Buttons[_btn]
    const button = calculateButton(buttonSettings, [
      { searchFor: /{guildID}/g, replaceWith: channel.guildId },
      { searchFor: /{channelID}/g, replaceWith: channel.id }
    ])
    row.addComponents([button]);
  }
  let msg = await channel.send(`<@${interaction.user.id}>`)
  await channel.send({
    embeds: [
      await createEmbed({
        options: Commands.Tickets.New.Response.Embed.NewTicketMessage,
        variables: [
          { searchFor: /{timestamp}/g, replaceWith: new Date() }
        ]
      }, interaction.member as GuildMember)
    ]
  }); 
  await msg.delete();

  await interaction.reply({
    embeds: [
      await createEmbed({
        options: Commands.Tickets.New.Response.Embed.TicketCreatedMessage,
        variables: [
          { searchFor: /{channel}/g, replaceWith: `<#${channel.id}>` },
          { searchFor: /{timestamp}/g, replaceWith: new Date() }
        ]
      }, interaction.member as GuildMember)
    ], ephemeral: true,
    components: [row]
  });
}