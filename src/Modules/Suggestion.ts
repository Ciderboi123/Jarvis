import { CommandInteraction, TextChannel, Formatters, GuildMember } from 'discord.js'
import { MessageActionRow, MessageButton, ButtonInteraction } from 'discord.js';

import { client as Bot } from '../index';
import { createEmbed, calculateButton } from './Utils'

import * as Commands from '../Configs/commands.json'

export async function createSuggestion(client: typeof Bot, interaction: CommandInteraction) {
  const channel = client.channels.cache.get(client.config.Module.Suggestions.SuggestionChannel) as TextChannel;
  const idea = interaction.options.getString('idea');
  const row = new MessageActionRow().addComponents([
    calculateButton(Commands.Suggestion.Suggest.Response.Button.Accept),
    calculateButton(Commands.Suggestion.Suggest.Response.Button.Decline),
    calculateButton(Commands.Suggestion.Suggest.Response.Button.Delete)
  ])

  let msg = await channel.send({
    embeds: [
      await createEmbed({
        options: Commands.Suggestion.Suggest.Response.Embed.SuggestionSent,
        variables: [
          { searchFor: /{idea}/g, replaceWith: Formatters.codeBlock(idea) }
        ]
      }, interaction.member as GuildMember)
    ],
    components: [row]
  })

  const row2 = new MessageActionRow().addComponents([
    calculateButton(Commands.Suggestion.Suggest.Response.Button.GoToSuggestion, [
      { searchFor: /{guildID}/g, replaceWith: interaction.guildId },
      { searchFor: /{channelID}/g, replaceWith: client.config.Module.Suggestions.SuggestionChannel },
      { searchFor: /{messageID}/g, replaceWith: msg.id },
    ])
  ])


  await interaction.reply({ embeds: [await createEmbed({ options: Commands.Suggestion.Suggest.Response.Embed.SuggestionNew }, interaction.member as GuildMember)], ephemeral: true, components: [row2] });
}

export function acceptSuggesetion(client: typeof Bot, interaction: ButtonInteraction) {
  interaction.editReply({ content: 'accepted' });
  const msg = interaction.channel.messages.cache.get(interaction.message.id)
  msg.edit({
    embeds: [
      msg.embeds[0].setTitle(`Accepted | ${Commands.Suggestion.Suggest.Response.Embed.SuggestionSent.Title}`)
    ]
  })
}

export function declineSuggesetion(client: typeof Bot, interaction: ButtonInteraction) {
  interaction.editReply({ content: 'declined' });
  const msg = interaction.channel.messages.cache.get(interaction.message.id)
  msg.edit({
    embeds: [
      msg.embeds[0].setTitle(`Declined | ${Commands.Suggestion.Suggest.Response.Embed.SuggestionSent.Title}`)
    ]
  })
}

export function deleteSuggesetion(client: typeof Bot, interaction: ButtonInteraction) {
  interaction.editReply({ content: 'deleted' });
  const msg = interaction.channel.messages.cache.get(interaction.message.id)
  msg.delete()
}