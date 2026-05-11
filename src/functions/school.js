import { app } from "@azure/functions"
import { roles } from "../../config.js"
import { fintSchool } from "../lib/fint-school.js"
import { HttpError } from "../middleware/http-error.js"
import { httpTriggerMiddleware } from "../middleware/http-trigger.js"

const getSchool = async (request) => {
  const { identifikator, identifikatorverdi } = request.params
  const validIdentifiers = ["skolenummer"]
  if (!validIdentifiers.includes(identifikator)) {
    throw new HttpError(400, `Query param ${identifikator} is not valid - must be ${validIdentifiers.join(" or ")}`)
  }

  if (identifikator === "skolenummer" && !/^\d+$/.test(identifikatorverdi)) {
    throw new HttpError(400, '"skolenummer" must be numerical')
  }

  const includeStudentSsn = request.query.get("includeStudentSsn") === "true"
  const res = await fintSchool(identifikatorverdi, includeStudentSsn)
  if (!res) {
    throw new HttpError(404, "No school with provided identificator found in FINT")
  }
  return res
}

app.http("school", {
  methods: ["GET"],
  route: "school/{identifikator}/{identifikatorverdi}",
  authLevel: "anonymous",
  handler: async (request, context) => {
    const authorizedRoles = [roles.readAll]
    return await httpTriggerMiddleware(request, context, authorizedRoles, getSchool)
  }
})
