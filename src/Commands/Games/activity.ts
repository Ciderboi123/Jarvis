import { Command, RunSlashFunction } from '../../Interfaces/Commands'
import { SlashCommandBuilder } from '@discordjs/builders';
import { GuildMember } from 'discord.js';

import * as Commands from '../../Configs/commands.json';
import { createEmbed } from '../../Modules/Utils';

import request from 'request';

export const name = Commands.Games.Activities.Name
export const description = Commands.Games.Activities.Description
export const category = Commands.Games.Activities.Category
export const slashData = new SlashCommandBuilder()
  .setName(name)
  .setDescription(description)
  .addStringOption(o => o
    .setName('activity')
    .setDescription('The activity to play in voice channel')
    .setRequired(true)
    .addChoices([
      ['betrayal', '773336526917861400'],
      ['youtube', '880218394199220334'],
      ['fishing', '814288819477020702'],
      ['poker', '755827207812677713'],
      ['chess', '832012774040141894'],
      ['letter-tile', '879863686565621790'],
      ['word-snack', '879863976006127627'],
      ['doodle-crew', '878067389634314250'],
      ['spellcast', '852509694341283871'],
      ['awkword', '879863881349087252'],
      ['checkers', '832013003968348200'],
    ]))
  .addChannelOption(o => o
    .setName('channel')
    .setDescription('The channel you want to play the activity')
    .addChannelType(2)
    .setRequired(true));

export const runSlash: RunSlashFunction = async (client, interaction) => {
  const options = {
    method: 'POST',
    url: `https://discord.com/api/v9/channels/${interaction.options.getChannel('channel').id}/invites`,
    headers: {
      Authorization: `Bot ${client.config.Settings.Token}`,
      'Content-Type': 'application/json'
    },
    body: {
      max_age: 0,
      max_uses: 0,
      target_application_id: interaction.options.getString('activity'),
      target_type: 2,
      temporary: false,
      validate: null
    },
    json: true,
  }
  
  request(options, async (error: Error, response: any, body: any) => {
    console.log(body)
    console.log(response)
    if (error) return console.error(error)

    await interaction.reply({
      embeds: [
        await createEmbed({
          options: Commands.Games.Activities.Response.ActivityJoinEmbed,
          variables: [
            { searchFor: /{timestamp}/g, replaceWith: new Date() },
            { searchFor: /{url}/g, replaceWith: `https://discord.gg/${body.code}` },
          ]
        }, interaction.member as GuildMember)
      ]
    });
  })
}
