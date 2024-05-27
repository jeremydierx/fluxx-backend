/**
 * @file
 * Ce fichier exporte une fonction qui retourne un objet de configuration
 * pour le backend en fonction des variables d'environnement.
 *
 * @module backend
 * @param {object} env - Les variables d'environnement.
 * @property {string} env.BACKEND_ENV - L'environnement du backend.
 * @property {string} env.BACKEND_HOST - L'hôte du backend.
 * @property {string} env.BACKEND_PORT - Le port du backend.
 * @property {string} env.APP_NAME - Le nom de l'application.
 * @property {string} env.NUM_OF_WORKERS - Le nombre de workers.
 * @returns {object} Un objet de configuration pour le backend.
 */

module.exports = env => ({
  env: env.BACKEND_ENV,
  host: env.BACKEND_HOST,
  port: env.BACKEND_PORT,
  appName: env.APP_NAME,
  numOfWorkers: env.NUM_OF_WORKERS
})
