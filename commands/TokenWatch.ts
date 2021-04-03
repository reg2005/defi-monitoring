import { BaseCommand } from '@adonisjs/core/build/standalone'
import axios from 'axios'
import Redis from '@ioc:Adonis/Addons/Redis'
import Decimal from 'decimal.js'
import Logger from '@ioc:Adonis/Core/Logger'
import { TGSendMessage } from 'App/Services/Telegram'
import { sleep } from 'App/Services/utils'
import { getTXInfo } from 'LibsTs/bscTXPriceParse'
import {
  BSCTokenResponse200Interface,
  BSCExtendedTokenOneItemInterface,
  TokenConfigs,
  TokenConfigItem,
} from 'Contracts/types'
import Env from '@ioc:Adonis/Core/Env'
const IS_DEV = Env.get('NODE_ENV') !== 'production'
export default class TokenWatch extends BaseCommand {
  public static needsApplication = true
  public static settings = {
    loadApp: true,
  }
  /**
   * Command Name is used to run the command
   */
  public static commandName = 'token:watch'

  /**
   * Command Name is displayed in the "help" output
   */
  public static description = ''
  public async run() {
    const tokensConfig: TokenConfigs = [
      {
        //sALPACA - так можно оставлять комменты
        ownerAddress: '0x3Ee4de968E47877F432226d6a9A0DAD6EAc6001b',
        tokenAddress: '0x6f695bd5ffd25149176629f8491a5099426ce7a7',
        eventIfGreater: 1000,
      },
    ]
    let i = 1
    for (;;) {
      Logger.info(`${i} iteration`)
      try {
        await Promise.all(
          tokensConfig.map(async (config) => {
            await this.runHelper(config)
          })
        )
      } catch (error) {
        Logger.error(error)
      }
      await sleep('500ms')
      i++
    }
  }
  public async runHelper(config: TokenConfigItem) {
    const messages: string[] = []
    const cond = config.eventIfGreater //>= SELL || BUY

    const ownerAddress = config.ownerAddress.toLowerCase()
    const { data } = await axios.get<BSCTokenResponse200Interface>(`https://api.bscscan.com/api`, {
      params: {
        module: 'account',
        action: 'tokentx',
        contractaddress: config.tokenAddress,
        page: 1,
        offset: 20,
        sort: 'desc',
        apikey: '2F28CTPNMTBJZT7G55RGTW8WJEGF4MEV31',
      },
    })
    for (const resItem of data.result) {
      try {
        // console.log(resItem)
        const findedItem = await Redis.get(`${resItem.hash}`)
        // const item = null
        if (!findedItem) {
          const v = resItem.value
          const humanValue = parseFloat(
            `${v.slice(0, -parseInt(resItem.tokenDecimal))}.${v.slice(
              v.length - parseInt(resItem.tokenDecimal)
            )}`
          )
          const txInfo = await getTXInfo(resItem.hash)
          const item: BSCExtendedTokenOneItemInterface = {
            type: null,
            ...resItem,
            humanValue,
            ...txInfo,
          }
          if (resItem.from.toLowerCase() === ownerAddress) {
            item.type = 'BUY'
          } else if (resItem.to.toLowerCase() === ownerAddress) {
            item.type = 'SELL'
          }

          if (item.type !== null && new Decimal(item.humanValue).greaterThanOrEqualTo(cond)) {
            Logger.info('addMessage for ' + resItem.hash)
            messages.push(
              `${item.type === 'SELL' ? '🔴' : '🟢'} ${resItem.tokenSymbol} ${Math.round(
                item.humanValue
              )} >= ${cond}, цена $${item.priceInUSD}  <a href="https://bscscan.com/tx/${
                resItem.hash
              }">Транзакция</a>`
            )
          }
          await Redis.set(`${item.hash}`, JSON.stringify(item))
        }
      } catch (error) {
        Logger.error(error)
      }
    }
    if (messages.length) {
      // if (!IS_DEV) {
      await TGSendMessage(messages.join('\n\n- - - - - - -\n\n'))
      // } else {
      console.log(messages)
      // }
    }
  }
}
