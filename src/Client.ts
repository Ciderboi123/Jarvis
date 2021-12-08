import Discord from 'discord.js';
import glob from 'glob';
import consola, { Consola, FancyReporter, BasicReporter, WinstonReporter } from 'consola';
import { promisify } from 'util';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

import { Command } from './Interfaces/Commands'
import { Event } from './Interfaces/Event'

import Config from './Configs/config.json'

const globPromise = promisify(glob)

class Bot extends Discord.Client {
  public constructor() {
    super({
      intents: Discord.Intents.FLAGS.GUILDS,
      shards: 'auto',
    });
  }

  public logger: Consola = consola;
  public commands: Discord.Collection<string, Command> = new Discord.Collection();
  public events: Discord.Collection<string, Event> = new Discord.Collection();
  public config: typeof Config = Config;

  private slashCmdData: any[] = [];

  public async start() {
    const CommandFiles: string[] = await globPromise(`${__dirname}/Commands/**/*{.ts,.js}`);
    CommandFiles.map(async (value: string) => {
      const file: Command = await import(value);
      if (file.name) {
        this.commands.set(file.name, file);
        this.slashCmdData.push(file.slashData);
      }
    });

    this.logger.debug(this.commands)

    const EventFiles: string[] = await globPromise(`${__dirname}/Events/**/*{.ts,.js}`);
    EventFiles.map(async (value: string) => {
      const file: Event = await import(value);
      this.events.set(file.name, file);
      this.on(file.name, file.run.bind(null, this));
    })

    this.login(this.config.Settings.Token);
  }

  public async registerSlashCommand(): Promise<void> {
    if (!this.slashCmdData) return;
    const rest = new REST({ version: '9' }).setToken(this.config.Settings.Token)
    try {
      rest.put(Routes.applicationGuildCommands(this.user.id, this.config.Settings.GuildID), {
        body: this.slashCmdData
      });
    } catch (error) {
      this.logger.error(error.message)
    }
  }
}

export { Bot };