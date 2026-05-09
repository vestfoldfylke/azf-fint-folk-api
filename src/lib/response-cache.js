import crypto from "node:crypto"
import { existsSync, readFileSync, unlinkSync } from "node:fs"
import { responseCache } from "../../config.js"
import { FileCache } from "./helpers/file-cache.js"

const responseFileCache = new FileCache("./.response-cache")

export const getResponse = (urlCacheKey) => {
  if (!responseCache.enabled) return null

  const cachedResponse = responseFileCache.get(urlCacheKey)
  if (!cachedResponse) {
    return null
  }

  return cachedResponse
}

export const setResponse = (urlCacheKey, data, customTtl) => {
  if (!responseCache.enabled) return

  responseFileCache.set(urlCacheKey, data, customTtl ?? responseCache.ttl)
}
