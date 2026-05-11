import { app } from "@azure/functions"
import { logger } from "@vestfoldfylke/loglady"
import { feidenavnDomain, roles, studentUpnSuffix } from "../../config.js"
import { fintStudent } from "../lib/fint-student.js"
import { isEmail, isFnr } from "../lib/helpers/identifikator-type.js"
import { fintGraph } from "../lib/requests/call-fint.js"
import { HttpError } from "../middleware/http-error.js"
import { httpTriggerMiddleware } from "../middleware/http-trigger.js"

const getStudent = async (request) => {
  const { identifikator, identifikatorverdi } = request.params
  const validIdentifiers = ["feidenavn", "fodselsnummer", "upn"]
  if (!validIdentifiers.includes(identifikator)) {
    throw new HttpError(400, `Query param ${identifikator} is not valid - must be ${validIdentifiers.join(" or ")}`)
  }

  if (identifikator === "feidenavn" && !isEmail(identifikatorverdi)) {
    throw new HttpError(400, '"feidenavn" must be valid email')
  }
  if (identifikator === "upn" && !isEmail(identifikatorverdi)) {
    throw new HttpError(400, '"upn" must be valid email')
  }
  if (identifikator === "fodselsnummer" && !isFnr(identifikatorverdi)) {
    throw new HttpError(400, '"fodselsnummer" must be a numerical string, and exactly 11 characters')
  }

  let feidenavn = null
  let elevnummer = null

  if (identifikator === "upn") {
    logger.info('Queryparam is type "upn", simply creating feidenavn from given upn')
    try {
      if (!identifikatorverdi.endsWith(studentUpnSuffix)) {
        throw new Error(`Student upn must end with ${studentUpnSuffix}`)
      }
      const feidenavnPrefix = identifikatorverdi.substring(0, identifikatorverdi.indexOf("@"))
      feidenavn = `${feidenavnPrefix}${feidenavnDomain}`
      logger.info(`Got feidenavn: ${feidenavn}`)
    } catch (error) {
      logger.errorException(error, "Failed when constructing feidenavn")
      throw error
    }
  }

  if (identifikator === "fodselsnummer" && request.query.get("useElevnummer") === "true") {
    logger.info('Queryparam is type "fodselsnummer", fetching elevnummer from FINT')
    try {
      const payload = {
        query: `
          query {
            person(fodselsnummer: "${identifikatorverdi}") {
              elev {
                elevnummer {
                  identifikatorverdi
                }
              }
            }
          }
        `
      }
      const { data } = await fintGraph(payload)
      elevnummer = data.person?.elev?.elevnummer?.identifikatorverdi
      if (!elevnummer) {
        throw new HttpError(404, "No student with provided identificator found in FINT")
      }
      logger.info(`Got elevnummer: ${elevnummer}`)
    } catch (error) {
      logger.errorException(error, "Failed when getting elevnummer from FINT")
      throw error
    }
  } else if (identifikator === "fodselsnummer") {
    logger.info('Queryparam is type "fodselsnummer", fetching feidenavn from FINT')
    try {
      const payload = {
        query: `
          query {
            person(fodselsnummer: "${identifikatorverdi}") {
              elev {
                feidenavn {
                  identifikatorverdi
                }
              }
            }
          }
        `
      }
      const { data } = await fintGraph(payload)
      feidenavn = data.person?.elev?.feidenavn?.identifikatorverdi
      if (!feidenavn) {
        throw new HttpError(404, "No student with provided identificator found in FINT")
      }
      logger.info(`Got feidenavn: ${feidenavn}`)
    } catch (error) {
      logger.errorException(error, "Failed when getting feidenavn from FINT")
      throw error
    }
  }

  if (identifikator === "feidenavn") {
    feidenavn = identifikatorverdi
  }

  const res = await fintStudent(feidenavn, elevnummer)
  if (!res) {
    throw new HttpError(404, "No student with provided identificator found in FINT")
  }
  return res
}

app.http("student", {
  methods: ["GET"],
  route: "student/{identifikator}/{identifikatorverdi}",
  authLevel: "anonymous",
  handler: async (request, context) => {
    const authorizedRoles = [roles.studentRead, roles.readAll]
    return await httpTriggerMiddleware(request, context, authorizedRoles, getStudent)
  }
})
