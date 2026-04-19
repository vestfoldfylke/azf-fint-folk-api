import { logger } from '@vestfoldfylke/loglady'
import { decodeAccessToken } from '../lib/helpers/decode-access-token.js'
import httpResponse from '../lib/requests/http-response.js'
import { roles, topUnitId } from '../config.js'
import { getResponse, setResponse } from '../lib/response-cache.js'
import { fintOrganizationFixedIdm } from '../lib/fint-organization-fixed/idm.js'
import { fixedOrganizationFlat } from '../lib/fint-organization-fixed/fixed-organization-flat.js'
import { fixedOrganizationStructure } from '../lib/fint-organization-fixed/fixed-organization-structure.js'
import { fixedOrganization } from '../lib/fint-organization-fixed/fixed-organization.js'

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
    prefix: `azf-fint-folk - OrganizationFixed - ${decoded.appid}${decoded.upn ? ' - ' + decoded.upn : ''}`
  })
  logger.info('Token is valid, checking params')
  if (!req.params) {
    logger.info('No params here...')
    return httpResponse(400, 'Missing query params')
  }

  const { identifikator, identifikatorverdi } = req.params
  const validIdentifiers = ['organisasjonsId', 'organisasjonsKode', 'structure', 'flat', 'idm']
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

  // If fixed idm-units are requested
  if (identifikator === 'idm') {
    try {
      // await teamsStatusAlert(context)
      const { rawValidationResult, exceptionRuleValidationResult, repackedFintUnitsResult } = await fintOrganizationFixedIdm(context)

      // Check if we should only validate
      if (identifikatorverdi === 'validate') {
        logger.info('Only validation requested, returning validation')
        // Remove all validated units, don't need them right now :)

        if (rawValidationResult) delete rawValidationResult.validUnits
        if (repackedFintUnitsResult) delete repackedFintUnitsResult.resultingUnitsFlat
        if (repackedFintUnitsResult) delete repackedFintUnitsResult.resultingUnitsNested
        return httpResponse(200, { rawValidationResult, exceptionRuleValidationResult: exceptionRuleValidationResult || 'not run', repackedFintUnitsResult: repackedFintUnitsResult || 'not run' })
      }
      if (!(rawValidationResult?.valid && exceptionRuleValidationResult?.valid && repackedFintUnitsResult?.valid)) {
        logger.warn('Validation failed, returning 500 and error')
        if (rawValidationResult) delete rawValidationResult.validUnits
        if (repackedFintUnitsResult) delete repackedFintUnitsResult.resultingUnitsFlat
        if (repackedFintUnitsResult) delete repackedFintUnitsResult.resultingUnitsNested
        return httpResponse(500, { customMessage: 'Validation failed - check errordata, or call OrganizationFixed/idm/validate', customData: { rawValidationResult, exceptionRuleValidationResult: exceptionRuleValidationResult || 'not run', repackedFintUnitsResult: repackedFintUnitsResult || 'not run' } })
      }
      logger.info('Validation passed, returning 200 and result (in embedded FINT format')
      const resultingResponse = {
        _embedded: {
          _entries: repackedFintUnitsResult.resultingUnitsFlat
        },
        total_items: repackedFintUnitsResult.resultingUnitsFlat.length,
        offset: 0,
        size: repackedFintUnitsResult.resultingUnitsFlat.length
      }

      if (req.query.skipCache !== 'true') setResponse(req.url, resultingResponse) // Cache result
      return httpResponse(200, resultingResponse)
    } catch (error) {
      logger.error('Failed when fetching organization fixed from FINT {err}', error.response?.data || error.stack || error.toString())
      return httpResponse(500, error)
    }
  }

  // If all units are requested
  if (identifikator === 'structure') {
    try {
      const includeInactiveUnits = req.query.includeInactiveUnits === 'true'
      const res = await fixedOrganizationStructure(includeInactiveUnits, context)
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
      const res = await fixedOrganizationFlat(context)
      if (req.query.includeInactiveUnits !== 'true') res.repacked = res.repacked.filter(unit => unit.aktiv && unit.overordnet.aktiv) // Filter out inactive units if not requested (in structure, this is done in the repack function)
      if (!res) return httpResponse(404, `No organizationUnit with organisasjonsId "${topUnitId}" found in FINT`)
      const result = req.query.includeRaw === 'true' ? { flat: res.repacked.reverse(), raw: res.raw } : res.repacked.reverse()
      if (req.query.skipCache !== 'true') setResponse(req.url, result) // Cache result
      return httpResponse(200, result)
    } catch (error) {
      logger.error('Failed when fetching flat fixed organization structure from FINT {err}', error.response?.data || error.stack || error.toString())
      return httpResponse(500, error)
    }
  }

  try {
    const res = await fixedOrganization(identifikator, identifikatorverdi, context)
    if (!res) return httpResponse(404, `No organizationUnit with ${identifikator} "${identifikatorverdi}" found in FINT`)
    if (req.query.includeInactiveEmployees !== 'true') res.repacked.arbeidsforhold = res.repacked.arbeidsforhold.filter(forhold => forhold.aktiv)
    const result = req.query.includeRaw === 'true' ? { ...res.repacked, raw: res.raw } : res.repacked
    if (!req.query.skipCache) setResponse(req.url, result) // Cache result
    return httpResponse(200, result)
  } catch (error) {
    logger.error('Failed when fetching organization from FINT {err}', error.response?.data || error.stack || error.toString())
    return httpResponse(500, error)
  }
}
