import Link from 'next/link'
import { useRouter } from 'next/router'
import { useSelector, shallowEqual, useDispatch } from 'react-redux'
import Ticker from 'react-ticker'
import { FiArrowUp, FiArrowDown } from 'react-icons/fi'

import Image from '../image'
import NumberDisplay from '../number'
import { toArray } from '../../lib/utils' 
import { getTokensMarkets, getTrendingSearch } from '../../lib/api/coingecko'
import cvmlogo from '../../public/icons/cvm_icons_favicon-32x32.png';
import { useEffect, useState } from 'react'
import { TRENDING_DATA } from '../../reducers/types'


export default () => {
  const dispatch = useDispatch()

  const { preferences, trending } = useSelector(state => ({ preferences: state.preferences , trending: state.trending }), shallowEqual)
  const { page_visible } = { ...preferences }
  const { trending_data } = { ...trending }
  const [tokens, setTokens] = useState(null)
  // console.log('in marqee token')
  // console.log({trending})

  useEffect(
    () => {
      const getToken = async () => {
        try{
        // console.log('inside gettoken')
        const response = await getTrendingSearch()
        const { coins } = { ...response }
        // console.log({coins})
        if (coins) {
          dispatch({ type: TRENDING_DATA, value: toArray(coins || trending_data) });
          console.log("dispatching update");
        } else {
          console.log("Data is the same, skipping update");
        }
        // console.log({trending_data})

        if (coins) {
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
          // console.log('before tokenResponse')
          const tokenResponse = await getTokensMarkets({ vs_currency: 'usd', ids: toArray(coins).map(d => d.item?.id).join(','), price_change_percentage: '24h' })
          if (!tokenResponse || tokenResponse.length === 0) {
            console.error('API Error for Moving trending list: Token response is empty , invalid or may exceeded the Rate Limit for coingecko.');
            return; // Exit to avoid unnecessary updates
          }
        
        // console.log(`after token Res: ${JSON.stringify(tokenResponse)}`)
          const combinedData = [
            cvmToken, 
            ...toArray(coins).map(d => ({
              ...d,
              ...toArray(tokenResponse).find(_d => _d.id === d.item?.id) 
            })).slice(0,9)
        ];
        // console.log({combinedData})

        setTokens(combinedData);
        // console.log('setTokens',tokens)
        }

      }catch (error){
        console.error('Error in getToken:', error);
      }         
      }
      getToken()
      const interval = setInterval(() => getToken(), 5 * 60 * 1000)
      return () => clearInterval(interval)
    },[],
  )

  const router = useRouter()
  const { query } = { ...router }
  const { widget } = { ...query }

  const is_widget = widget === 'price-marquee'

  return toArray(tokens).length > 0 && page_visible && (
    <Ticker>
      {({ index }) => (
        <>
          {[tokens[index % tokens.length]].map(d => {
            // const { id, image, name, symbol, current_price, price_change_percentage_24h, market_cap_rank } = { ...d }
            const { id, name,image, symbol, large, current_price, price_change_percentage_24h, market_cap_rank, market_cap } = { ...d }

            return (
              <Link
                key={index}
                href={`/token${id ? `/${id}` : 's'}`}
                target={is_widget ? '_blank' : '_self'}
                rel={is_widget ? 'noopener noreferrer' : ''}
              >
                <div className={`w-full h-6 flex items-center justify-between space-x-2 ${index && index % tokens.length === 0 ? 'pl-4 md:pl-8 pr-2 md:pr-3' : 'px-2 md:px-3'}`}>
                  <div className="flex items-center space-x-1">
                    {image && (
                      <Image
                        src={image}
                        width={16}
                        height={16}
                      />
                    )}
                    <span className="uppercase text-xs font-bold">
                      {symbol}
                    </span>
                  </div>
                  <NumberDisplay
                    value={current_price}
                    format="0,0.00000000"
                    prefix="$"
                    noTooltip={true}
                    // className={`${price_change_percentage_24h < 0 ? 'text-red-500 dark:text-red-400' : price_change_percentage_24h > 0 ? 'text-green-500 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'} text-xs font-semibold`}
                    className={'text-green-500 dark:text-green-400 text-xs font-semibold'}
                  />
                </div>
                <div className={`w-full flex items-center justify-between text-2xs space-x-2 ${index && index % tokens.length === 0 ? 'pl-4 md:pl-8 pr-2 md:pr-3' : 'px-2 md:px-3'}`}>
                  {/* <div className="flex items-center space-x-1">
                    <NumberDisplay
                      value={market_cap_rank}
                      format="0,0"
                      prefix="#"
                      className="font-semibold"
                    />
                    <span className="text-slate-600 dark:text-slate-400">
                      {name}
                    </span>
                  </div> */}
                  <div className={`flex items-center ${price_change_percentage_24h < 0 ? 'text-red-500 dark:text-red-400' : price_change_percentage_24h > 0 ? 'text-green-500 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'} space-x-0.5`}>
                    <NumberDisplay
                      value={price_change_percentage_24h}
                      maxDecimals={2}
                      prefix={price_change_percentage_24h < 0 ? '' : '+'}
                      suffix="%"
                      noTooltip={true}
                      className="font-medium"
                    />
                    {price_change_percentage_24h < 0 ? <FiArrowDown size={10} /> : price_change_percentage_24h > 0 ? <FiArrowUp size={10} /> : null}
                  </div>
                </div>
              </Link>
            )
          })}
        </>
      )}
    </Ticker>
  )
}