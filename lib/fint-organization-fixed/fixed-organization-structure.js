import { logger } from '@vestfoldfylke/loglady'
import { getFixedUnits } from './cached-idm-units.js'
import { topUnitId } from '../../config.js'
import { repackOrganizationStructure } from '../fint-organization-structure.js'

const fixedOrganizationStructure = async (includeInactiveUnits) => {
  logger.info('fixedOrganizationStructure - Getting necessary data from fixed org and graphql - structure')

  const { fixedOrgNested, graphQlFlat } = await getFixedUnits()

  // Så plukker vi ut fixedOrgNested elementet med topid, og sender det til repack (her bruker vi KUN en toppenhet)
  const topUnit = fixedOrgNested.find(unit => unit.organisasjonsId.identifikatorverdi === topUnitId)
  if (!topUnit) throw new Error(`No top unit with id ${topUnitId} found in fixedOrgNested`)

  logger.info('fixedOrganizationStructure - Got necessary data, repacking result - structure')
  const repacked = repackOrganizationStructure(topUnit, includeInactiveUnits, graphQlFlat)
  logger.info('fixedOrganizationStructure - Repacked result - structure')

  return { repacked, raw: graphQlFlat }
}

export { fixedOrganizationStructure }
