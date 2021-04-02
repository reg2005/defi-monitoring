import TG from 'telegraf'
import { promises as fs, createReadStream } from 'fs'
import Env from '@ioc:Adonis/Core/Env'
import Application from '@ioc:Adonis/Core/Application'
import { ElkLogger } from './utils'
const TG_CHANNELID = Env.get('TG_BOT_CHANNELID')
const TGClient = new TG(Env.get('TG_BOT_APIKEY'))
export const TGSendMessage = async (
  message: string,
  {
    fileName = '',
    fileContent = '',
    filePath = '',
  }: { fileName?: string; fileContent?: string; filePath?: string } = {}
) => {
  try {
    await TGClient.telegram.sendMessage(TG_CHANNELID, message, {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    })
    if (fileName && !filePath) {
      filePath = Application.tmpPath(`${fileName}`)
      await fs.writeFile(filePath, fileContent)
    }
    if (filePath) {
      ElkLogger.log('TGSendMessage', filePath)
      await TGClient.telegram.sendDocument(TG_CHANNELID, { source: filePath })
      await fs.unlink(filePath)
    }
  } catch (e) {
    ElkLogger.error('TGSendMessage', `Не смогли отправить сообщение в telegram`, e.message)
  }
  return true
}
