import { HttpRequest, InvocationContext } from "@azure/functions"
import { logger } from "@vestfoldfylke/loglady"
import { decodeAccessToken } from "../lib/helpers/decode-access-token.js"
import { getResponse, setResponse } from "../lib/response-cache.js"
import { runInContext, updateContext } from "./context-logger.js"
import { HttpError } from "./http-error.js"

/**
 *
 * @param {HttpRequest} request
 * @param {InvocationContext} context
 * @param {string[]} authorizedRoles - Array of roles that are authorized to access the endpoint. If the decoded token does not contain any of these roles, a 403 response will be returned.
 * @param {(request: HttpRequest) => Promise<unknown>} handler
 *
 * @returns {Promise<import("@azure/functions").HttpResponseInit>} Returns the response from the handler, or an error response if the token is invalid, missing required roles, or if the handler throws an error.
 */
export const httpTriggerMiddleware = async (request, context, authorizedRoles, handler) => {
  const logContext = {
    prefix: `InvocationId: ${context.invocationId} - [${request.method}] ${context.functionName}`
  }

  try {
    return await runInContext(logContext, async () => {
      try {
        logger.info(`New Request - decoding token`)
        const authorizationHeader = request.headers.get("authorization")

        if (!authorizationHeader) {
          throw new HttpError(401, 'Missing "Authorization" header')
        }

        const decoded = decodeAccessToken(authorizationHeader)
        if (!decoded.verified) {
          throw new HttpError(401, `Token is not valid: ${decoded.msg}`)
        }

        updateContext({
          prefix: `${logContext.prefix} - ${decoded.appid}${decoded.upn ? " - " + decoded.upn : ""}`
        })

        logger.info(`Token decoded, checking roles`)

        if (!decoded.roles.some((role) => authorizedRoles.includes(role))) {
          throw new HttpError(403, "Missing required role for access")
        }

        logger.info(`Token is valid, executing handler`)

        const skipCache = request.query.get("skipCache") === "true"
        // Cache
        if (!skipCache) {
          const cachedResponse = getResponse(request.url)
          if (cachedResponse) {
            logger.info(`Found cached response, returning cached response`)
            return { jsonBody: cachedResponse, status: 200 }
          }
        }

        const response = await handler(request)
        logger.info(`Handler executed successfully`)

        if (!skipCache) {
          setResponse(request.url, response)
          logger.info(`Response cached successfully`)
        }

        return { jsonBody: response, status: 200 }
      } catch (error) {
        if (error instanceof HttpError) {
          logger.error(`Handler threw an HttpError {Status} {Message}`, error.status, error.message)
          return { jsonBody: { message: error.message, data: error.data }, status: error.status }
        }

        logger.errorException(error, `Unexpected error occurred`)
        return { jsonBody: { message: error instanceof Error ? error.message : "Internal Server Error" }, status: 500 }
      }
    })
  } catch (error) {
    logger.errorException(error, `Error in runInContext`)
    return { jsonBody: { message: error instanceof Error ? error.message : "Internal Server Error" }, status: 500 }
  }
}
