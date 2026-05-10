import { logger } from "@vestfoldfylke/loglady"
import { topUnitId } from "../../config.js"
import graphQlOrganizationFlat from "../fint-templates/organization-flat.js"
import { repackLeder, repackPeriode } from "./helpers/repack-fint.js"
import { fintGraph } from "./requests/call-fint.js"

const repackOrganizationFlat = (inputUnit, flat, level, graphQlFlatUnits) => {
  let unit
  
  if (!graphQlFlatUnits) {
    unit = JSON.parse(JSON.stringify(inputUnit))
  } else {
    const unitData = graphQlFlatUnits.find((graphQlUnit) => graphQlUnit.organisasjonsId.identifikatorverdi === inputUnit.organisasjonsId.identifikatorverdi)
    if (!unitData) {
      throw new Error(`No corresponding unit with id ${inputUnit.organisasjonsId.identifikatorverdi} found in graphQlFlatUnits`)
    }
    unit = JSON.parse(JSON.stringify(unitData))
    // Get correct overordnet as well
    const actualOverordnetId = inputUnit._links.overordnet[0].href.split("/").pop()
    if (!actualOverordnetId) {
      throw new Error(`No overordnet id found in overordnet href for unit with id ${inputUnit.organisasjonsId.identifikatorverdi}`)
    }
    const actualOverordnet = graphQlFlatUnits.find((graphQlUnit) => graphQlUnit.organisasjonsId.identifikatorverdi === actualOverordnetId)
    if (!unit.overordnet) {
      throw new Error(`No corresponding overordnet unit with id ${actualOverordnetId} found for unit with id ${inputUnit.organisasjonsId.identifikatorverdi} in graphQlFlatUnits`)
    }
    unit.overordnet = JSON.parse(JSON.stringify(actualOverordnet))
  }

  const gyldighetsperiode = repackPeriode(unit.gyldighetsperiode)
  const overordnetGyldighetsperiode = repackPeriode(unit.overordnet.gyldighetsperiode)
  
  const overordnet = {
    aktiv: overordnetGyldighetsperiode?.aktiv || false,
    organisasjonsId: unit.overordnet.organisasjonsId.identifikatorverdi,
    organisasjonsKode: unit.overordnet.organisasjonsKode.identifikatorverdi,
    gyldighetsperiode: overordnetGyldighetsperiode,
    navn: unit.overordnet.navn,
    kortnavn: unit.overordnet.kortnavn
  }
  unit.aktiv = gyldighetsperiode?.aktiv || false
  unit.level = level
  unit.organisasjonsId = unit.organisasjonsId.identifikatorverdi
  unit.organisasjonsKode = unit.organisasjonsKode.identifikatorverdi
  unit.gyldighetsperiode = gyldighetsperiode
  unit.leder = repackLeder(unit.leder)
  unit.overordnet = overordnet

  if (!Array.isArray(unit.underordnet)) {
    unit.underordnet = []
  }

  // Må sjekke om underordnet inneholder current unit of filtrere den vekk, fordi det er noe rart i FINT, som gjør at noen enheter er underordnet seg selv, og vil sende oss i evig loop om vi fortsetter...
  unit.underordnet = inputUnit.underordnet.filter((u) => u.organisasjonsId.identifikatorverdi !== unit.organisasjonsId)
  unit.underordnet = unit.underordnet.map((u) => {
    return repackOrganizationFlat(u, flat, level + 1, graphQlFlatUnits) // Recursion
  })
  delete unit.underordnet // Don't need this anymore, we have the correct underordnet in the flat array

  flat.push(unit)
  return unit
}

const fintOrganizationFlat = async () => {
  logger.info("fintOrganization - Creating graph payload - flat")
  const payload = graphQlOrganizationFlat()
  logger.info("fintOrganization - Created graph payload, sending request to FINT - flat")
  const { data } = await fintGraph(payload)
  if (!data.organisasjonselement?.organisasjonsId?.identifikatorverdi) {
    logger.info(`fintOrganization - No organization with organisasjonsId "${topUnitId}" found in FINT`)
    return null
  }
  logger.info("fintOrganization - Got response from FINT, repacking result - flat")
  const flat = /** @type {any[]} */ ([])
  repackOrganizationFlat(data.organisasjonselement, flat, 0) // Modifies the object directly
  logger.info("fintOrganization - Repacked result - flat")

  return flat
}

export { fintOrganizationFlat, repackOrganizationFlat }
