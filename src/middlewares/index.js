/**
 * @file
 * Ce fichier est utilisé pour définir et configurer les middlewares utilisés
 * dans l'application. Il utilise le module 'fastify-plugin' pour enregistrer
 * les middlewares en tant que plugins Fastify. Le middleware 'secure' est
 * importé et sa méthode 'verifyJWT' est liée à l'instance Fastify. Ensuite,
 * tous les middlewares sont ajoutés à l'instance Fastify en utilisant la
 * méthode 'decorate'. Enfin, la fonction 'setMiddlewares' est exportée en tant
 * que plugin Fastify.
 *
 * @module index
 * @requires fastify-plugin
 * @requires ./secure
 * @param {object} fastify - Une instance de Fastify.
 * @returns {function} La fonction 'setMiddlewares' qui configure les middlewares.
 */

const fp = require('fastify-plugin')
const secure = require('./secure')

async function setMiddlewares (fastify) {
  secure.verifyJWT = secure.verifyJWT.bind(fastify)
  const middlewares = {
    secure
  }
  fastify.decorate('middlewares', middlewares)
}

module.exports = fp(setMiddlewares)
