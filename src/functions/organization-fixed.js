import { app } from "@azure/functions"
import { logger } from "@vestfoldfylke/loglady"
import { roles, topUnitId } from "../../config.js"
import { fixedOrganization } from "../lib/fint-organization-fixed/fixed-organization.js"
import { fixedOrganizationFlat } from "../lib/fint-organization-fixed/fixed-organization-flat.js"
import { fixedOrganizationStructure } from "../lib/fint-organization-fixed/fixed-organization-structure.js"
import { fintOrganizationFixedIdm } from "../lib/fint-organization-fixed/idm.js"
import { HttpError } from "../middleware/http-error.js"
import { httpTriggerMiddleware } from "../middleware/http-trigger.js"

const getOrganizationFixed = async (request) => {
  const { identifikator, identifikatorverdi } = request.params
  const validIdentifiers = ["organisasjonsId", "organisasjonsKode", "structure", "flat", "idm"]
  if (!validIdentifiers.includes(identifikator)) {
    throw new HttpError(400, `Query param ${identifikator} is not valid - must be ${validIdentifiers.join(" or ")}`)
  }

  if (identifikator === "idm") {
    const { rawValidationResult, exceptionRuleValidationResult, repackedFintUnitsResult } = /** @type {any} */ (await fintOrganizationFixedIdm())

    if (identifikatorverdi === "validate") {
      logger.info("Only validation requested, returning validation")

      if (rawValidationResult) {
        delete rawValidationResult.validUnits
      }
      if (repackedFintUnitsResult) {
        delete repackedFintUnitsResult.resultingUnitsFlat
      }
      if (repackedFintUnitsResult) {
        delete repackedFintUnitsResult.resultingUnitsNested
      }

      return { rawValidationResult, exceptionRuleValidationResult: exceptionRuleValidationResult || "not run", repackedFintUnitsResult: repackedFintUnitsResult || "not run" }
    }

    if (!(rawValidationResult?.valid && exceptionRuleValidationResult?.valid && repackedFintUnitsResult?.valid)) {
      logger.warn("Validation failed, returning 500 and error")

      if (rawValidationResult) {
        delete rawValidationResult.validUnits
      }
      if (repackedFintUnitsResult) {
        delete repackedFintUnitsResult.resultingUnitsFlat
      }
      if (repackedFintUnitsResult) {
        delete repackedFintUnitsResult.resultingUnitsNested
      }

      throw new HttpError(500, "Validation failed - check errordata, or call OrganizationFixed/idm/validate")
    }

    logger.info("Validation passed, returning result in embedded FINT format")
    return {
      _embedded: {
        _entries: repackedFintUnitsResult.resultingUnitsFlat
      },
      total_items: repackedFintUnitsResult.resultingUnitsFlat.length,
      offset: 0,
      size: repackedFintUnitsResult.resultingUnitsFlat.length
    }
  }

  if (identifikator === "structure") {
    const includeInactiveUnits = request.query.get("includeInactiveUnits") === "true"
    const res = await fixedOrganizationStructure(includeInactiveUnits)
    if (!res) {
      throw new HttpError(404, `No organizationUnit with organisasjonsId "${topUnitId}" found in FINT`)
    }
    return res
  }

  if (identifikator === "flat") {
    const units = await fixedOrganizationFlat()
    if (!units) {
      throw new HttpError(404, `No organizationUnit with organisasjonsId "${topUnitId}" found in FINT`)
    }
    const filtered = request.query.get("includeInactiveUnits") !== "true" ? units.filter((unit) => unit.aktiv && unit.overordnet.aktiv) : units
    return filtered.reverse()
  }

  const res = await fixedOrganization(identifikator, identifikatorverdi)
  if (!res) {
    throw new HttpError(404, `No organizationUnit with ${identifikator} "${identifikatorverdi}" found in FINT`)
  }
  if (request.query.get("includeInactiveEmployees") !== "true") {
    res.arbeidsforhold = res.arbeidsforhold.filter((forhold) => forhold.aktiv)
  }
  return res
}

app.http("organizationfixed", {
  methods: ["GET"],
  route: "organizationfixed/{identifikator}/{identifikatorverdi?}",
  authLevel: "anonymous",
  handler: async (request, context) => {
    const authorizedRoles = [roles.organizationRead, roles.readAll]
    return await httpTriggerMiddleware(request, context, authorizedRoles, getOrganizationFixed)
  }
})
