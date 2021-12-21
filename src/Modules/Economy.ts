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

export async function giveBalance(fromUser: GuildMember, toUser: GuildMember, amount: number, interaction: CommandInteraction) {
  let fromUserAccount = await createAccount(fromUser);
  let toUserAccount = await createAccount(toUser);
  if (amount < 1)
    return await interaction.reply({
      embeds: [
        await createEmbed({
          options: {
            Title: '❌ Cannot give money lower than `1`.'
          }
        }, interaction.member as GuildMember)
      ]
    })
  await client.databaseCollectionEconomy.updateOne(fromUserAccount, {
    $set: {
      user: (await fromUserAccount).user,
      balance: {
        wallet: parseInt((await fromUserAccount).balance.wallet) - amount,
        bank: (await fromUserAccount).balance.bank
      }
    }
  })
  await client.databaseCollectionEconomy.updateOne(toUserAccount, {
    $set: {
      user: (await toUserAccount).user,
      balance: {
        wallet: parseInt((await toUserAccount).balance.wallet) + amount,
        bank: (await toUserAccount).balance.bank
      }
    }
  })
  return await interaction.reply({
    embeds: [
      await createEmbed({
        options: { Title: `✔️ Given ${amount} to ${toUser.user.username}` }
      }, interaction.member as GuildMember)
    ]
  })
}
