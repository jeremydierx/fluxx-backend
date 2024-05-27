/* eslint-env jest */
'use strict'

/**
 * INIT
 */

const path = require('path')
const cwd = process.cwd()

const options = require('./../options')()
// on séléctionne une base de données Redis différente
// pour chaque suites de tests
options.redisDBIndex = 4

const app = require(path.join(cwd, 'src/app'))(options)

describe('MODELS: user tests', () => {
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

  test('Création d’un nouvel utilisateur', async () => {
    const role = 'admin'
    const password = 'pass1234'

    const user = {
      email: 'john@doe.com',
      firstname: 'John',
      lastname: 'Doe',
      role
    }

    const ret = await app.models.user.new(user, password)

    expect(ret.userAdded).toBe(true)
    expect(ret.id).toMatch(/^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/)
    const userKey = `user:${role}:${ret.id}`
    const userExists = await app.redis.exists(userKey)
    expect(userExists).toBe(1)
    const userIdByEmailKey = 'user:idByEmail'
    const userIdByEmail = await app.redis.hget(userIdByEmailKey, user.email)
    expect(userIdByEmail).toBe(ret.id)
    const userRoleByIdKey = 'user:roleById'
    const userRoleById = await app.redis.hget(userRoleByIdKey, ret.id)
    expect(userRoleById).toBe(role)
    const newUser = await app.redis.hgetall(userKey)
    const userIdByTokenKey = 'user:idByToken'
    const userIdByToken = await app.redis.hget(userIdByTokenKey, newUser.token)
    expect(userIdByToken).toBe(ret.id)
  })

  test('Récupération d’un utilisateur par son id', async () => {
    const role = 'admin'
    const password = 'pass1234'

    const user = {
      email: 'john@doe.com',
      firstname: 'John',
      lastname: 'Doe',
      role
    }

    const { id } = await app.models.user.new(user, password)
    const newUser = await app.models.user.get({ id })
    expect(newUser.id).toBe(id)
    expect(newUser.email).toBe(user.email)
    expect(newUser.firstname).toBe(user.firstname)
    expect(newUser.lastname).toBe(user.lastname)
    expect(newUser.role).toBe(user.role)
  })

  test('Récupération d’un utilisateur par son email', async () => {
    const role = 'admin'
    const password = 'pass1234'
    const email = 'john@doe.com'

    const user = {
      email,
      firstname: 'John',
      lastname: 'Doe',
      role
    }

    const { id } = await app.models.user.new(user, password)
    const newUser = await app.models.user.get({ email })
    expect(newUser.id).toBe(id)
    expect(newUser.email).toBe(user.email)
    expect(newUser.firstname).toBe(user.firstname)
    expect(newUser.lastname).toBe(user.lastname)
    expect(newUser.role).toBe(user.role)
  })

  test('Récupération d’un utilisateur par son token', async () => {
    const role = 'admin'
    const password = 'pass1234'

    const user = {
      email: 'john@doe.com',
      firstname: 'John',
      lastname: 'Doe',
      role
    }

    const { id } = await app.models.user.new(user, password)
    const token = await app.redis.hget(`user:${role}:${id}`, 'token')
    const newUser = await app.models.user.get({ token })
    expect(newUser.id).toBe(id)
    expect(newUser.email).toBe(user.email)
    expect(newUser.firstname).toBe(user.firstname)
    expect(newUser.lastname).toBe(user.lastname)
    expect(newUser.role).toBe(user.role)
  })

  test('Récupération de tous les utilisateurs par rôle', async () => {
    const role = 'admin'
    const password = 'pass1234'

    const user1 = {
      email: 'user1@users.com',
      firstname: 'User1',
      lastname: 'Users',
      role
    }
    const user2 = {
      email: 'user2@users.com',
      firstname: 'User2',
      lastname: 'Users',
      role
    }

    const { id: user1Id } = await app.models.user.new(user1, password)
    const { id: user2Id } = await app.models.user.new(user2, password)

    const users = await app.models.user.getAll(role)
    expect(users).toHaveLength(2)
    const user1Exists = users.some(user => user.id === user1Id)
    expect(user1Exists).toBe(true)
    const user2Exists = users.some(user => user.id === user2Id)
    expect(user2Exists).toBe(true)
  })

  test('Mise à jour de l’email de l’utilisateur', async () => {
    const role = 'admin'
    const password = 'pass1234'
    const email = 'john@doe.com'

    const user = {
      email,
      firstname: 'John',
      lastname: 'Doe',
      role
    }

    const { userAdded, id } = await app.models.user.new(user, password)
    expect(userAdded).toBe(true)

    const ret = await app.models.user.update({
      id,
      email: 'jane@doe.com'
    })
    expect(ret.userUpdated).toBe(true)
    expect(await app.redis.hget(`user:${role}:${id}`, 'email')).toBe('jane@doe.com')
    expect(await app.redis.hget('user:idByEmail', 'jane@doe.com')).toBe(id)
    expect(await app.redis.hget('user:idByEmail', email)).toBe(null)
  })

  test('Mise à jour du mot de passe de l’utilisateur', async () => {
    const role = 'admin'
    const password = 'pass1234'
    const email = 'john@doe.com'

    const user = {
      email,
      firstname: 'John',
      lastname: 'Doe',
      role
    }

    const { userAdded, id } = await app.models.user.new(user, password)
    expect(userAdded).toBe(true)

    const ret = await app.models.user.update({
      id,
      password: 'newpass123'
    })
    expect(ret.userUpdated).toBe(true)

    const { salt, hPassword } = await app.models.user.get({ id })
    const { hash } = app.helpers.secure.createPasswordHash('newpass123', salt)
    expect(hPassword).toBe(hash)
  })

  test('Suppression d’un utilisateur', async () => {
    const role = 'admin'
    const password = 'pass1234'
    const email = 'john@doe.com'

    const user = {
      email,
      firstname: 'John',
      lastname: 'Doe',
      role
    }

    const { userAdded, newUserId } = await app.models.user.new(user, password)
    expect(userAdded).toBe(true)

    const { userDeleted, id } = await app.models.user.del({ id: newUserId })
    expect(userDeleted).toBe(true)
    const userKey = `user:${role}:${id}`
    const userExists = await app.redis.exists(userKey)
    expect(userExists).toBe(0)
    const userArchivedKey = `user:archived:${email}`
    const userArchived = await app.redis.hgetall(userArchivedKey)
    expect(userArchived.id).toBe(id)
  })

  test('Demande d’envoi d’un email de réinitialisation de mot de passe', async () => {
    // on mock la fonction sendAskResetPassword du mailer
    app.models.mailer.sendAskResetPassword = (user, token) => {
      return {
        user,
        token
      }
    }

    const password = 'pass1234'
    const user = {
      email: 'john@doe.com',
      firstname: 'John',
      lastname: 'Doe',
      role: 'admin'
    }

    const { userAdded } = await app.models.user.new(user, password)
    expect(userAdded).toBe(true)

    const { token, user: userReset } = await app.models.user.sendAskResetPassword(user.email)
    expect(userReset.email).toBe(user.email)
    expect(userReset.firstname).toBe(user.firstname)
    expect(userReset.lastname).toBe(user.lastname)
    expect(userReset.role).toBe(user.role)
    expect(typeof token).toBe('string')
  })
})
