import { Guild } from 'discord.js'

import { Event, RunFunction } from '../Interfaces/Event';
import packageJSON from '../../package.json';
import { Colors as colors } from '../Modules/Utils';

export const run: RunFunction = async (client, guild: Guild) => {
  await client.registerSlashCommandGuild(guild);
};

export const name = 'guildCreate';
