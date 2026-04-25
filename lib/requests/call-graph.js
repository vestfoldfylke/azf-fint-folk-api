import graphToken from './graph-token.js'
import { graphUrl, feidenavnDomain, employeeNumberExtenstionAttribute, studentUpnSuffix } from '../../config.js'

const callGraph = async (resourceQuery, advancedQuery = false) => {
  if (!resourceQuery) throw new Error('Missing required parameter "resourceQuery"')
  if (!resourceQuery.startsWith('/')) throw new Error('Parameter "resourceQuery" must start with "/"')
  
  
  const accessToken = await graphToken()

  const headers = { Authorization: `Bearer ${accessToken}` }
  if (advancedQuery) {
    headers['ConsistencyLevel'] = 'eventual'
  }

  const response = await fetch(`${graphUrl}${resourceQuery}`, { headers })

  if (!response.ok) {
    const errorData = await response.json()
    logger.error('Graph API request failed. Status: {statusCode} {statusText}, error: {@error}', response.status, response.statusText, errorData)
    throw new Error(`Graph API request failed. Status: ${response.status} ${response.statusText}`)
  }
  
  return await response.json()
}

export const getFeidenavn = async (upn) => {
  const data = await callGraph(`/users/${upn}?$select=onPremisesSamAccountName`)
  if (!data.onPremisesSamAccountName) throw new Error(`Could not find onPremisesSamAccountName for "${upn}"`)
  return `${data.onPremisesSamAccountName}${feidenavnDomain}`
}

export const getAnsattnummer = async (upn) => {
  const data = await callGraph(`/users/${upn}?$select=onPremisesExtensionAttributes`)
  if (!data.onPremisesExtensionAttributes) throw new Error(`Could not find onPremisesExtensionAttributes for "${upn}"`)
  if (!data.onPremisesExtensionAttributes[employeeNumberExtenstionAttribute]) throw new Error(`Could not find onPremisesExtensionAttributes.${employeeNumberExtenstionAttribute} for "${upn}"`)
  return data.onPremisesExtensionAttributes[employeeNumberExtenstionAttribute]
}

export const getUserFromSamAccount = async (samAccount) => {
  return await callGraph(`/users?$count=true&$filter=onPremisesSamAccountName eq '${samAccount}'`)
}

export const getStudentFromFeidenavn = async (feidenavn) => {
  const upnPrefix = feidenavn.substring(0, feidenavn.indexOf('@'))
  const upn = `${upnPrefix}${studentUpnSuffix}`
  
  return await callGraph(`/users/${upn}`)
}

export const getUserFromAnsattnummer = async (ansattnummer) => {
  return await callGraph(`/users?$count=true&$filter=onPremisesExtensionAttributes/${employeeNumberExtenstionAttribute}+eq+'${ansattnummer}'`)
}

export const getFeidenavnFromAnsattnummer = async (ansattnummer) => {
  const data = await callGraph(`/users?$count=true&$filter=onPremisesExtensionAttributes/${employeeNumberExtenstionAttribute}+eq+'${ansattnummer}'&$select=onPremisesSamAccountName`, true)

  if (data.value && data.value.length === 1 && data.value[0].onPremisesSamAccountName) {
    return { feidenavn: `${data.value[0].onPremisesSamAccountName}${feidenavnDomain}` }
  } else {
    return null
  }
}
