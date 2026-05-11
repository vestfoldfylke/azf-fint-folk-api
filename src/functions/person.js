import { app } from "@azure/functions"
import { roles } from "../../config.js"
import { fintPerson } from "../lib/fint-person.js"
import { isFnr } from "../lib/helpers/identifikator-type.js"
import { HttpError } from "../middleware/http-error.js"
import { httpTriggerMiddleware } from "../middleware/http-trigger.js"

const getPerson = async (request) => {
  const { identifikator, identifikatorverdi } = request.params
  const validIdentifiers = ["fodselsnummer"]
  if (!validIdentifiers.includes(identifikator)) {
    throw new HttpError(400, `Query param ${identifikator} is not valid - must be ${validIdentifiers.join(" or ")}`)
  }

  if (identifikator === "fodselsnummer" && !isFnr(identifikatorverdi)) {
    throw new HttpError(400, '"fodselsnummer" must be a numerical string, and exactly 11 characters')
  }

  const res = await fintPerson(identifikatorverdi)
  if (!res) {
    throw new HttpError(404, "No person with provided identificator found in FINT")
  }
  return res
}

app.http("person", {
  methods: ["GET"],
  route: "person/{identifikator}/{identifikatorverdi}",
  authLevel: "anonymous",
  handler: async (request, context) => {
    const authorizedRoles = [roles.personRead, roles.readAll]
    return await httpTriggerMiddleware(request, context, authorizedRoles, getPerson)
  }
})
