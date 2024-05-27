/**
 * @file
 * Ce fichier exporte une fonction qui retourne un objet de configuration
 * pour la base de données en fonction des variables d'environnement.
 *
 * @module db
 * @param {object} env - Les variables d'environnement.
 * @property {string} env.REDIS_DB_INDEX - L'index de la base de données Redis.
 * @property {string} env.REDIS_DB_PASSWORD - Le mot de passe de la base de données Redis.
 * @property {string} env.REDIS_DB_PORT - Le port de la base de données Redis.
 * @returns {object} Un objet de configuration pour la base de données.
 */

module.exports = (env) => {
  return {
    redisDBIndex: env.REDIS_DB_INDEX,
    redisDBPassword: env.REDIS_DB_PASSWORD,
    redisDBPort: env.REDIS_DB_PORT
  }
}
