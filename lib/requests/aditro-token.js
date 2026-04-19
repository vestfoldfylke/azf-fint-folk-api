import { aditro } from '../../config.js'
import { logger } from '@vestfoldfylke/loglady'
import axios from 'axios'
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

  const { data } = await axios.post(aditro.tokenUrl, new URLSearchParams(authOptions).toString())
  const { access_token: accessToken, expires_in: expiresIn } = data // desctructure and rename for the sake of StandardJS

  logger.info('getAditroToken - token fetched from Aditro')
  tokenCache.set(cacheKey, `${accessToken}==`, expiresIn) // Haha, just to make the cached token not directly usable
  logger.info(`getAditroToken - token cached for further use, Token expires in ${expiresIn} seconds`)
  return accessToken
}
