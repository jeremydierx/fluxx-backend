/**
 * @file
 * Ce fichier enregistre les modules d'aide de l'application en tant que plugins Fastify.
 * Il importe les modules 'utils', 'secure', 'user' et 'log' et les ajoute à un objet 'helpers'.
 * Il exporte une fonction qui utilise la méthode 'decorate' de Fastify pour ajouter
 * l'objet 'helpers' à l'instance Fastify.
 *
 * @module index
 * @requires fastify-plugin
 * @requires ./utils.js
 * @requires ./secure.js
 * @requires ./user.js
 * @requires ./log.js
 * @param {object} fastify - Une instance de Fastify.
 * @returns {function} Une fonction qui enregistre les modules d'aide en tant que plugin Fastify.
 */

const fp = require('fastify-plugin')
const utils = require('./utils.js')
const secure = require('./secure.js')
const user = require('./user.js')
const log = require('./log.js')

async function setHelpers (fastify) {
  const helpers = {
    utils,
    secure,
    user,
    log
  }
  fastify.decorate('helpers', helpers)
}

module.exports = fp(setHelpers)
