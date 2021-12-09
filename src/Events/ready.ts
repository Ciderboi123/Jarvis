import { Event, RunFunction } from '../Interfaces/Event';
import packageJSON from '../../package.json';

import { Colors as colors } from '../Modules/Utils';

export const run: RunFunction = async (client) => {
	const { logger } = client;
	logger.info(
		`Commands: Loaded ${colors.FgBlue + client.commands.size.toString() + colors.Reset
		} Commands`
	);
	logger.info(
		`Events:   Loaded ${colors.FgBlue + client.events.size.toString() + colors.Reset
		} Events`
	);

	await client.registerSlashCommand();
	logger.info(
		colors.FgGreen + 'Bot is now' + colors.Bright + ' Online' + colors.Reset
	);
};

export const name = 'ready';
