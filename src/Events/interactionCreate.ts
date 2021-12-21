import { CommandInteraction, GuildMember, ButtonInteraction } from 'discord.js';

import { RunFunction } from '../Interfaces/Event';
import { hasRole, findRole, createEmbed, parseVariables } from '../Modules/Utils'

import { Presets } from '../Configs/message.json';

export const name = 'interactionCreate';

export const run: RunFunction = async (bot, interaction: CommandInteraction) => {
	let permissions = [];

	if (interaction.isCommand()) {
		const command = bot.commands.find(
			(x) => x.name.toLowerCase() == interaction.commandName.toLowerCase()
		);
		if (!command) {
			for (let cmds of bot.guilds.cache) {
				let cmd = cmds[1]
				cmd.commands.cache.find(x => x.name.toLowerCase() == interaction.commandName)
				if (cmd) cmd.delete()
			}

			return interaction.reply({
				content: 'This command no longer exists.',
				ephemeral: true,
			});
		}
		let member = interaction.member as GuildMember;
		if (command.permission) {
			if (!command.permission[0]) command.permission[0] = '@everyone'
			for (const role of command.permission) {
				if (!hasRole(findRole(role, member.guild), member)) permissions.push(false)
				else permissions.push(true)
			}
		} else {
			command.permission = ['@everyone']
			for (const role of command.permission) {
				if (!hasRole(findRole(role, member.guild), member)) permissions.push(false)
				else permissions.push(true)
			}
		} 
		
		if (permissions.includes(true)) command.runSlash(bot, interaction);
		else interaction.reply({
			embeds: [
				await createEmbed({
					options: Presets.NoPermission,
					variables: [
						{ searchFor: /{roles}/g, replaceWith: command.permission.map(r => { let _r = findRole(r, interaction.guild); if (_r) return `<@&${_r.id}>` }).join(", ") },
						{ searchFor: /{timestamp}/g, replaceWith: new Date() }
					]
				}, member)
			]
		})
	}
};
