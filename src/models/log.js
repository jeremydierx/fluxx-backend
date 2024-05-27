/**
 * Ce module exporte des fonctions pour gérer les logs.
 *
 * @module log
 * @requires redis
 * @requires helpers/utils
 *
 * @function add
 * @async
 * @param {Object} params - Les paramètres pour l'ajout d'un log.
 * @param {boolean} params.save - Si vrai, le log sera sauvegardé.
 * @param {string} params.type - Le type de log à ajouter.
 * @returns {Promise<Object>} Un objet contenant le statut de l'ajout du log.
 *
 * @function getAll
 * @async
 * @param {Object} params - Les paramètres pour récupérer les logs.
 * @param {number} params.start - L'index de départ pour la récupération des logs.
 * @param {number} params.stop - L'index de fin pour la récupération des logs.
 * @param {string} params.type - Le type de log à récupérer.
 * @returns {Promise<Array>} Un tableau contenant les logs récupérés.
 */

module.exports = {

  /**
   * Cette fonction ajoute un nouveau log dans le système. Elle prend un objet
   * en paramètre qui peut contenir les informations du log. Si l'option "save"
   * est définie à true, le log est également enregistré dans la base de données
   * Redis. La fonction renvoie un objet avec la propriété "logAdded" définie à
   * true si le log a été ajouté avec succès, sinon elle renvoie l'erreur
   * rencontrée.
   *
   * @function add
   * @async
   * @param {object} params - Les informations du log.
   * @param {string} params.type - Le type du log.
   * @param {boolean} [params.save=false] - Si le log doit être enregistré dans
   * la base de données.
   * @returns {Promise<object>} Un objet indiquant si le log a été ajouté avec
   * succès ou l'erreur rencontrée.
   * @throws {Error} Si une erreur se produit lors de l'ajout du log.
   */
  add: async function (params = {}) {
    try {
      params.createdOn = Date.now()
      params.dateTimeFr = this.helpers.utils.formatDateTimeFr(params.createdOn)
      const tasks = []
      tasks.push(['publish', 'logChannel', JSON.stringify(params)])
      if (params.save) {
        tasks.push(['zadd', `log:${params.type}`, 'NX', params.createdOn, JSON.stringify(params)])
        tasks.push(['expire', `log:${params.type}`, 60 * 60 * 24 * 30])
      }
      await this.redis.multi(tasks).exec()
      return { logAdded: true }
    } catch (error) {
      return error
    }
  },

  /**
   * Cette fonction récupère tous les logs d'un certain type dans la base de
   * données Redis. Elle prend un objet en paramètre qui peut contenir les
   * options suivantes : start (l'index de début pour la récupération des logs)
   * et stop (l'index de fin pour la récupération des logs). Si aucune option
   * n'est fournie, des valeurs par défaut sont utilisées. La fonction renvoie
   * un tableau de logs ou l'erreur rencontrée.
   *
   * @function getAll
   * @async
   * @param {object} params - Les options pour la récupération des logs.
   * @param {number} [params.start=0] - L'index de début pour la récupération
   * des logs.
   * @param {number} [params.stop=-1] - L'index de fin pour la récupération des
   * logs.
   * @returns {Promise<Array|Error>} Un tableau de logs ou l'erreur rencontrée.
   * @throws {Error} Si une erreur se produit lors de la récupération des logs.
   */
  getAll: async function (params = {}) {
    try {
      const start = params.start || 0
      const stop = params.stop || -1
      const logs = await this.redis.zrangebyscore(`log:${params.type}`, start, stop)
      for (let i = 0; i < logs.length; i++) {
        logs[i] = this.helpers.log.formatRead(logs[i])
      }
      return logs
    } catch (error) {
      return error
    }
  },

  /**
   * Cette fonction supprime tous les logs d'un certain type dans la base de
   * données Redis. Elle prend un objet en paramètre qui peut contenir les
   * options suivantes : start (l'index de début pour la suppression des logs)
   * et stop (l'index de fin pour la suppression des logs). Si aucune option
   * n'est fournie, des valeurs par défaut sont utilisées. La fonction renvoie
   * un objet avec la propriété "logsDeleted" définie à true si les logs ont été
   * supprimés avec succès, sinon elle renvoie l'erreur rencontrée.
   *
   * @function delAll
   * @async
   * @param {object} params - Les options pour la suppression des logs.
   * @param {number} [params.start=0] - L'index de début pour la suppression
   * des logs.
   * @param {number} [params.stop=-1] - L'index de fin pour la suppression des
   * logs.
   * @returns {Promise<object|Error>} Un objet indiquant si les logs ont été
   * supprimés avec succès ou l'erreur rencontrée.
   * @throws {Error} Si une erreur se produit lors de la suppression des logs.
   */
  delAll: async function (params = {}) {
    try {
      let logsDeleted = false
      const start = params.start || 0
      const stop = params.stop || -1
      if (params.type) {
        await this.redis.zremrangebyscore(`log:${params.type}`, start, stop)
        logsDeleted = true
      }
      return { logsDeleted }
    } catch (error) {
      return error
    }
  },
  functionsToBind: [
    'add',
    'getAll',
    'delAll'
  ]
}
