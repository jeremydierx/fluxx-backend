/**
 * @file
 * Ce fichier exporte une fonction qui retourne un objet de configuration
 * pour les tokens en fonction des variables d'environnement.
 *
 * @module token
 * @param {object} env - Les variables d'environnement.
 * @property {string} env.ACCESS_TOKEN_TYPE - Le type du token d'accès.
 * @property {string} env.ACCESS_TOKEN_ALGORITHM - L'algorithme du token d'accès.
 * @property {string} env.ACCESS_TOKEN_SECRET - Le secret du token d'accès.
 * @property {string} env.ACCESS_TOKEN_EXPIRES_IN - La durée de vie du token d'accès.
 * @property {string} env.ACCESS_TOKEN_AUDIENCE - L'audience du token d'accès.
 * @property {string} env.ACCESS_TOKEN_ISSUER - L'émetteur du token d'accès.
 * @property {string} env.USER_ID_TOKEN_EXPIRES_IN - La durée de vie du token d'ID utilisateur.
 * @property {string} env.REFRESH_TOKEN_EXPIRES_IN - La durée de vie du token de rafraîchissement.
 * @property {string} env.COOKIE_SECRET - Le secret du cookie.
 * @property {string} env.RESET_PASSWORD_TOKEN_EXPIRES_IN - La durée de vie du token de réinitialisation de mot de passe.
 * @returns {object} Un objet de configuration pour les tokens.
 */

module.exports = env => ({
  accessToken: {
    type: env.ACCESS_TOKEN_TYPE || 'Bearer',
    algorithm: env.ACCESS_TOKEN_ALGORITHM || 'HS256',
    secret: env.ACCESS_TOKEN_SECRET,
    expiresIn: env.ACCESS_TOKEN_EXPIRES_IN,
    audience: env.ACCESS_TOKEN_AUDIENCE,
    issuer: env.ACCESS_TOKEN_ISSUER,
    userIdTokenExpiresIn: env.USER_ID_TOKEN_EXPIRES_IN
  },
  refreshToken: {
    expiresIn: env.REFRESH_TOKEN_EXPIRES_IN
  },
  cookie: {
    secret: env.COOKIE_SECRET
  },
  askResetPasswordToken: {
    expiresIn: env.RESET_PASSWORD_TOKEN_EXPIRES_IN
  }
})
