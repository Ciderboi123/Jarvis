import { MongoError } from 'mongodb';

import { Guild } from 'discord.js';
import { client } from '../index'

export interface Config {
  [key: string]: any
}

export interface GuildConfig {
  Id: string,
  Name: string,
  MemberCount: string,
  Config: Config
};

const struct: GuildConfig = {
  Id: 'ignore',
  Name: 'ignore',
  MemberCount: 'any',
  Config: {
    ignore: 'ignore'
  }
}

export async function getConfig(guild: Guild): Promise<GuildConfig> {
  return await client.databaseCollectionGuild.findOne({ Id: guild.id });
}

export async function insertConfig(guild: Guild): Promise<boolean> {
  if (getConfig(guild)) return false;
  else {
    await client.databaseCollectionGuild.insertOne({
      Name: guild.name,
      Id: guild.id,
      MemberCount: guild.memberCount,
      Config: typeof client.config
    })
    return true;
  }
}

export async function create() {
  //if (client.database.listCollections({ name: 'Guild' }).next(async (_err, collinfo) => { if (collinfo) return false; }) != null) return;
  let dbs = await client.database.listCollections().toArray();
  if (!dbs.map(c => c.name == 'Guild')) await client.database.createCollection('Guild').catch((err) => { if (err) return; });
  client.databaseCollectionGuild = client.database.collection('Guild');
  // await client.databaseCollectionGuild.insertOne(struct);
  // await client.databaseCollectionGuild.deleteOne(struct);
}