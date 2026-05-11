/**
 *
 * @param {string} identifikator
 * @returns {boolean}
 */
export const isEmail = (identifikator) => {
  return Boolean(
    String(identifikator)
      .toLowerCase()
      .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
  )
}

/**
 *
 * @param {string} identifikator
 * @returns {boolean}
 */
export const isGuid = (identifikator) => {
  return Boolean(String(identifikator).match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[4][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/))
}

/**
 *
 * @param {string} str
 * @returns {boolean}
 */
const isStringInt = (str) => {
  const num = Number(str)
  // Check if it's a valid integer and the string wasn't empty/whitespace
  return Number.isInteger(num) && str.trim() !== ""
}

/**
 *
 * @param {string} identifikator
 * @returns {boolean}
 */
export const isFnr = (identifikator) => {
  return Boolean(isStringInt(identifikator) && identifikator.length === 11)
}

/**
 *
 * @param {string} identifikator
 * @returns {boolean}
 */
export const isAnsattnummer = (identifikator) => {
  return Boolean(isStringInt(identifikator) && identifikator.length < 20 && identifikator.length > 0) // Hakke peiling på hvor langt et ansattnummer kan være
}
