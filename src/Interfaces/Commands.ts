import { Bot } from '../Client';
import { Message, CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

export interface RunSlashFunction {
	(client: Bot, interaction: CommandInteraction): Promise<void>;
}

export interface Command {
	name: string;
	description: string;
	permission: string[];
	category: string;
	slashData: SlashCommandBuilder;
	runSlash: RunSlashFunction;
}
