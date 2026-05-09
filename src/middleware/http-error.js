export class HttpError extends Error {
  /**
   * 
   * @param {number} status 
   * @param {string} message 
   * @param {object} [data] 
   */
  constructor(status, message, data) {
    super(message)
    this.status = status
    this.data = data || undefined
  }
}