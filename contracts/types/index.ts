interface BSCResultTokenOneItemInterface {
  blockNumber: string
  timeStamp: string
  hash: string
  nonce: string
  blockHash: string
  from: string
  contractAddress: string
  to: string
  value: string
  tokenName: string
  tokenSymbol: string
  tokenDecimal: string
  transactionIndex: string
  gas: string
  gasPrice: string
  gasUsed: string
  cumulativeGasUsed: string
  input: string
  confirmations: string
}
export interface DataItemInterface {
  price: string | null
  name: string | null
}
export interface BSCExtendedTokenOneItemInterface extends BSCResultTokenOneItemInterface {
  type: 'SELL' | 'BUY' | null
  humanValue: number
  priceInUSD: number | null
  data: DataItemInterface[]
  pairPrice: string
  pairName: string
}

export interface BSCTokenResponse200Interface {
  result: BSCResultTokenOneItemInterface[]
}
export interface TokenConfigItem {
  ownerAddress: string
  tokenAddress: string
  eventIfGreater: number
}
export type TokenConfigs = TokenConfigItem[]
export type TypeTypes = 'BUY' | 'SELL' | null
