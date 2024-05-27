/**
 * @fileoverview Ce fichier contient les tests pour l'application.
 *
 * @requires jest Pour exécuter les tests.
 * @requires path Pour manipuler les chemins de fichiers.
 * @requires options Pour obtenir les options de configuration de l'application.
 * @requires app Pour obtenir l'instance de l'application.
 *
 * @param {object} options Les options de configuration de l'application.
 * @param {number} options.redisDBIndex L'index de la base de données Redis
 * utilisée pour les tests.
 *
 * @returns {undefined} Rien.
 */

/* eslint-env jest */
'use strict'

/**
 * INIT
 */

const path = require('path')
const cwd = process.cwd()

const options = require('./options')()

// on séléctionne une base de données Redis différente
// pour chaque suites de tests
options.redisDBIndex = 3

const app = require(path.join(cwd, 'src/app'))(options)

/**
 * Génère un sel, un hachage de mot de passe et un token pour un mot de passe donné.
 * Utilise la méthode HMAC avec SHA256 pour le hachage, et scrypt pour le sel.
 *
 * @param {string} password - Le mot de passe à hacher.
 *
 * @returns {Object} Un objet contenant le sel, le mot de passe haché et le token.
 * @property {string} salt - Le salt généré pour le hachage du mot de passe.
 * @property {string} hPassword - Le mot de passe haché avec HMAC et scrypt.
 * @property {string} token - Un token sécurisé généré pour l'utilisateur.
 */
function genSaltHashToken (password) {
  const { createHmac, scryptSync, randomBytes } = require('crypto')
  const salt = randomBytes(128).toString('base64')
  const hmac = createHmac('sha256', salt)
  hmac.update(password)
  const hashedPassword = hmac.digest('hex')
  const scrypt = scryptSync(hashedPassword, salt, 64)
  const hPassword = scrypt.toString('hex')
  const token = app.helpers.secure.createUrlToken()
  return {
    salt,
    hPassword,
    token
  }
}

describe('APP TESTS', () => {
  beforeAll(async () => {
    return await app.ready()
  })

  beforeEach(async () => {
    return await app.redis.flushdb()
  })

  afterAll(async () => {
    await app.redis.flushdb()
    await app.redis.disconnect()
    return await app.close()
  })

  /**
   * TESTS
   */

  test('Vérification de l’architecture de test', () => {
    expect(app.config.backend.env).toMatch('test')
  })

  test('POST /api/users/signIn with token auth method', async () => {
    try {
      const user = {
        id: '1234',
        email: 'john@doe.fr',
        firstName: 'John',
        lastName: 'Doe',
        role: 'admin'
      }

      // on génère les salt, hash password et token
      const password = 'password1234'
      const { salt, hPassword, token } = genSaltHashToken(password)
      user.salt = salt
      user.hPassword = hPassword
      user.token = token

      // on enregistre l’utilisateur en DB
      app.redis.multi()
        .hset(`user:${user.role}:${user.id}`, user)
        .hset('user:idByEmail', user.email, user.id)
        .hset('user:roleById', user.id, user.role)
        .hset('user:idByToken', user.token, user.id)
        .exec((err) => {
          if (err) throw new Error(err)
        })

      const response = app.inject({
        method: 'POST',
        url: '/api/users/signIn',
        payload: {
          token: user.token,
          authMethod: 'streamLineAuth'
        }
      })

      await expect(response.statusCode).toBe(200)
      await expect(response.payload.accessTokenExpiresIn).not.toBeNull()
      await expect(response.payload.refreshTokenExpiresIn).not.toBeNull()
      await expect(response.payload.xsrfToken).not.toBeNull()
      await expect(response.cookies.length).toBe(2)
    } catch (err) {
      return err
    }
  })

  test('POST /api/users/signIn with email auth method', async () => {
    const user = {
      id: '1234',
      email: 'john@doe.fr',
      firstName: 'John',
      lastName: 'Doe',
      role: 'admin'
    }

    // on génère les salt et hash password
    const password = 'password1234'
    const { salt, hPassword } = genSaltHashToken(password)
    user.salt = salt
    user.hPassword = hPassword

    app.redis.multi()
      .hset(`user:${user.role}:${user.id}`, user)
      .hset('user:idByEmail', user.email, user.id)
      .hset('user:roleById', user.id, user.role)
      .exec((err) => {
        if (err) throw new Error(err)
      })

    const response = await app.inject({
      method: 'POST',
      url: '/api/users/signIn',
      payload: {
        email: user.email,
        password,
        authMethod: 'emailAuth'
      }
    })

    expect(response.statusCode).toBe(200)
    expect(response.payload.accessTokenExpiresIn).not.toBeNull()
    expect(response.payload.refreshTokenExpiresIn).not.toBeNull()
  })
})
