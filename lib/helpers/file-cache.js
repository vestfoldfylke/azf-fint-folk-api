import { logger } from '@vestfoldfylke/loglady'
import { responseCache } from '../config.js'
import { readFileSync, existsSync, unlinkSync } from "node:fs"
import crypto from "node:crypto"
import { log } from 'node:console'

export class FileCache {
  constructor(cachePath) {
    this.cachePath = cachePath
  }

  #cacheKeyToHash(cacheKey) {
    if (typeof cacheKey !== 'string') {
      throw new Error('Cache key must be a string')
    }
    return crypto.createHash('md5').update(cacheKey).digest('hex')
  }
  
  get(cacheKey) {
    if (!existsSync(`${this.cachePath}/${this.#cacheKeyToHash(cacheKey)}.json`)) {
      return null
    }
    try {
      const cachedData = JSON.parse(readFileSync(`${this.cachePath}/${this.#cacheKeyToHash(cacheKey)}.json`, 'utf-8'))
      if (Date.now() > new Date(cachedData.expiry).getTime()) {
        logger.info(`FileCache - cached data for key: "${cacheKey}" is expired, will have to fetch and generate data`)
        unlinkSync(`${this.cachePath}/${this.#cacheKeyToHash(cacheKey)}.json`)
        return null
      }
      return cachedData.data
    } catch (error) {
      logger.errorException(error, `FileCache - Error while trying to read cache for key: "${cacheKey}", will have to fetch and generate data. Deleting cache file just in case`)
      try {
        unlinkSync(`${this.cachePath}/${this.#cacheKeyToHash(cacheKey)}.json`)
      } catch (error) {
        logger.errorException(error, `FileCache - Error while trying to delete cache file for key: "${cacheKey}".`)
      }
      return null
    }
  }

  set(cacheKey, data, ttl) {
    try {
      const expiry = new Date(Date.now() + ttl * 1000)
      const cacheData = {
        expiry,
        data
      }
      try {
        writeFileSync(`${this.cachePath}/${this.#cacheKeyToHash(cacheKey)}.json`, JSON.stringify(cacheData))
      } catch (error) {
        logger.errorException(error, `FileCache - Error while trying to write cache file for key: "${cacheKey}".`)
        return null
      }
    } catch (error) {
      logger.errorException(error, `FileCache - Could not set cache data for key: "${cacheKey}", will have to try again next time :(`)
    }
  }
}
