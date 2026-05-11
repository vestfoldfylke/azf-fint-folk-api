import { app } from "@azure/functions"
import { logger } from "@vestfoldfylke/loglady"
import { roles } from "../../config.js"
import { fintTeacher } from "../lib/fint-teacher.js"
import { isEmail, isFnr, isGuid } from "../lib/helpers/identifikator-type.js"
import { fintGraph } from "../lib/requests/call-fint.js"
import { getFeidenavn, getFeidenavnFromAnsattnummer } from "../lib/requests/call-graph.js"
import { HttpError } from "../middleware/http-error.js"
import { httpTriggerMiddleware } from "../middleware/http-trigger.js"

const getTeacher = async (request) => {
  const { identifikator, identifikatorverdi } = request.params
  const validIdentifiers = ["feidenavn", "upn", "fodselsnummer"]
  if (!validIdentifiers.includes(identifikator)) {
    throw new HttpError(400, `Query param ${identifikator} is not valid - must be ${validIdentifiers.join(" or ")}`)
  }

  if (identifikator === "feidenavn" && !isEmail(identifikatorverdi)) {
    throw new HttpError(400, '"feidenavn" must be valid email')
  }
  if (identifikator === "upn" && !isEmail(identifikatorverdi) && !isGuid(identifikatorverdi)) {
    throw new HttpError(400, '"upn" must be valid email or guid')
  }
  if (identifikator === "fodselsnummer" && !isFnr(identifikatorverdi)) {
    throw new HttpError(400, '"fodselsnummer" must be a numerical string, and exactly 11 characters')
  }

  let feidenavn

  if (identifikator === "upn") {
    logger.info('Queryparam is type "upn", fetching feidenavn from EntraID')
    try {
      feidenavn = await getFeidenavn(identifikatorverdi)
      if (!feidenavn) {
        throw new HttpError(404, "No user with provided upn found in EntraID")
      }
      logger.info(`Got feidenavn: ${feidenavn}`)
    } catch (error) {
      logger.errorException(error, "Failed when getting feidenavn from EntraID")
      throw error
    }
  }

  if (identifikator === "fodselsnummer") {
    logger.info('Queryparam is type "fodselsnummer", fetching ansattnummer from FINT and then feidenavn from EntraID')
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
      const ansattnummer = data.person?.personalressurs?.ansattnummer?.identifikatorverdi
      if (!ansattnummer) {
        throw new HttpError(404, "No teacher with provided identificator found in FINT")
      }
      const azureFeidenavnRes = await getFeidenavnFromAnsattnummer(ansattnummer)
      if (!azureFeidenavnRes) {
        throw new HttpError(404, "No teacher with provided identificator found in FINT")
      }
      feidenavn = azureFeidenavnRes.feidenavn
    } catch (error) {
      logger.errorException(error, "Failed when getting feidenavn from FINT")
      throw error
    }
  }

  if (identifikator === "feidenavn") {
    feidenavn = identifikatorverdi
  }

  const includeStudentSsn = request.query.get("includeStudentSsn") === "true"
  const res = await fintTeacher(feidenavn, includeStudentSsn)
  if (!res) {
    throw new HttpError(404, "No teacher with provided identificator found in FINT")
  }
  return res
}

app.http("teacher", {
  methods: ["GET"],
  route: "teacher/{identifikator}/{identifikatorverdi}",
  authLevel: "anonymous",
  handler: async (request, context) => {
    const authorizedRoles = [roles.teacherRead, roles.readAll]
    return await httpTriggerMiddleware(request, context, authorizedRoles, getTeacher)
  }
})
