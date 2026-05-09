import { logger } from "@vestfoldfylke/loglady"
import { employeeNumberExtenstionAttribute, feidenavnDomain, graphUrl, studentUpnSuffix } from "../../../config.js"
import graphToken from "./graph-token.js"

/**
 *
 * @param {string} resourceQuery
 * @param {boolean} advancedQuery
 * @returns {Promise<{[key: string]: any} | null>}
 */
const callGraph = async (resourceQuery, advancedQuery = false) => {
  if (!resourceQuery) {
    throw new Error('Missing required parameter "resourceQuery"')
  }
  if (!resourceQuery.startsWith("/")) {
    throw new Error('Parameter "resourceQuery" must start with "/"')
  }

  const accessToken = await graphToken()

  /** @type {Record<string, string>} */
  const headers = { Authorization: `Bearer ${accessToken}` }
  if (advancedQuery) {
    headers.ConsistencyLevel = "eventual"
  }

  const response = await fetch(`${graphUrl}${resourceQuery}`, { headers })

  if (!response.ok) {
    const errorData = await response.json()
    logger.error("Graph API request failed. Status: {statusCode} {statusText}, error: {@error}", response.status, response.statusText, errorData)
    if (response.status === 404) {
      return null
    }
    throw new Error(`Graph API request failed. Status: ${response.status} ${response.statusText}`)
  }

  return await response.json()
}

/**
 *
 * @param {string} upn
 * @returns {Promise<string | null>}
 */
export const getFeidenavn = async (upn) => {
  const data = await callGraph(`/users/${upn}?$select=onPremisesSamAccountName`)
  if (!data) {
    return null
  }

  if (!data.onPremisesSamAccountName) {
    throw new Error(`Could not find onPremisesSamAccountName for "${upn}"`)
  }
  return `${data.onPremisesSamAccountName}${feidenavnDomain}`
}

/**
 *
 * @param {string} upn
 * @returns {Promise<string | null>}
 */
export const getAnsattnummer = async (upn) => {
  const data = await callGraph(`/users/${upn}?$select=onPremisesExtensionAttributes`)
  if (!data) {
    return null
  }

  if (!data.onPremisesExtensionAttributes) {
    throw new Error(`Could not find onPremisesExtensionAttributes for "${upn}"`)
  }
  if (!data.onPremisesExtensionAttributes[employeeNumberExtenstionAttribute]) {
    throw new Error(`Could not find onPremisesExtensionAttributes.${employeeNumberExtenstionAttribute} for "${upn}"`)
  }
  return data.onPremisesExtensionAttributes[employeeNumberExtenstionAttribute]
}

/**
 *
 * @param {string} samAccount
 * @returns {Promise<{[key: string]: any} | null>}
 */
export const getUserFromSamAccount = async (samAccount) => {
  return await callGraph(`/users?$count=true&$filter=onPremisesSamAccountName eq '${samAccount}'`, true)
}

/**
 *
 * @param {string} feidenavn
 * @returns {Promise<{[key: string]: any} | null>}
 */
export const getStudentFromFeidenavn = async (feidenavn) => {
  const upnPrefix = feidenavn.substring(0, feidenavn.indexOf("@"))
  const upn = `${upnPrefix}${studentUpnSuffix}`

  const data = await callGraph(`/users/${upn}`)
  if (!data) {
    return null
  }

  return data
}

/**
 *
 * @param {string} ansattnummer
 * @returns {Promise<{[key: string]: any} | null>}
 */
export const getUserFromAnsattnummer = async (ansattnummer) => {
  return await callGraph(`/users?$count=true&$filter=onPremisesExtensionAttributes/${employeeNumberExtenstionAttribute}+eq+'${ansattnummer}'`, true)
}

/**
 *
 * @param {string} ansattnummer
 * @returns {Promise<{feidenavn: string} | null>}
 */
export const getFeidenavnFromAnsattnummer = async (ansattnummer) => {
  const data = await callGraph(`/users?$count=true&$filter=onPremisesExtensionAttributes/${employeeNumberExtenstionAttribute}+eq+'${ansattnummer}'&$select=onPremisesSamAccountName`, true)

  if (data?.value && data.value.length === 1 && data.value[0].onPremisesSamAccountName) {
    return { feidenavn: `${data.value[0].onPremisesSamAccountName}${feidenavnDomain}` }
  }

  return null
}
