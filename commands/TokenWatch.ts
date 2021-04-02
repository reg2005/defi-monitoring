import { BaseCommand } from '@adonisjs/core/build/standalone'
import axios from 'axios'
import Redis from '@ioc:Adonis/Addons/Redis'
import Decimal from 'decimal.js'
import { TGSendMessage } from 'App/Services/Telegram'
import { sleep } from 'App/Services/utils'
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
    let i = 1
    for (;;) {
      console.log(`${i} iteration`)
      await this.runHelper()
      await sleep('500ms')
      i++
    }
  }
  public async runHelper() {
    const messages: string[] = []
    const cond = 1000 //>= SELL || BUY

    const ownerAddress = '0x3Ee4de968E47877F432226d6a9A0DAD6EAc6001b'.toLowerCase()
    const { data } = await axios.get(`https://api.bscscan.com/api`, {
      params: {
        module: 'account',
        action: 'tokentx',
        contractaddress: '0x6f695bd5ffd25149176629f8491a5099426ce7a7',
        page: 1,
        offset: 20,
        sort: 'desc',
        apikey: '2F28CTPNMTBJZT7G55RGTW8WJEGF4MEV31',
      },
    })
    for (const resItem of data.result) {
      // console.log(resItem)
      const item = await Redis.get(`${resItem.hash}`)
      if (!item) {
        resItem.type = null
        const v = resItem.value
        resItem.humanValue = `${v.slice(0, -parseInt(resItem.tokenDecimal))}.${v.slice(
          v.length - parseInt(resItem.tokenDecimal)
        )}`
        if (resItem.from.toLowerCase() === ownerAddress) {
          resItem.type = 'BUY'
        } else if (resItem.to.toLowerCase() === ownerAddress) {
          resItem.type = 'SELL'
        }

        if (resItem.type !== null && new Decimal(resItem.humanValue).greaterThanOrEqualTo(cond)) {
          console.log('pushMessage', resItem)
          messages.push(
            `${resItem === 'SELL' ? '🔴' : '🟢'} Quantity >= ${cond}, сумма ${Math.round(
              resItem.humanValue
            )} <a href="https://bscscan.com/tx/${resItem.hash}">Открыть</a>`
          )
        }
        resItem.humanValue = resItem.value
        await Redis.set(`${resItem.hash}`, JSON.stringify(resItem))
      }
    }
    if (messages.length) {
      await TGSendMessage(messages.join('\n\n- - - - - - -\n\n'))
    }
  }
}
