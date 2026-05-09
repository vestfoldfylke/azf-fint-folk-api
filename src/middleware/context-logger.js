import { AsyncLocalStorage } from "node:async_hooks";

import { logger } from "@vestfoldfylke/loglady";

const asyncLocalStorage = new AsyncLocalStorage();

// Runs the provided callback function within a context containing the provided LogConfig.

/**
 * Runs the provided callback function within a context containing the provided logConfig.
 * @param {Object} logConfig - The log configuration object.
 * @param {() => Promise<any>} callback - The callback to run in context.
 */
export async function runInContext(logConfig, callback) {
  logger.setContextProvider(() => asyncLocalStorage.getStore());
  return asyncLocalStorage.run(logConfig, callback);
}

/**
 * Updates the current context's logConfig with the provided values.
 * @param {Object} logConfig - The log configuration object.
 */
export function updateContext(logConfig) {
  const _logConfig = asyncLocalStorage.getStore();
  if (_logConfig) {
    Object.assign(_logConfig, logConfig);
  }
}