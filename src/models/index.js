/**
 * index.js
 *
 * Ce fichier définit et exporte une fonction qui ajoute des modèles à une instance Fastify.
 * Les modèles incluent 'user', 'mailer' et 'log'.
 *
 * Les modèles sont ajoutés en utilisant la méthode 'decorate' de Fastify, qui permet d'ajouter de nouvelles propriétés à l'instance Fastify.
 *
 * Enfin, la fonction est encapsulée dans une fonction point fixe (fp) pour permettre une utilisation asynchrone.
 *
 * @module index.js
 */

const fp = require('fastify-plugin')
const user = require('./user')
const log = require('./log')
const mailer = require('./mailer')

async function setModels (fastify) {
  user.functionsToBind.forEach(f => {
    user[f] = user[f].bind(fastify)
  })
  log.functionsToBind.forEach(f => {
    log[f] = log[f].bind(fastify)
  })
  mailer.functionsToBind.forEach(f => {
    mailer[f] = mailer[f].bind(fastify)
  })

  const models = {
    user,
    log,
    mailer
  }

  fastify.decorate('models', models)
}

module.exports = fp(setModels)
