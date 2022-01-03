import { GuildMember, CommandInteraction, ButtonInteraction, Interaction, SelectMenuInteraction } from 'discord.js';

import { client } from '../index';
import { createEmbed } from '../Modules/Utils'

export interface Account {
  user: number,
  balance: {
    wallet: number,
    bank: number,
  },
}

const struct: Account = {
  user: 0,
  balance: {
    bank: 0,
    wallet: 0
  }
}

class InvalidAmount extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidAmount';
    Error.captureStackTrace(this, InvalidAmount)
  };
}

export async function create() {
  client.databaseCollectionEconomy = client.database.collection('Economy');
  await client.databaseCollectionEconomy.insertOne(struct);
  await client.databaseCollectionEconomy.deleteOne(struct);
}

export async function getAccount(user: GuildMember): Promise<Account> {
  let account: Account;
  let defaultData: Account = {
    user: Number(user.id),
    balance: {
      bank: 100,
      wallet: 100
    }
  }
  let _user: Account = await client.databaseCollectionEconomy.findOne({ user: user.id });
  if (!_user) {
    await client.databaseCollectionEconomy.insertOne(defaultData)
    account = defaultData;
  } else {
    account = _user
  }

  return account
}

export async function updateAccount(user: GuildMember, amount: number) {
  let acc = await getAccount(user);
  if (amount < 1) return await createEmbed({ options: { Title: '❌ Cannnot give money lower than `1`.' } }, user);
  await client.databaseCollectionEconomy.updateOne(acc, {
    $set: {
      user: acc.user,
      balance: {
        wallet: acc.balance.wallet - amount,
        bank: acc.balance.bank,
      }
    }
  })
  return true
}