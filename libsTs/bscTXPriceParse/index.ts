import axios from 'axios'
import Logger from '@ioc:Adonis/Core/Logger'
export const getTXInfo = async (txid: string) => {
  let html = ''
  try {
    html = await getTransactionHTML(txid)
    return { priceInUSD: getPriceFromHTML(html) }
  } catch (e) {
    Logger.error(e)
  }
  return { priceInUSD: getPriceFromHTML(html) }
}
export const getTransactionHTML = async (txid: string): Promise<string> => {
  const { data } = await axios.get(`https://bscscan.com/tx/${txid}`)
  return data as string
}
export const getPriceFromHTML = (html: string) => {
  const regex = /Price : \$(\d+(\.\d{1,2}))/gm
  const result = regex.exec(html)
  return result ? parseFloat(result[1]) : null
}
