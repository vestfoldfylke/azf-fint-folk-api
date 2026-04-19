import { fintOrganization } from '../lib/fint-organization.js'
import { fintOrganizationStructure } from '../lib/fint-organization-structure.js'
import { fintOrganizationFlat } from '../lib/fint-organization-flat.js'
import { logger } from '@vestfoldfylke/loglady'
import { decodeAccessToken } from '../lib/helpers/decode-access-token.js'
import httpResponse from '../lib/requests/http-response.js'
import { roles, topUnitId } from '../config.js'
import { getResponse, setResponse } from '../lib/response-cache.js'

export default async function (context, req) {
  logger.logConfig({
    prefix: 'azf-fint-folk - Organization'
  })
  logger.info('New Request. Validating token')
  const decoded = decodeAccessToken(req.headers.authorization)
  if (!decoded.verified) {
    logger.warn('Token is not valid {msg}', decoded.msg)
    return httpResponse(401, decoded.msg)
  }
  logger.logConfig({
    prefix: `azf-fint-folk - Organization - ${decoded.appid}${decoded.upn ? ' - ' + decoded.upn : ''}`
  })
  logger.info('Token is valid, checking params')
  if (!req.params) {
    logger.info('No params here...')
    return httpResponse(400, 'Missing query params')
  }

  const { identifikator, identifikatorverdi } = req.params
  const validIdentifiers = ['organisasjonsId', 'organisasjonsKode', 'structure', 'flat']
  if (!validIdentifiers.includes(identifikator)) return httpResponse(400, `Query param ${identifikator} is not valid - must be ${validIdentifiers.join(' or ')}`)

  logger.info('Validating role')
  if (!decoded.roles.includes(roles.organizationRead) && !decoded.roles.includes(roles.readAll)) {
    logger.info('Missing required role for access')
    return httpResponse(403, 'Missing required role for access')
  }
  logger.info('Role validated')

  // Cache
  if (req.query.skipCache !== 'true') {
    const cachedResponse = getResponse(req.url, context)
    if (cachedResponse) return httpResponse(200, cachedResponse)
  }

  // If all units are requested
  if (identifikator === 'structure') {
    try {
      const includeInactiveUnits = req.query.includeInactiveUnits === 'true'
      const res = await fintOrganizationStructure(includeInactiveUnits, context)
      if (!res) return httpResponse(404, `No organizationUnit with organisasjonsId "${topUnitId}" found in FINT`)
      const result = req.query.includeRaw === 'true' ? { ...res.repacked, raw: res.raw } : res.repacked
      if (req.query.skipCache !== 'true') setResponse(req.url, result) // Cache result
      return httpResponse(200, result)
    } catch (error) {
      logger.error('Failed when fetching organization structure from FINT {err}', error.response?.data || error.stack || error.toString())
      return httpResponse(500, error)
    }
  }

  // If all units are requested and flattened (array)
  if (identifikator === 'flat') {
    try {
      const res = await fintOrganizationFlat(context)
      if (req.query.includeInactiveUnits !== 'true') res.repacked = res.repacked.filter(unit => unit.aktiv && unit.overordnet.aktiv) // Filter out inactive units if not requested (in structure, this is done in the repack function)
      if (!res) return httpResponse(404, `No organizationUnit with organisasjonsId "${topUnitId}" found in FINT`)
      const result = req.query.includeRaw === 'true' ? { flat: res.repacked.reverse(), raw: res.raw } : res.repacked.reverse()
      if (req.query.skipCache !== 'true') setResponse(req.url, result) // Cache result
      return httpResponse(200, result)
    } catch (error) {
      logger.error('Failed when fetching flat organization structure from FINT {err}', error.response?.data || error.stack || error.toString())
      return httpResponse(500, error)
    }
  }

  try {
    const res = await fintOrganization(identifikator, identifikatorverdi, context)
    if (!res) return httpResponse(404, `No organizationUnit with ${identifikator} "${identifikatorverdi}" found in FINT`)
    if (req.query.includeInactiveEmployees !== 'true') res.repacked.arbeidsforhold = res.repacked.arbeidsforhold.filter(forhold => forhold.aktiv)
    const result = req.query.includeRaw === 'true' ? { ...res.repacked, raw: res.raw } : res.repacked
    if (req.query.skipCache !== 'true') setResponse(req.url, result) // Cache result
    return httpResponse(200, result)
  } catch (error) {
    logger.error('Failed when fetching organization from FINT {err}', error.response?.data || error.stack || error.toString())
    return httpResponse(500, error)
  }
}
