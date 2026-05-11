import { app, HttpRequest } from "@azure/functions"
import { roles, topUnitId } from "../../config.js"
import { fintOrganization } from "../lib/fint-organization.js"
import { fintOrganizationFlat } from "../lib/fint-organization-flat.js"
import { fintOrganizationStructure } from "../lib/fint-organization-structure.js"
import { HttpError } from "../middleware/http-error.js"
import { httpTriggerMiddleware } from "../middleware/http-trigger.js"

/**
 * @param {HttpRequest} request
 */
const getOrganization = async (request) => {
  const { identifikator, identifikatorverdi } = request.params
  const validIdentifiers = ["organisasjonsId", "organisasjonsKode", "structure", "flat"]
  if (!validIdentifiers.includes(identifikator)) {
    throw new HttpError(400, `Query param ${identifikator} is not valid - must be ${validIdentifiers.join(" or ")}`)
  }

  if (identifikator === "structure") {
    const includeInactiveUnits = request.query.get("includeInactiveUnits") === "true"
    const res = await fintOrganizationStructure(includeInactiveUnits)
    if (!res) {
      throw new HttpError(404, `No organizationUnit with organisasjonsId "${topUnitId}" found in FINT`)
    }
    return res
  }

  if (identifikator === "flat") {
    const units = await fintOrganizationFlat()
    if (!units) {
      throw new HttpError(404, `No organizationUnit with organisasjonsId "${topUnitId}" found in FINT`)
    }
    const filtered = request.query.get("includeInactiveUnits") !== "true" ? units.filter((unit) => unit.aktiv && unit.overordnet.aktiv) : units
    return filtered.reverse()
  }

  const res = await fintOrganization(identifikator, identifikatorverdi)
  if (!res) {
    throw new HttpError(404, `No organizationUnit with ${identifikator} "${identifikatorverdi}" found in FINT`)
  }
  if (request.query.get("includeInactiveEmployees") !== "true") {
    res.arbeidsforhold = res.arbeidsforhold.filter((forhold) => forhold.aktiv)
  }
  return res
}

app.http("organization", {
  methods: ["GET"],
  route: "organization/{identifikator}/{identifikatorverdi?}",
  authLevel: "anonymous",
  handler: async (request, context) => {
    const authorizedRoles = [roles.organizationRead, roles.readAll]
    return await httpTriggerMiddleware(request, context, authorizedRoles, getOrganization)
  }
})
