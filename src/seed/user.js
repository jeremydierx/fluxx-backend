/**
 * Ce module exporte une fonction qui renvoie une liste d'utilisateurs en
 * fonction de l'environnement passé en paramètre.
 *
 * @module user
 * @param {string} env - L'environnement actuel de l'application. Les valeurs
 * possibles sont 'development' et 'staging'.
 * @returns {Array} users - Un tableau d'objets utilisateur. Chaque objet
 * utilisateur contient les propriétés email, firstname, lastname et role.
 */

module.exports = env => {
  let users = []

  switch (env) {
  case 'development':
    users = [
      {
        email: 'admin@fluxx.fr',
        firstname: 'John',
        lastname: 'Doe',
        role: 'admin'
      }
    ]
    break

  case 'staging':
    users = [
      {
        email: 'admin@fluxx.fr',
        firstname: 'John',
        lastname: 'Doe',
        role: 'admin'
      }
    ]
    break

  case 'production':
    users = [
      {
        email: 'admin@fluxx.fr',
        firstname: 'John',
        lastname: 'Doe',
        role: 'admin'
      }
    ]
    break
  default:
    throw new Error('Env not defined.')
  }

  return users
}
