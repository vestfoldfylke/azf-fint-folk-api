import { aditro } from '../../../config.js'
import { logger } from '@vestfoldfylke/loglady'
import { FileCache } from '../helpers/file-cache.js'


const tokenCache = new FileCache('./.token-cache')

export default async (forceNew = false) => {
  const cacheKey = 'aditroToken'

  const cachedToken = tokenCache.get(cacheKey)
  if (!forceNew && cachedToken) {
    logger.info('getAditroToken - found valid token in cache, will use that instead of fetching new')
    return cachedToken.substring(0, cachedToken.length - 2)
  }

  logger.info('getAditroToken - no token in cache, fetching new from Aditro')

  const authOptions = {
    grant_type: 'client_credentials',
    client_id: aditro.clientId,
    client_secret: aditro.clientSecret,
    acr_values: `tenant:${aditro.tenantId}`
  }

  const response = await fetch(aditro.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams(authOptions).toString()
  })

  if (!response.ok) {
    const error = await response.json();
    logger.error("getAditroToken - Failed to fetch graph data. Status: {Status}, StatusText: {StatusText}. Error: {@Error}", response.status, response.statusText, error);
    throw new Error(`getAditroToken - Failed to fetch graph data. Status: ${response.status}, StatusText: ${response.statusText}`);
  }

  const data = await response.json()

  if (!data.access_token || !data.expires_in) {
    throw new Error('Invalid token response from Aditro, missing access_token or expires_in')
  }

  logger.info('getAditroToken - token fetched from Aditro')
  tokenCache.set(cacheKey, `${data.access_token}==`, data.expires_in) // Haha, just to make the cached token not directly usable
  logger.info(`getAditroToken - token cached for further use, Token expires in ${data.expires_in} seconds`)
  return data.access_token
}
