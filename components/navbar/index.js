import { useState, useEffect } from 'react'
import { useSelector, shallowEqual } from 'react-redux'
import _ from 'lodash'

import Logo from './logo'
import DropdownNavigations from './navigations/dropdown'
import Navigations from './navigations'
import Search from './search'
import Gas from './gas'
import Theme from './theme'
import MargueeTokens from '../marquee-tokens'
import { getTokensMarkets } from '../../lib/api/coingecko'
import { toArray } from '../../lib/utils'
import cvmlogo from '../../public/icons/cvm_icons_favicon-32x32.png';

export default () => {
  const { trending } = useSelector(state => ({trending: state.trending}), shallowEqual)
  const { trending_data } = { ...trending }
  const [tokens, setTokens] = useState(null)

  useEffect(
    () => {
      const getData = async () => {
        if (trending_data) {
          const cvmToken = {
            id: "cvm",
            // price: 0.1,
            name: "CVM", 
            image: cvmlogo.src, 
            symbol: "CVM", 
            large: cvmlogo.src, 
            current_price: 0.1, 
            price_change_percentage_24h: 0,
            market_cap_rank: null, 
            market_cap: null 
          };
          const response = await getTokensMarkets({ vs_currency: 'usd', ids: toArray(trending_data).map(d => d.item?.id).join(','), price_change_percentage: '24h' })
          const combinedData = [
            cvmToken, 
            ...toArray(trending_data).map(d => ({
              ...d,
              ...toArray(response).find(_d => _d.id === d.item?.id) 
            })).filter((token, index) => index < 9) 
        ];  
  
        setTokens(combinedData); 
        }
      }

      getData()
      const interval = setInterval(() => getData(), 3 * 60 * 1000)
      return () => clearInterval(interval)
    },
    [trending_data],
  )

  return (
    <>
      <div className="navbar 3xl:pt-6">
        <div className="navbar-inner w-full h-20 flex items-center justify-between sm:space-x-4">
          <div className="flex items-center">
            <Logo />
            <DropdownNavigations />
          </div>
          <div className="flex items-center justify-center">
            <Navigations />
          </div>
          <div className="flex items-center justify-end 3xl:space-x-4">
            <Search />
            <Gas />
            <Theme />
          </div>
        </div>
      </div>
      {toArray(tokens).length > 0 && (
        <div className="pb-3 px-3">
          <MargueeTokens data={tokens} />
        </div>
      )}
    </>
  )
}