/**
 * @file
 * Ce fichier exporte des fonctions d'aide pour les logs.
 *
 * @requires crypto
 */

module.exports = {
  /**
   * @function formatRead
   * Cette fonction formate les données des logs pour la lecture.
   * Elle convertit les données JSON en objet.
   * @param {object} log - L'objet log.
   * @returns {object} L'objet log formaté.
   */
  formatRead: (log) => {
    log = JSON.parse(log)
    return log
  }
}
