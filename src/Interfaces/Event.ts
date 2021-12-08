import { Bot } from '../Client';
import { Message, CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

export interface RunFunction {
	(client: Bot, ...args: any[]): Promise<void>;
}

export interface Event {
	name: string;
	run: RunFunction;
}
