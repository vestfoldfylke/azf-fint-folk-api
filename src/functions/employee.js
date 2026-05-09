import { app, HttpRequest } from "@azure/functions"
import { logger } from "@vestfoldfylke/loglady"
import { roles } from "../../config.js"
import { fintEmployee } from "../lib/fint-employee.js"
import { isAnsattnummer, isEmail, isFnr } from "../lib/helpers/identifikator-type.js"
import { fintGraph } from "../lib/requests/call-fint.js"
import { getAnsattnummer } from "../lib/requests/call-graph.js"
import { HttpError } from "../middleware/http-error.js"
import { httpTriggerMiddleware } from "../middleware/http-trigger.js"

/**
 *
 * @param {HttpRequest} request
 */
const getEmployee = async (request) => {
  const { identifikator, identifikatorverdi } = request.params
  const validIdentifiers = ["ansattnummer", "fodselsnummer", "upn"]
  if (!validIdentifiers.includes(identifikator)) {
    throw new HttpError(400, `Param ${identifikator} is not valid - must be ${validIdentifiers.join(" or ")}`)
  }

  if (identifikator === "ansattnummer" && !isAnsattnummer(identifikatorverdi)) {
    throw new HttpError(400, '"ansattnummer" must be a numerical string, and less than 20 characters')
  }
  if (identifikator === "fodselsnummer" && !isFnr(identifikatorverdi)) {
    throw new HttpError(400, '"fodselsnummer" must be a numerical string, and exactly 11 characters')
  }
  if (identifikator === "upn" && !isEmail(identifikatorverdi)) {
    throw new HttpError(400, '"upn" must be a valid email address')
  }

  let ansattnummer

  // If getting with upn
  if (identifikator === "upn") {
    try {
      ansattnummer = await getAnsattnummer(identifikatorverdi)

      if (!ansattnummer) {
        throw new HttpError(404, "No user with provided upn found in EntraID")
      }
    } catch (error) {
      logger.errorException(error, `Failed when getting ansattnummer from Entra`)
      throw error
    }
  }

  // If getting with fnr
  if (identifikator === "fodselsnummer") {
    logger.info('Queryparam is type "fodselsnummer", fetching ansattnummer from FINT')

    try {
      const payload = {
        query: `
          query {
            person(fodselsnummer: "${identifikatorverdi}") {
              personalressurs {
                ansattnummer {
                  identifikatorverdi
                }
              }
            }
          }
        `
      }

      const { data } = await fintGraph(payload)
      ansattnummer = data.person?.personalressurs?.ansattnummer?.identifikatorverdi

      if (!ansattnummer) {
        throw new HttpError(404, "No employee with provided identificator found in FINT")
      }

      logger.info(`Got ansattnummer: ${ansattnummer}`)
    } catch (error) {
      logger.errorException(error, `Failed when getting ansattnummer from FINT`)
      throw error
    }
  }

  // If simply getting with ansattnummer
  if (identifikator === "ansattnummer") {
    ansattnummer = identifikatorverdi
  }

  const employeeData = await fintEmployee(ansattnummer)

  if (!employeeData) {
    throw new HttpError(404, `No employee with ansattnummer "${ansattnummer}" found in FINT`)
  }
  return employeeData
}

app.http("employee", {
  methods: ["GET"],
  route: "employee/{identifikator}/{identifikatorverdi}",
  authLevel: "anonymous",
  handler: async (request, context) => {
    const authorizedRoles = [roles.employeeRead, roles.readAll]
    return await httpTriggerMiddleware(request, context, authorizedRoles, getEmployee)
  }
})
