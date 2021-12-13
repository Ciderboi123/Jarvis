import { CommandInteraction, CategoryChannel, GuildMember, TextChannel } from 'discord.js';
import { MessageActionRow, MessageButton, Interaction, ButtonInteraction } from 'discord.js';
import { PermissionOverwriteOptions } from 'discord.js';

import { createEmbed, ButtonOptions, calculateButton } from '../Modules/Utils'
import * as Commands from '../Configs/commands.json'
import { client as Bot } from '../index';
import * as Config from '../Configs/config.json';

import { Ticket } from '../Interfaces/Ticket';

export async function createTicket(client: typeof Bot, interaction: CommandInteraction | ButtonInteraction) {
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

  await client.databaseCollection.insertOne({
    guild: interaction.guild.id,
    author: interaction.user.id,
    channel: channel.id,
    closingReason: '',
    closeAt: '',
    closeBy: ''
  } as Ticket)

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

export async function closeTicket(client: typeof Bot, interaction: CommandInteraction) {
  const ticket: Ticket = await client.databaseCollection.findOne({ channel: interaction.channel.id })
  if (!ticket) return await interaction.reply({ content: 'ticket was not found in database', ephemeral: true });
  const channel: TextChannel = client.channels.cache.get(ticket.channel) as TextChannel
  const reason = interaction.options.getString('reason') ? interaction.options.getString('reason') : 'not given'

  await channel.delete();
  await client.databaseCollection.updateOne(ticket, {
    $set: {
      closingReason: reason,
      closeAt: new Date().toISOString(),
      closeBy: `${interaction.user.tag}`
    } as Ticket,
  }, {
    upsert: false
  });
}