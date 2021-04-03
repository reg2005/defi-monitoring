import axios from 'axios'
import Cheerio from 'cheerio'
import { DataItemInterface, TypeTypes } from 'Contracts/types'
import Decimal from 'decimal.js'
export const getTXInfo = async (txid: string, type: TypeTypes) => {
  let html = ''
  try {
    html = await getTransactionHTML(txid)
    return getPriceFromHTML(html, type)
  } catch (e) {
    console.error(e)
  }
  return getPriceFromHTML(html)
}
export const getTransactionHTML = async (txid: string): Promise<string> => {
  const { data } = await axios.get(`https://bscscan.com/tx/${txid}`)
  return data as string
}
const getPriceFromString = (data: string) => {
  //https://regex101.com/r/3AOqVC/1
  const res = /\d+(\,\d*)?(\.\d*)?/gm.exec(data)
  return res ? res[0].replace(',', '') : null
}
export const getPriceFromHTML = (html: string, type: TypeTypes) => {
  const regex = /Price : \$(\d+(\.\d{1,2}))/gm
  const result = regex.exec(html)
  const priceInUSD = result ? parseFloat(result[1]) : null

  const $ = Cheerio.load(html)
  const data: DataItemInterface[] = []
  $('ul#wrapperContent .media-body')
    .first()
    .map(function () {
      const d = $(this).children('span,a,img')
      data.push({
        price: getPriceFromString(d.eq(1).text()),
        name: $(this).find('a').first().text(),
      })
      data.push({
        price: getPriceFromString(d.eq(5).text()),
        name: $(this).find('a').last().text(),
      })
    })
  let pairPrice: string = ''
  let pairName: string = ''

  if (data.length === 2) {
    const a = data[0]['price'] || 0
    const b = data[1]['price'] || 0
    if (type === 'BUY') {
      pairPrice = new Decimal(a).div(b).toFixed(4)
    } else {
      pairPrice = new Decimal(b).div(a).toFixed(4)
    }
    pairName = (data[0]['name'] || '') + ' - ' + (data[1]['name'] || '')
  }

  return {
    data,
    pairPrice,
    pairName,
    priceInUSD,
  }
}
