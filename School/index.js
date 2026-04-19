import { fintSchool } from '../lib/fint-school.js'
import { logger, logConfig } from '@vtfk/logger'
import { decodeAccessToken } from '../lib/helpers/decode-access-token.js'
import httpResponse from '../lib/requests/http-response.js'
import { roles } from '../config.js'
import { getResponse, setResponse } from '../lib/response-cache.js'

export default async function (context, req) {
  logConfig({
    prefix: 'azf-fint-folk - School'
  })
  logger('info', ['New Request. Validating token'], context)
  const decoded = decodeAccessToken(req.headers.authorization)
  if (!decoded.verified) {
    logger('warn', ['Token is not valid', decoded.msg], context)
    return httpResponse(401, decoded.msg)
  }
  logConfig({
    prefix: `azf-fint-folk - Teacher - ${decoded.appid}${decoded.upn ? ' - ' + decoded.upn : ''}`
  })
  logger('info', ['Token is valid, checking params'], context)
  if (!req.params) {
    logger('info', ['No params here...'], context)
    return httpResponse(400, 'Missing query params')
  }

  const { identifikator, identifikatorverdi } = req.params
  const validIdentifiers = ['skolenummer']
  if (!validIdentifiers.includes(identifikator)) return httpResponse(400, `Query param ${identifikator} is not valid - must be ${validIdentifiers.join(' or ')}`)

  if (identifikator === 'skolenummer' && isNaN(identifikatorverdi)) return httpResponse(400, 'Property "skolenummer" must be numerical')

  logger('info', ['Validating role'], context)
  if (!decoded.roles.includes(roles.readAll)) {
    logger('info', ['Missing required role for access'], context)
    return httpResponse(403, 'Missing required role for access')
  }
  logger('info', ['Role validated'], context)

  // Cache
  if (req.query.skipCache !== 'true') {
    const cachedResponse = getResponse(req.url, context)
    if (cachedResponse) return httpResponse(200, cachedResponse)
  }

  let schoolNumber

  // If simply getting with feidenavn
  if (identifikator === 'skolenummer') schoolNumber = identifikatorverdi

  try {
    const includeStudentSsn = req.query.includeStudentSsn === 'true'
    const res = await fintSchool(schoolNumber, includeStudentSsn, context)
    if (!res) return httpResponse(404, 'No school with provided identificator found in FINT')
    const result = req.query.includeRaw === 'true' ? { ...res.repacked, raw: res.raw } : res.repacked
    if (req.query.skipCache !== 'true') setResponse(req.url, result)
    return httpResponse(200, result)
  } catch (error) {
    logger('error', ['Failed when getting school from FINT', error.response?.data || error.stack || error.toString()], context)
    return httpResponse(500, error)
  }
}
