import { GuildMember, CommandInteraction } from 'discord.js';

import { createEmbed } from './Utils'
import { Account } from '../Interfaces/Account'
import { client } from '../index'

export async function createAccount(user: GuildMember): Promise<Account> {
  let account: Account;
  let defaultData: Account = {
    user: user.id,
    balance: {
      bank: '100',
      wallet: '100'
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
