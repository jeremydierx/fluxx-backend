/**
 * @file
 * Fichier principal pour le démarrage de l'application en mode serveur web.
 * Il importe les modules nécessaires, récupère les variables d'environnement
 * et configure le serveur en fonction de l'environnement.
 *
 * En mode développement, Node.js est configuré pour gérer le protocole HTTPS.
 * Les options pour le protocole HTTPS sont définies en lisant les clés et
 * certificats à partir des chemins spécifiés dans les variables d'environnement.
 *
 * @requires module:fs
 * @requires module:./src/helpers/utils.js
 * @requires module:process
 * @requires module:https
 * @requires module:pino-pretty
 *
 * @global
 * @typedef {Object} options
 * @property {Object} logger - Les options pour le logger.
 * @property {string} logger.level - Le niveau de log.
 * @property {Object} logger.transport - Les options pour le transport de log.
 * @property {string} logger.transport.target - Le nom du module de transport.
 * @property {Object} https - Les options pour le protocole HTTPS.
 * @property {Buffer} https.key - La clé privée pour le protocole HTTPS.
 * @property {Buffer} https.cert - Le certificat pour le protocole HTTPS.
 * @property {boolean} trustProxy - Indique si le serveur doit faire confiance au proxy en amont.
 */

const fs = require('fs')

const { getEnv } = require('./src/helpers/utils.js')
const env = getEnv()

// En development c’est nodejs qui gère le HTTPS
let options = {}
if (env.BACKEND_ENV === 'development') {
  options = {
    logger: {
      level: 'info',
      transport: {
        target: 'pino-pretty'
      }
    },
    https: {
      key: fs.readFileSync(env.DEV_TLS_KEY),
      cert: fs.readFileSync(env.DEV_TLS_CRT)
    }
  }

// En production c’est Nginx qui gère le HTTPS
} else {
  options = {
    trustProxy: true,
    logger: {
      level: 'info',
      transport: {
        target: 'pino-pretty'
      }
    }
  }
}

options.appMode = 'web'
options.bodyLimit = 1 * 1024 * 1024 * 1024 // Taille du payload limité à 1 Go

const server = require('./src/app')(options)

const start = async () => {
  try {
    await server.listen({
      port: env.BACKEND_PORT,
      host: env.BACKEND_HOST
    })
  } catch (err) {
    server.log.error(err)
    process.exit(0)
  }
}

start()

module.exports = server
