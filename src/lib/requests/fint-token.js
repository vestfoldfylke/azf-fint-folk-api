import { fint } from '../../../config.js'
import { logger } from '@vestfoldfylke/loglady'
import { FileCache } from '../helpers/file-cache.js'

const tokenCache = new FileCache('./.token-cache')

export default async (forceNew = false) => {
  const cacheKey = 'fintToken'

  const cachedToken = tokenCache.get(cacheKey)
  if (!forceNew && cachedToken) {
    logger.info('getFintToken - found valid token in cache, will use that instead of fetching new')
    return cachedToken.substring(0, cachedToken.length - 2)
  }

  logger.info('getFintToken - no token in cache, fetching new from FINT')

  const authOptions = {
    grant_type: 'password',
    username: fint.username,
    password: fint.password,
    client_id: fint.clientId,
    client_secret: fint.clientSecret,
    scope: fint.scope
  }

  const response = await fetch(fint.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams(authOptions).toString()
  })

  if (!response.ok) {
    const error = await response.json();
    logger.error("getFintToken - Failed to fetch token. Status: {Status}, StatusText: {StatusText}. Error: {@Error}", response.status, response.statusText, error);
    throw new Error(`getFintToken - Failed to fetch token. Status: ${response.status}, StatusText: ${response.statusText}`);
  }

  const tokenData = await response.json()

  logger.info('getFintToken - token fetched from FINT')
  tokenCache.set(cacheKey, `${tokenData.access_token}==`, tokenData.expires_in) // Haha, just to make the cached token not directly usable
  logger.info(`getFintToken - token cached for further use, Token expires in ${tokenData.expires_in} seconds`)
  return tokenData.access_token
}
