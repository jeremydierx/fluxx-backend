/**
 * @file
 * Ce fichier est utilisé pour configurer l'application en fonction des variables d'environnement.
 * Il importe plusieurs modules qui retournent des configurations spécifiques en fonction des variables d'environnement.
 * Il exporte deux fonctions, 'setConfig' et 'getConfig', qui retournent respectivement un plugin Fastify et un objet de configuration.
 *
 * @module index
 * @requires fastify-plugin
 * @requires ../helpers/utils.js
 * @requires ./backend
 * @requires ./db
 * @requires ./frontend
 * @requires ./token
 * @requires ./mailer
 * @requires ./assets
 * @param {object} fastify - Une instance de Fastify.
 * @param {string} envFile - Le chemin vers le fichier contenant les variables d'environnement.
 * @returns {function} 'setConfig' est une fonction qui retourne un plugin Fastify.
 * @returns {object} 'getConfig' est une fonction qui retourne un objet de configuration.
 */

const fp = require('fastify-plugin')

const { getEnv } = require('../helpers/utils.js')
const backend = require('./backend')
const db = require('./db')
const frontend = require('./frontend')
const token = require('./token')
const mailer = require('./mailer')
const assets = require('./assets')

/**
 * Cette fonction est utilisée pour configurer l'application en fonction des variables d'environnement.
 * Elle récupère les variables d'environnement à partir du fichier spécifié, puis utilise ces variables pour générer des configurations spécifiques pour le backend, la base de données, le frontend, le token, le mailer et les assets.
 * Enfin, elle ajoute ces configurations à l'instance Fastify en utilisant la méthode 'decorate'.
 *
 * @function setConfig
 * @param {object} fastify - Une instance de Fastify.
 * @param {string} [envFile='.env'] - Le chemin vers le fichier contenant les variables d'environnement.
 * @returns {function} Un plugin Fastify qui ajoute les configurations à l'instance Fastify.
 */
function setConfig (fastify, envFile = '.env') {
  const env = getEnv(envFile)
  const config = {
    backend: backend(env),
    db: db(env),
    frontend: frontend(env),
    token: token(env),
    mailer: mailer(env),
    assets: assets(env)
  }
  return fp(async () => fastify.decorate('config', config))
}

/**
 * Cette fonction est utilisée pour obtenir la configuration de l'application en fonction des variables d'environnement.
 * Elle récupère les variables d'environnement à partir du fichier spécifié, puis utilise ces variables pour générer des configurations spécifiques pour le backend, la base de données, le frontend, le token, le mailer et les assets.
 * Elle retourne ensuite ces configurations sous forme d'objet.
 *
 * @function getConfig
 * @param {string} [envFile='.env'] - Le chemin vers le fichier contenant les variables d'environnement.
 * @returns {object} Un objet contenant les configurations de l'application.
 */
function getConfig (envFile = '.env') {
  const env = getEnv(envFile)
  return {
    backend: backend(env),
    db: db(env),
    frontend: frontend(env),
    token: token(env),
    mailer: mailer(env),
    assets: assets(env)
  }
}

module.exports = {
  setConfig: setConfig,
  getConfig: getConfig()
}
