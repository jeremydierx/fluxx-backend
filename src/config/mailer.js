/**
 * @file
 * Ce fichier exporte une fonction qui retourne un objet de configuration
 * pour le mailer en fonction des variables d'environnement.
 *
 * @module mailer
 * @param {object} env - Les variables d'environnement.
 * @property {string} env.MAILER_MAIN_FROM - L'adresse d'expédition principale.
 * @property {string} env.MAILER_HOST - L'hôte du mailer.
 * @property {string} env.MAILER_PORT - Le port du mailer.
 * @property {boolean} env.MAILER_SECURE - La sécurité du mailer.
 * @property {string} env.MAILER_AUTH_USER - L'utilisateur pour l'authentification.
 * @property {string} env.MAILER_AUTH_PASS - Le mot de passe pour l'authentification.
 * @property {string} env.DKIM_DOMAIN_NAME - Le nom de domaine pour DKIM.
 * @property {string} env.DKIM_KEY_SELECTOR - Le sélecteur de clé pour DKIM.
 * @property {string} env.DKIM_PRIVATE_KEY_PATH - Le chemin vers la clé privée pour DKIM.
 * @property {string} env.ASK_RESET_PASSWORD_URL - L'URL pour réinitialiser le mot de passe.
 * @returns {object} Un objet de configuration pour le mailer.
 */

module.exports = env => ({
  mainFrom: env.MAILER_MAIN_FROM,
  host: env.MAILER_HOST,
  port: env.MAILER_PORT,
  secure: env.MAILER_SECURE,
  auth: {
    user: env.MAILER_AUTH_USER,
    pass: env.MAILER_AUTH_PASS
  },
  dkim: {
    domainName: env.DKIM_DOMAIN_NAME,
    keySelector: env.DKIM_KEY_SELECTOR,
    privateKeyPath: env.DKIM_PRIVATE_KEY_PATH
  },
  askResetPasswordUrl: env.ASK_RESET_PASSWORD_URL
})
