import { logger } from '@vestfoldfylke/loglady'
import { decodeAccessToken } from '../lib/helpers/decode-access-token.js'
import httpResponse from '../lib/requests/http-response.js'
import { isFnr } from '../lib/helpers/identifikator-type.js'
import { roles } from '../config.js'
import { fintPerson } from '../lib/fint-person.js'
import { getResponse, setResponse } from '../lib/response-cache.js'

export default async function (context, req) {
  logger.logConfig({
    prefix: 'azf-fint-folk - Person'
  })
  logger.info('New Request. Validating token')
  const decoded = decodeAccessToken(req.headers.authorization)
  if (!decoded.verified) {
    logger.warn('Token is not valid {msg}', decoded.msg)
    return httpResponse(401, decoded.msg)
  }
  logger.logConfig({
    prefix: `azf-fint-folk - Person - ${decoded.appid}${decoded.upn ? ' - ' + decoded.upn : ''}`
  })
  logger.info('Token is valid, checking params')
  if (!req.params) {
    logger.info('No params here...')
    return httpResponse(400, 'Missing query params')
  }

  const { identifikator, identifikatorverdi } = req.params
  const validIdentifiers = ['fodselsnummer']
  if (!validIdentifiers.includes(identifikator)) return httpResponse(400, `Query param ${identifikator} is not valid - must be ${validIdentifiers.join(' or ')}`)

  if (identifikator === 'fodselsnummer' && !isFnr(identifikatorverdi)) return httpResponse(400, 'Property "fodselsnummer" must be 11 characters')

  logger.info('Validating role')
  if (!decoded.roles.includes(roles.personRead) && !decoded.roles.includes(roles.readAll)) {
    logger.info('Missing required role for access')
    return httpResponse(403, 'Missing required role for access')
  }
  logger.info('Role validated')

  // Cache
  if (req.query.skipCache !== 'true') {
    const cachedResponse = getResponse(req.url, context)
    if (cachedResponse) return httpResponse(200, cachedResponse)
  }

  let fodselsnummer

  // If simply getting with fodselsnummer
  if (identifikator === 'fodselsnummer') fodselsnummer = identifikatorverdi

  try {
    const res = await fintPerson(fodselsnummer, context)
    if (!res) return httpResponse(404, 'No person with provided identificator found in FINT')
    const result = req.query.includeRaw === 'true' ? { ...res.repacked, raw: res.raw } : res.repacked
    if (req.query.skipCache !== 'true') setResponse(req.url, result) // Cache result
    return httpResponse(200, result)
  } catch (error) {
    logger.error('Failed when fetching person from FINT {err}', error.response?.data || error.stack || error.toString())
    return httpResponse(500, error)
  }
}
