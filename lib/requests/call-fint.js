import axios from 'axios'
import { fint } from '../../config.js'
import getFintToken from './fint-token.js'

/**
 * @param {string} payload - body of https request
 * @returns {object} result of request
 */
export const fintGraph = async (payload, context) => {
  if (!payload) throw new Error('Missing required parameter "payload"')
  const token = await getFintToken(context)
  const { data } = await axios.post(`${fint.url}/graphql/graphql`, payload, { headers: { Authorization: `Bearer ${token}` } })
  if (data.errors && data.errors.length > 0) throw new Error(typeof data.errors === 'object' ? JSON.stringify(data.errors, null, 2) : data.errors.toString())
  return data
}

/**
 * @param {string} resource - body of https request
 * @returns {object} result of request
 */
export const fintRest = async (resource, context) => {
  if (!resource) throw new Error('Missing required parameter "resource"')
  const token = await getFintToken(context)
  const { data } = await axios.get(`${fint.url}/${resource}`, { headers: { Authorization: `Bearer ${token}` } })
  return data
}
