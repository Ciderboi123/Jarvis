import Discord from 'discord.js';
import glob from 'glob';
import consola, { Consola, FancyReporter, BasicReporter, WinstonReporter } from 'consola';
import { promisify } from 'util';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { Collection, Db, MongoClient } from 'mongodb';

import { Command } from './Interfaces/Commands'
import { Event } from './Interfaces/Event'
import { Ticket } from './Interfaces/Ticket';
import { Account } from './Interfaces/Account'
import { GuildConfig } from './Interfaces/GuildConfig'

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
  private ticketStruct: Ticket = {
    guild: 'ignore',
    channel: 'ignore',
    author: 'ignore',
    closingReason: 'ignore',
    closeAt: 'ignore',
    closeBy: 'ignore'
  };

  private economyStruct: Account = {
    user: 'ignore',
    balance: {
      wallet: 'ignore',
      bank: 'ignore'
    }
  }

  private guildStuct: GuildConfig = {
    Id: 'ignore',
    Name: 'ignore',
    MemberCount: 'any',
    Config: {
      ignore: 'ignore'
    }
  };

  public async connectMongoose() {
    // this.logger.info('Connecting to Mongodb...')
    if (this.database) return;
    this.databaseClient = new MongoClient(this.config.Settings.MongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
    this.databaseClient.connect();
    this.database = this.databaseClient.db('Service-Bot');

    // Guild
    this.databaseCollectionGuild = this.database.collection('Guild');
    await this.databaseCollectionGuild.insertOne(this.guildStuct);
    await this.databaseCollectionGuild.deleteOne(this.guildStuct);

    // Economy
    this.databaseCollectionEconomy = this.database.collection('Economy');
    await this.databaseCollectionEconomy.insertOne(this.economyStruct);
    await this.databaseCollectionEconomy.deleteOne(this.economyStruct);

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
      this.logger.info(`Registering Slash commands in ${guild.name}`)
    } catch (error) {
      this.logger.error(error.message)
    }

    await this.createPerServerConfig();
  }

  public async registerSlashCommand(): Promise<void> {
    // if (!this.slashCmdData) return;
    try {
      for (let guilds of this.guilds.cache) {
        const guild = guilds[1]
        this._rest.put(Routes.applicationGuildCommands(this.user.id, guild.id), {
          body: this.slashCmdData
        });
        this.logger.info(`${'[' + colors.FgCyan + 'Slash Cmd' + colors.Reset + ']'} Registering Slash commands in ${guild.name}`)
      }
    } catch (error) {
      this.logger.error(error.message)
    }

    await this.createPerServerConfig();
  }

  private async createPerServerConfig() {



    for (let guilds of this.guilds.cache) {
      const guild = guilds[1]
      let _ = await this.databaseCollectionGuild.findOne({
        Id: guild.id,
        Name: guild.name,
        MemberCount: guild.memberCount.toString(),
        Config: 'MAKE CONFIG'
      } as GuildConfig)
  
      this.logger.info(`${'[' + colors.FgGreen + 'Config' + colors.Reset + ']'} Adding ${guild.name} to database`)
      await this.databaseCollectionGuild.insertOne({
        Id: guild.id,
        Name: guild.name,
        MemberCount: guild.memberCount.toString(),
        Config: 'MAKE CONFIG'
      } as GuildConfig)
    }
  }
}


export { Bot };