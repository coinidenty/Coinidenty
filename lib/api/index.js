const request = async params => {
  try {
    const response = await fetch(process.env.NEXT_PUBLIC_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    
    if (response.status === 200 && response.headers.get('content-length') !== '0') 
    {
    return response && await response.json();
    } else {
      console.log('Empty response');
      return null;
    }
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}


export const getCoingecko = async params => await request({ ...params, method: 'coingecko' })
export const getFearAndGreed = async params => await request({ ...params, method: 'getFearAndGreed' })
export const getChains = async params => await request({ ...params, method: 'getChains' })
export const getTokenPrice = async params => await request({ ...params, method: 'getTokensPrice' })