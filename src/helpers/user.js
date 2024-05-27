/**
 * @file
 * Ce fichier exporte des fonctions d'aide pour les utilisateurs.
 *
 * @requires crypto
 */

const { getRandomValues } = require('crypto').webcrypto

// objet qui contient les fonctions qui génèrent des valeurs aléatoires
const randomFunc = {
  lower: getRandomLower,
  upper: getRandomUpper,
  number: getRandomNumber,
  symbol: getRandomSymbol
}

/**
 * @function secureMathRandom
 * Cette fonction génère un nombre aléatoire sécurisé en utilisant l'API
 * getRandomValues de la Web Cryptography API.
 * @returns {number} Un nombre aléatoire entre 0 (inclus) et 1 (exclus).
 */
function secureMathRandom () {
  return getRandomValues(new Uint32Array(1))[0] / (Math.pow(2, 32) - 1)
}

/**
 * @function getRandomLower
 * Cette fonction génère une lettre minuscule aléatoire en utilisant le code ASCII.
 * Elle utilise la fonction Math.random pour obtenir un nombre aléatoire, le multiplie
 * par 26 (le nombre de lettres dans l'alphabet), ajoute 97 (le code ASCII pour 'a') et
 * arrondit à l'entier le plus proche avec Math.floor. Elle convertit ensuite ce nombre
 * en caractère avec String.fromCharCode.
 * @returns {string} Une lettre minuscule aléatoire.
 */
function getRandomLower () {
  return String.fromCharCode(Math.floor(Math.random() * 26) + 97)
}

/**
 * @function getRandomUpper
 * Cette fonction génère une lettre majuscule aléatoire en utilisant le code ASCII.
 * Elle utilise la fonction Math.random pour obtenir un nombre aléatoire, le multiplie
 * par 26 (le nombre de lettres dans l'alphabet), ajoute 65 (le code ASCII pour 'A') et
 * arrondit à l'entier le plus proche avec Math.floor. Elle convertit ensuite ce nombre
 * en caractère avec String.fromCharCode.
 * @returns {string} Une lettre majuscule aléatoire.
 */
function getRandomUpper () {
  return String.fromCharCode(Math.floor(Math.random() * 26) + 65)
}

/**
 * @function getRandomNumber
 * Cette fonction génère un chiffre aléatoire en utilisant le code ASCII.
 * Elle utilise la fonction secureMathRandom pour obtenir un nombre aléatoire, le multiplie
 * par 10 (le nombre de chiffres), ajoute 48 (le code ASCII pour '0') et arrondit à l'entier
 * le plus proche avec Math.floor. Elle convertit ensuite ce nombre en caractère avec
 * String.fromCharCode.
 * @returns {string} Un chiffre aléatoire.
 */
function getRandomNumber () {
  return String.fromCharCode(Math.floor(secureMathRandom() * 10) + 48)
}

/**
 * @function getRandomSymbol
 * Cette fonction génère un symbole aléatoire à partir d'une chaîne de caractères prédéfinie.
 * Elle utilise la fonction Math.random pour obtenir un nombre aléatoire, le multiplie par la
 * longueur de la chaîne de symboles et arrondit à l'entier le plus proche avec Math.floor.
 * Elle utilise ensuite ce nombre comme indice pour sélectionner un symbole dans la chaîne.
 * @returns {string} Un symbole aléatoire.
 */
function getRandomSymbol () {
  const symbols = '~!@#$%^&*()_+{}":?><;.,'
  return symbols[Math.floor(Math.random() * symbols.length)]
}

module.exports = {
  /**
   * @function secureData
   * Cette fonction supprime les données sensibles de l'objet utilisateur.
   * Elle supprime les propriétés 'hPassword', 'salt' et 'token' de l'objet utilisateur.
   * @param {object} user - L'objet utilisateur.
   * @returns {object} L'objet utilisateur sans les données sensibles.
   */
  secureData: (user) => {
    delete user.hPassword
    delete user.salt
    delete user.token
    return user
  },

  /**
   * @function isEmailOk
   * Cette fonction vérifie si l'email est valide en utilisant une expression régulière.
   * @param {string} email - L'email à vérifier.
   * @returns {boolean} True si l'email est valide, false sinon.
   */
  isEmailOk: (email) => {
    return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)
  },

  /**
   * @function isRoleExist
   * Cette fonction vérifie si le rôle existe en vérifiant s'il est inclus dans le tableau [1, 2].
   * @param {number} role - Le rôle à vérifier.
   * @returns {boolean} True si le rôle existe, false sinon.
   */
  isRoleExist: (role) => {
    return [1, 2].includes(role)
  },

  /**
   * @function formatRead
   * Cette fonction formate les données de l'utilisateur pour la lecture.
   * Elle convertit les propriétés 'createdOn', 'updatedOn' et 'numOfAttempts' de l'objet utilisateur en entiers.
   * @param {object} user - L'objet utilisateur.
   * @returns {object} L'objet utilisateur formaté.
   */
  formatRead: (user) => {
    // createdOn > int
    user.createdOn = parseInt(user.createdOn)
    // updatedOn > int
    if (user.updatedOn) user.updatedOn = parseInt(user.updatedOn)
    if (user.numOfAttempts) user.numOfAttempts = parseInt(user.numOfAttempts)
    return user
  },

  /**
   * @function createPassword
   * Cette fonction génère un mot de passe aléatoire en fonction des options fournies.
   * Elle utilise les fonctions getRandomLower, getRandomUpper, getRandomNumber et getRandomSymbol
   * pour générer des caractères aléatoires. Elle mélange ensuite les caractères générés en utilisant
   * la fonction Math.random.
   * @param {object} opts - Les options pour la création du mot de passe.
   * @property {number} opts.length - La longueur du mot de passe.
   * @property {boolean} opts.lower - Si le mot de passe doit contenir des minuscules.
   * @property {boolean} opts.upper - Si le mot de passe doit contenir des majuscules.
   * @property {boolean} opts.number - Si le mot de passe doit contenir des chiffres.
   * @property {boolean} opts.symbol - Si le mot de passe doit contenir des symboles.
   * @returns {string} Le mot de passe généré.
   */
  createPassword: (opts = {}) => {
    const length = opts.length || 8
    const lower = opts.lower || true
    const upper = opts.upper || true
    const number = opts.number || true
    const symbol = opts.symbol || false
    let generatedPassword = ''
    const typesCount = lower + upper + number + symbol
    const typesArr = [{ lower }, { upper }, { number }, { symbol }].filter(item => Object.values(item)[0])
    if (typesCount === 0) {
      return ''
    }
    for (let i = 0; i < length; i++) {
      typesArr.forEach(type => {
        const funcName = Object.keys(type)[0]
        generatedPassword += randomFunc[funcName]()
      })
    }
    return generatedPassword.slice(0, length)
      .split('').sort(() => Math.random() - 0.5)
      .join('')
  }
}
