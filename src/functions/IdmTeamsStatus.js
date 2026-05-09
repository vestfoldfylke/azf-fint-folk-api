import { app } from "@azure/functions"
import { logger } from "@vestfoldfylke/loglady"
import { teamsStatusAlert } from "../lib/fint-organization-fixed/teams-status-alert.js"

app.timer("IdmTeamsStatus", {
  schedule: "0 0 7,18 * * *", // Every day at 07:00 and 18:00
  handler: async () => {
    logger.logConfig({
      prefix: "azf-fint-folk - IDM Teams Status"
    })
    logger.info("Running timer trigger")

    try {
      await teamsStatusAlert()
    } catch (error) {
      logger.errorException(error, "Teams status alert failed... {err}", error.stack || error.toString())
    }
  }
})
