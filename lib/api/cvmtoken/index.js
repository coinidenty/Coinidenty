import { getTokenPrice } from '../'

export const getTokenData = async  params  => await getTokenPrice({ ...params, path: `/token/cvm` })
export const getTokensData = async  params  => await getTokenPrice({ ...params, path: `/token/tokens` })
