import { Bot } from './Client';
import { Colors as colors } from './Modules/Utils'

import packageJSON from '../package.json'

export const client = new Bot();
client.logger.info('#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=#');
client.logger.info('');
client.logger.info(`              • Server Management Bot ${packageJSON.version} is now Online! •`);
client.logger.info('');
client.logger.info('          • Join our Discord Server for any Issues/Custom Bots •');
client.logger.info(`                     ${colors.FgGreen + colors.Underscore + 'https://discord.gg/EgeZxGg6ev' + colors.Reset}`);
client.logger.info('');
client.logger.info('#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=#');
client.start();