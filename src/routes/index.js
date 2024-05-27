/**
 * index.js
 * Ce fichier est utilisé pour enregistrer toutes les routes de l'application
 * Fastify. Il exporte une fonction asynchrone qui prend une instance de
 * Fastify en argument.
 *
 * La fonction itère sur un tableau de modules de routes (dans ce cas, seul le
 * module 'user' est inclus). Pour chaque module de routes, elle appelle la
 * fonction exportée par le module avec l'instance Fastify en argument.
 *
 * Chaque module de routes est censé retourner un tableau de configurations de
 * routes. La fonction itère sur ce tableau et enregistre chaque route sur
 * l'instance Fastify en utilisant la méthode 'route'.
 *
 * @param {Object} fastify - Une instance de Fastify.
 * @returns {void}
 */

module.exports = async (fastify) => {
  [
    require('./user')
  ].forEach((routes) => {
    routes(fastify).forEach((route) => {
      fastify.route(route)
    })
  })
}
