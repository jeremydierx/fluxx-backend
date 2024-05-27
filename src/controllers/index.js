/**
 * @file
 * Ce fichier est utilisé pour enregistrer les contrôleurs de l'application en tant que plugins Fastify.
 * Il importe le contrôleur 'user' et l'ajoute à un objet 'controllers'.
 * Ensuite, il utilise la méthode 'decorate' de Fastify pour ajouter l'objet 'controllers' à l'instance Fastify.
 * Enfin, il exporte une fonction qui enregistre les contrôleurs en tant que plugin Fastify en utilisant le module 'fastify-plugin'.
 *
 * @module index
 * @requires fastify-plugin
 * @requires ./user
 * @param {object} fastify - Une instance de Fastify.
 * @returns {function} Une fonction qui enregistre les contrôleurs en tant que plugin Fastify.
 */

const fp = require('fastify-plugin')
const user = require('./user')

module.exports = fp(async function (fastify) {
  const controllers = {
    user
  }
  fastify.decorate('controllers', controllers)
})
