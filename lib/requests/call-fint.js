import { fint } from '../../config.js'
import getFintToken from './fint-token.js'

/**
 * @param {object} payload - body of https request
 * @returns {object} result of request
 */
export const fintGraph = async (payload) => {
  if (!payload) throw new Error('Missing required parameter "payload"')
  const token = await getFintToken()

  const response = await fetch(`${fint.url}/graphql/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const errorData = await response.json()
    logger.error('Fint GraphQL request failed. Status: {statusCode} {statusText}, error: {@error}', response.status, response.statusText, errorData)
    throw new Error(`Fint GraphQL request failed. Status: ${response.status} ${response.statusText}`)
  }

  const fintResponseData = await response.json()
  // Check if first level of response returns property with value null, which indicates the specific resource requested was not found. Return fintDataResponse in that case for now (FINT V3 behavior)
  if (fintResponseData.data) {
    const firstLevelNull = Object.values(fintResponseData.data)[0] === null
    if (firstLevelNull) {
      return fintResponseData
    }
  }
  if (fintResponseData.errors && fintResponseData.errors.length > 0) throw new Error(typeof fintResponseData.errors === 'object' ? JSON.stringify(fintResponseData.errors, null, 2) : fintResponseData.errors.toString())
  return fintResponseData
}

/**
 * @param {string} resource
 * @returns {object} result of request
 */
export const fintRest = async (resource) => {
  if (!resource) throw new Error('Missing required parameter "resource"')
  const token = await getFintToken()

  const response = await fetch(`${fint.url}/${resource}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!response.ok) {
    const errorData = await response.json()
    logger.error('Fint REST request failed. Status: {statusCode} {statusText}, error: {@error}', response.status, response.statusText, errorData)
    throw new Error(`Fint REST request failed with code ${response.status} ${response.statusText}`)
  }

  return await response.json()
}
