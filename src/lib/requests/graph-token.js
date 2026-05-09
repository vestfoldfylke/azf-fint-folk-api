import { ConfidentialClientApplication } from "@azure/msal-node"
import { logger } from "@vestfoldfylke/loglady"
import { graphClient } from "../../../config.js"
import { FileCache } from "../helpers/file-cache.js"

const tokenCache = new FileCache("./.token-cache")

export default async (forceNew = false) => {
  const cacheKey = "graphToken"

  const cachedToken = tokenCache.get(cacheKey)
  if (!forceNew && cachedToken) {
    logger.info("getGraphToken - found valid token in cache, will use that instead of fetching new")
    return cachedToken.substring(0, cachedToken.length - 2)
  }

  logger.info("getGraphToken - no token in cache, fetching new from Microsoft")
  const config = {
    auth: {
      clientId: graphClient.clientId,
      authority: `https://login.microsoftonline.com/${graphClient.tenantId}/`,
      // knownAuthorities: ["login.microsoftonline.com"],
      clientSecret: graphClient.clientSecret
    }
  }

  // Create msal application object
  const cca = new ConfidentialClientApplication(config)
  const clientCredentials = {
    scopes: [graphClient.scope]
  }

  const token = await cca.acquireTokenByClientCredential(clientCredentials)

  if (!token || !token.accessToken) {
    throw new Error("Failed to acquire token from Microsoft")
  }

  if (!token.expiresOn) {
    throw new Error('Token response is missing "expiresOn" property')
  }

  const expires = Math.floor((token.expiresOn.getTime() - new Date().getTime()) / 1000)
  logger.info(`getGraphToken - Got token from Microsoft, expires in ${expires} seconds.`)
  tokenCache.set(cacheKey, `${token.accessToken}==`, expires) // Haha, just to make the cached token not directly usable
  logger.info("getGraphToken - Token stored in cache")

  return token.accessToken
}
