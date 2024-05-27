/**
 * @fileoverview Ce fichier contient des fonctions utilitaires pour diverses
 * opérations telles que la vérification de la vacuité d'un objet, la récupération
 * des variables d'environnement, la compilation de templates Handlebars et le
 * formatage de dates en français.
 *
 * @requires handlebars: Pour la compilation de templates Handlebars.
 * @requires path: Pour la résolution des chemins de fichiers.
 * @requires dotenv: Pour la lecture des fichiers .env.
 * @requires dotenv-parse-variables: Pour le parsing des variables d'environnement.
 *
 * @exports isEmpty: Vérifie si un objet est vide.
 * @exports getEnv: Récupère les variables d'environnement d'un fichier .env.
 * @exports handlebars: Compile un template Handlebars avec des options données.
 * @exports formatDateTimeFr: Formate une date en français.
 */

const Handlebars = require('handlebars')

module.exports = {

  /**
   * Vérifie si un objet est vide. Si l'objet n'est pas de type 'object' ou s'il
   * contient des clés, la fonction retourne 'false'. Dans tous les autres cas, elle
   * retourne 'true'.
   *
   * @function isEmpty
   * @param {Object} o - L'objet à vérifier.
   * @returns {boolean} 'true' si l'objet est vide, 'false' sinon.
   */
  isEmpty: (o) => {
    if (o && typeof o === 'object' && o.constructor === Object) {
      return Object.keys(o).length === 0
    }
    return true
  },

  /**
   * Compile un template Handlebars avec des options données.
   *
   * @function handlebars
   * @param {string} message - Le template Handlebars à compiler.
   * @param {Object} opts - Les options à passer au template.
   * @returns {string} Le template compilé.
   */
  getEnv: (fileName = '.env') => {
    const path = require('path')
    const envFile = path.resolve(process.cwd(), fileName)
    const dotenv = require('dotenv')
    const dotenvParseVariables = require('dotenv-parse-variables')
    const env = dotenv.config({
      path: envFile
    })
    if (env.error) throw env.error
    return dotenvParseVariables(env.parsed)
  },

  /**
   * Compile un template Handlebars avec des options données.
   *
   * @function handlebars
   * @param {string} message - Le template Handlebars à compiler.
   * @param {Object} opts - Les options à passer au template.
   * @returns {string} Le template compilé.
   */
  handlebars: (message, opts) => {
    const messageTpl = Handlebars.compile(message)
    return messageTpl(opts)
  },

  /**
   * Formate une date en français à partir d'un timestamp.
   *
   * @function formatDateTimeFr
   * @param {number} timestamp - Le timestamp à formater.
   * @returns {string} La date formatée en français.
   */
  formatDateTimeFr: (timestamp) => {
    // on format avec Intl
    const dateTime = new Date(timestamp)
    const options = {
      timeZone: 'Europe/Paris',
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }
    return new Intl.DateTimeFormat('fr-FR', options).format(dateTime)
  }
}
