/**
 * @file
 * Ce fichier enregistre les erreurs de l'application en tant que plugins Fastify.
 * Il importe le module 'user' qui contient les erreurs liées à l'utilisateur.
 * Il exporte une fonction qui utilise la méthode 'decorate' de Fastify pour ajouter
 * les erreurs à l'instance Fastify.
 *
 * @module index
 * @requires fastify-plugin
 * @requires ./user
 * @param {object} fastify - Une instance de Fastify.
 * @returns {function} Une fonction qui enregistre les erreurs en tant que plugin Fastify.
 */

const fp = require('fastify-plugin')
const user = require('./user')

module.exports = fp(async function (fastify) {
  const errors = {
    user
  }
  fastify.decorate('errors', errors)
})
