/**
 * Ce fichier configure et initialise l'application.
 *
 * @module index
 * @requires ../app
 * @requires fs
 * @requires dotenv
 * @requires ./user
 *
 * @function setup - Cette fonction initialise la base de données et crée des
 * utilisateurs par défaut. Les informations d'identification des utilisateurs
 * sont enregistrées dans un fichier texte.
 */

const app = require('../app')()
const { writeFileSync } = require('fs')
require('dotenv').config()

const setup = async function () {
  // raz DB
  await app.redis.flushdb()

  // Création des utilisateurs par défaut
  const users = require('./user')(app.config.backend.env)
  let output = ''
  for (let i = 0; i < users.length; i++) {
    const password = app.helpers.secure.createPassword()
    const ret = await app.models.user.new(users[i], password)
    output += `User ${i} { email: '${users[i].email}', Password: '${password}', role: '${users[i].role}', id: '${ret.id}' }\n`
  }
  writeFileSync('seedUsers.txt', output)

  console.log('---\nSetup ok !\nPasswords saved in seedtUsers.txt\n---')
  process.exit(0)
}

setTimeout(function () {
  setup()
}, 0)
