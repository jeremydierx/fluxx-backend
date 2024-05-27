/**
 * @file
 * Ce fichier exporte une fonction qui retourne un objet de configuration
 * pour le frontend en fonction des variables d'environnement.
 *
 * @module frontend
 * @param {object} env - Les variables d'environnement.
 * @property {string} env.AUTHORIZED_FRONTEND - Les frontends autorisés.
 * @property {string} env.APP_URL - L'URL de l'application.
 * @returns {object} Un objet de configuration pour le frontend.
 */

module.exports = env => ({
  authorized: env.AUTHORIZED_FRONTEND,
  appUrl: env.APP_URL
})
