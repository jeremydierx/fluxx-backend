/**
 * app.js
 * Ce fichier est le point d'entrée de l'application multi-mode. Il utilise
 * Fastify, un framework web pour Node.js, pour construire l'application.
 *
 * La fonction 'build' est exportée. Elle prend un objet d'options en entrée
 * qui peut inclure un mode d'application (web ou console) et des informations
 * de configuration pour la base de données Redis.
 *
 * La fonction 'build' crée une nouvelle instance de Fastify et enregistre
 * plusieurs plugins. Le plugin '@fastify/redis' est utilisé pour connecter
 * l'application à une base de données Redis. Le plugin '@fastify/cors' est
 * utilisé pour gérer les requêtes CORS.
 *
 * Les options pour les plugins sont déterminées par les options passées à la
 * fonction 'build' ou par les valeurs par défaut définies dans le fichier de
 * configuration.
 */

const Fastify = require('fastify')

function build (opts = {}) {
  const app = Fastify(opts)
  const { getConfig, setConfig } = require('./config')
  app.register(setConfig(app, opts.envFile || '.env'))

  // mode [web|console]
  opts.appMode = opts.appMode || 'console'

  switch (opts.appMode) {
  case 'console':

    app.register(require('@fastify/redis'), {
      db: opts.redisDBIndex || getConfig.db.redisDBIndex,
      password: opts.redisDBPassword || getConfig.db.redisDBPassword,
      port: opts.redisDBPort || getConfig.db.redisDBPort
    })

    app.register(require('@fastify/cors'), {
      origin: getConfig.frontend.authorized,
      credentials: true,
      preflightContinue: false,
      optionsSuccessStatus: 204,
      exposedHeaders: 'Authorization',
      methods: ['OPTION', 'HEAD', 'GET', 'PUT', 'POST', 'DELETE', 'PATCH']
    })

    app.register(require('@fastify/cookie'), {
      secret: getConfig.token.cookie.secret
    })

    app.register(require('@fastify/auth'))
    app.register(require('@fastify/jwt'), {
      secret: getConfig.token.accessToken.secret
    })

    /** Custom Fastfy plugins */
    app.register(require('./models'))
    app.register(require('./errors'))
    app.register(require('./helpers'))
    app.register(require('./middlewares'))
    app.register(require('./controllers'))
    app.register(require('./routes'))

    app.ready(() => {})
    break

  case 'web':

    app.register(require('@fastify/redis'), {
      db: opts.redisDBIndex || getConfig.db.redisDBIndex,
      password: opts.redisDBPassword || getConfig.db.redisDBPassword,
      port: opts.redisDBPort || getConfig.db.redisDBPort
    })

    app.register(require('@fastify/redis'), {
      db: opts.redisDBIndex || getConfig.db.redisDBIndex,
      password: opts.redisDBPassword || getConfig.db.redisDBPassword,
      port: opts.redisDBPort || getConfig.db.redisDBPort,
      namespace: 'subClient'
    })

    app.register(require('@fastify/cors'), {
      origin: getConfig.frontend.authorized,
      credentials: true
    })

    app.register(require('@fastify/cookie'), {
      secret: getConfig.token.cookie.secret
    })

    app.register(require('@fastify/auth'))
    app.register(require('@fastify/jwt'), {
      secret: getConfig.token.accessToken.secret
    })

    app.register(require('fastify-raw-body'), {
      field: 'rawBody',
      global: false,
      encoding: 'utf8',
      runFirst: true,
      routes: [],
      jsonContentTypes: []
    })

    // Custom Fastfy plugins
    app.register(require('./models'))
    app.register(require('./errors'))
    app.register(require('./helpers'))
    app.register(require('./middlewares'))
    app.register(require('./controllers'))
    app.register(require('./routes'))

    app.ready(() => {})
    break

  case 'worker':

    app.register(require('@fastify/redis'), {
      db: opts.redisDBIndex || getConfig.db.redisDBIndex,
      password: opts.redisDBPassword || getConfig.db.redisDBPassword,
      port: opts.redisDBPort || getConfig.db.redisDBPort
    })

    // Custom Fastfy plugins
    app.register(require('./models'))
    app.register(require('./errors'))
    app.register(require('./helpers'))
    app.register(require('./middlewares'))

    app.ready(() => {})
    break

  case 'logger':

    app.register(require('@fastify/redis'), {
      db: opts.redisDBIndex || getConfig.db.redisDBIndex,
      password: opts.redisDBPassword || getConfig.db.redisDBPassword,
      port: opts.redisDBPort || getConfig.db.redisDBPort
    })

    // Custom Fastfy plugins
    app.register(require('./models'))

    app.ready(() => {})

    app.after((err) => {
      if (err) {
        throw new Error(err)
      }
      app.redis.subscribe('logChannel', (error, count) => {
        if (error) {
          console.error('Failed to subscribe: %s', error.message)
        } else {
          console.log(`Subscribed successfully! This client is currently subscribed to logChannel (${count}).`)
        }
      })
      app.redis.on('message', (channel, message) => {
        console.log(`${channel}: ${message}`)
      })
    })
    break

  default:
    throw new Error('No app mode selected')
  }

  app.after((err) => {
    if (err) {
      // on enregistre l’évenement (log:events)
      app.models.log.add({
        type: 'errors',
        event: 'app_on_error',
        message: `App started in ${opts.appMode} mode with error ${err}`,
        save: true
      })
    }
    console.log(`App initialized in ${opts.appMode} mode`)
    // on enregistre l’évenement (log:events)
    app.models.log.add({
      type: 'events',
      event: 'start_app',
      message: `App started in ${opts.appMode} mode`,
      save: true
    })
  })

  return app
}

module.exports = build
