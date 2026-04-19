import { logger } from '@vestfoldfylke/loglady'
import { responseCache } from '../config.js'
import { readFileSync, existsSync, unlinkSync } from "node:fs"
import crypto from "node:crypto"
import { FileCache } from './helpers/file-cache.js'

const responseFileCache = new FileCache('./.response-cache')

export const getResponse = (urlCacheKey, customTtl) => {
  if (!responseCache.enabled) return null

  const cachedResponse = responseFileCache.get(urlCacheKey)
  if (!cachedResponse) {
    logger.info(`no response in response-cache for key: "${urlCacheKey}", will have to fetch and generate response`)
    return null
  }

  logger.info(`found response in response-cache for key: "${urlCacheKey}", returning cached response`)
  return cachedResponse
}

export const setResponse = (urlCacheKey, data, customTtl) => {
  if (!responseCache.enabled) return

  responseFileCache.set(urlCacheKey, data, customTtl ?? responseCache.ttl)
  logger.info(`Successfully set response data for cacheKey "${urlCacheKey}"`)
}
