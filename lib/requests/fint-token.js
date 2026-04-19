import { fint } from '../../config.js'
import { logger } from '@vestfoldfylke/loglady'
import axios from 'axios'
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

  const { data } = await axios.post(fint.tokenUrl, new URLSearchParams(authOptions).toString())
  const { access_token: accessToken, expires_in: expiresIn } = data

  logger.info('getFintToken - token fetched from FINT')
  tokenCache.set(cacheKey, `${accessToken}==`, expiresIn) // Haha, just to make the cached token not directly usable
  logger.info(`getFintToken - token cached for further use, Token expires in ${expiresIn} seconds`)
  return accessToken
}
