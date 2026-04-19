import { logger } from '@vestfoldfylke/loglady'
import { repackOrganizationFlat } from '../fint-organization-flat.js'
import { getFixedUnits } from './cached-idm-units.js'
import { topUnitId } from '../../config.js'

const fixedOrganizationFlat = async (context) => {
  logger.info('fixedOrganizationFlat - Getting necessary data from fixed org and graphql - flat')

  const { fixedOrgNested, graphQlFlat } = await getFixedUnits(context)

  // Så plukker vi ut fixedOrgNested elementet med topid, og sender det til repack (her bruker vi KUN en toppenhet)
  const topUnit = fixedOrgNested.find(unit => unit.organisasjonsId.identifikatorverdi === topUnitId)
  if (!topUnit) throw new Error(`No top unit with id ${topUnitId} found in fixedOrgNested`)

  logger.info('fixedOrganizationFlat - Got necessary data, repacking result - flat')
  const flat = []
  repackOrganizationFlat(topUnit, flat, 0, graphQlFlat)
  logger.info('fintOrganization - Repacked result - flat')

  return { repacked: flat, raw: graphQlFlat }
}

export { fixedOrganizationFlat }
