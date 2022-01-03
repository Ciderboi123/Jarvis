import Discord from 'discord.js';
import glob from 'glob';
import consola, { Consola, FancyReporter, BasicReporter, WinstonReporter } from 'consola';
import { promisify } from 'util';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { Collection, Db, MongoClient } from 'mongodb';

import { Command } from './Interfaces/Commands'
import { Event } from './Interfaces/Event'
import { Account, create  as accountCreate, updateAccount } from './Interfaces/Account'
import { GuildConfig, create as guildCreate } from './Interfaces/GuildConfig'

import { Colors as colors } from './Modules/Utils';

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

  private _rest: REST;

  public database: Db;
  public databaseCollectionGuild: Collection;
  public databaseCollectionEconomy: Collection;
  public databaseClient: MongoClient;

  private slashCmdData: any[] = [];

  public async connectMongoose() {
    // this.logger.info('Connecting to Mongodb...')
    if (this.database) return;
    this.databaseClient = new MongoClient(this.config.Settings.MongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
    this.databaseClient.connect();
    this.database = this.databaseClient.db('Service-Bot');

    await guildCreate();
    await accountCreate();

    this.logger.info(`Connected to ${colors.FgGreen + 'MongoDB' + colors.Reset}`);
  }

  public async start() {
    this._rest = new REST({ version: '9' }).setToken(this.config.Settings.Token);

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
    await this.connectMongoose();
  }

  public async registerSlashCommandGuild(guild: Discord.Guild): Promise<void> {
    try {
      this._rest.put(Routes.applicationGuildCommands(this.user.id, guild.id), {
        body: this.slashCmdData
      });
    } catch (error) {
      this.logger.error(error.message)
    }

    await this.createOneServerConfig(guild)
  }

  public async registerSlashCommand(): Promise<void> {
    try {
      for (let guilds of this.guilds.cache) {
        const guild = guilds[1]
        this._rest.put(Routes.applicationGuildCommands(this.user.id, guild.id), {
          body: this.slashCmdData
        });
        await this.createOneServerConfig(guild);
      }
    } catch (error) {
      this.logger.error(error.message)
    }
  }

  private async createOneServerConfig(guild: Discord.Guild): Promise<void> {
    if (this.databaseCollectionGuild.find({ Id: guild.id })) return // this.logger.info(`${'[' + colors.FgGreen + 'Config' + colors.Reset + ']'} Already ${guild.name} exists in database`);
    let _ = await this.databaseCollectionGuild.findOne({
      Id: guild.id,
      Name: guild.name,
      MemberCount: guild.memberCount.toString(),
      Config: {
        'config': 'MAKE CONFIG'
      }
    } as GuildConfig)

    await this.databaseCollectionGuild.insertOne({
      Id: guild.id,
      Name: guild.name,
      MemberCount: guild.memberCount.toString(),
      Config: {
        'config': 'MAKE CONFIG'
      }
    } as GuildConfig)
  }
}


export { Bot };