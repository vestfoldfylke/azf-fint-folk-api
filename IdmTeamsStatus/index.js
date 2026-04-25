import { logger } from '@vestfoldfylke/loglady'
import { teamsStatusAlert } from '../lib/fint-organization-fixed/teams-status-alert.js'

export default async function (context, myTimer) {
  logger.logConfig({
    prefix: 'azf-fint-folk - IDM Teams Status'
  })
  logger.info('Running timer trigger')

  try {
    await teamsStatusAlert()
  } catch (error) {
    logger.error('Teams status alert failed... {err}', error.response?.data || error.stack || error.toString())
  }
}
