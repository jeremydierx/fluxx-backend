/**
 * Ce fichier contient des fonctions pour générer des caractères aléatoires et
 * pour créer un hachage de mot de passe sécurisé.
 *
 * @module secure
 * @requires crypto
 * @function {function} secureMathRandom - Génère un nombre aléatoire sécurisé.
 * @function {function} getRandomLower - Génère une lettre minuscule aléatoire.
 * @function {function} getRandomUpper - Génère une lettre majuscule aléatoire.
 * @function {function} getRandomNumber - Génère un chiffre aléatoire.
 * @function {function} getRandomSymbol - Génère un symbole aléatoire.
 * @function {function} createPasswordHash - Crée un hachage de mot de passe
 * sécurisé à partir d'un mot de passe et d'un salt optionnel.
 */

const { createHmac, scryptSync, randomBytes, randomUUID, webcrypto } = require('crypto')

// Objet qui contient les noms de toutes les fonctions que nous utiliserons pour
// créer des lettres aléatoires de mot de passe
const randomFunc = {
  lower: getRandomLower,
  upper: getRandomUpper,
  number: getRandomNumber,
  symbol: getRandomSymbol
}

/**
 * Cette fonction génère un nombre aléatoire sécurisé en utilisant l'API Web
 * Crypto. Elle ne prend aucun paramètre et renvoie un nombre aléatoire entre
 * 0 et 1.
 *
 * @function secureMathRandom
 * @returns {number} Un nombre aléatoire entre 0 et 1.
 */
function secureMathRandom () {
  return webcrypto.getRandomValues(new Uint32Array(1))[0] / (Math.pow(2, 32) - 1)
}

// Fonctions génératrices

/**
 * Cette fonction génère une lettre minuscule aléatoire. Elle ne prend aucun
 * paramètre et renvoie une lettre minuscule aléatoire en utilisant le code
 * ASCII.
 *
 * @function getRandomLower
 * @returns {string} Une lettre minuscule aléatoire.
 */
function getRandomLower () {
  return String.fromCharCode(Math.floor(Math.random() * 26) + 97)
}

/**
 * Cette fonction génère une lettre majuscule aléatoire. Elle ne prend aucun
 * paramètre et renvoie une lettre majuscule aléatoire en utilisant le code
 * ASCII.
 *
 * @function getRandomUpper
 * @returns {string} Une lettre majuscule aléatoire.
 */
function getRandomUpper () {
  return String.fromCharCode(Math.floor(Math.random() * 26) + 65)
}

/**
 * Cette fonction génère un chiffre aléatoire. Elle ne prend aucun paramètre et
 * renvoie un chiffre aléatoire sous forme de chaîne de caractères en utilisant
 * le code ASCII.
 *
 * @function getRandomNumber
 * @returns {string} Un chiffre aléatoire sous forme de chaîne de caractères.
 */
function getRandomNumber () {
  return String.fromCharCode(Math.floor(secureMathRandom() * 10) + 48)
}

/**
 * Cette fonction génère un symbole aléatoire. Elle ne prend aucun paramètre et
 * renvoie un symbole aléatoire à partir d'une chaîne de caractères prédéfinie.
 *
 * @function getRandomSymbol
 * @returns {string} Un symbole aléatoire.
 */
function getRandomSymbol () {
  const symbols = '~!@#$%^&*()_+{}":?><;.,'
  return symbols[Math.floor(Math.random() * symbols.length)]
}

module.exports = {

  /**
   * Cette fonction crée un hachage de mot de passe sécurisé à partir d'un mot de
   * passe et d'un salt optionnel. Si aucun salt n'est fourni, un nouveau salt est
   * généré. Le mot de passe est d'abord haché avec HMAC-SHA256, puis avec
   * scrypt. La fonction renvoie un objet contenant le hachage du mot de passe et
   * le salt utilisé.
   *
   * @function createPasswordHash
   * @param {string} password - Le mot de passe à hacher.
   * @param {string} [salt] - Le salt à utiliser pour le hachage.
   * @returns {object} Un objet contenant le hachage du mot de passe et le sel.
   * @property {string} hash - Le hachage du mot de passe.
   * @property {string} salt - Le salt utilisé pour le hachage.
   */
  createPasswordHash: (password, salt) => {
    const generatedSalt = salt || randomBytes(128).toString('base64')

    const hmac = createHmac('sha256', generatedSalt)
    hmac.update(password)
    let hashedPassword = hmac.digest('hex')

    const scrypt = scryptSync(hashedPassword, generatedSalt, 64)
    hashedPassword = scrypt.toString('hex')

    return {
      hash: hashedPassword,
      salt: generatedSalt
    }
  },

  /**
   * Cette fonction génère un jeton de rafraîchissement sécurisé. Elle ne prend
   * aucun paramètre et renvoie un jeton de rafraîchissement sous forme de
   * chaîne de caractères en base64. Le jeton est généré en utilisant la fonction
   * randomBytes de Node.js pour générer 128 octets aléatoires.
   *
   * @function createRefreshToken
   * @returns {string} Un jeton de rafraîchissement sécurisé.
   */
  createRefreshToken: () => {
    return randomBytes(128).toString('base64')
  },

  /**
   * Cette fonction génère un jeton XSRF sécurisé. Elle ne prend aucun paramètre
   * et renvoie un jeton XSRF sous forme de chaîne de caractères en hexadécimal.
   * Le jeton est généré en utilisant la fonction randomBytes de Node.js pour
   * générer 64 octets aléatoires.
   *
   * @function createXsrfToken
   * @returns {string} Un jeton XSRF sécurisé.
   */
  createXsrfToken: () => {
    return randomBytes(64).toString('hex')
  },

  /**
   * Cette fonction génère un jeton d'URL sécurisé. Elle ne prend aucun paramètre
   * et renvoie un jeton d'URL sous forme de chaîne de caractères en hexadécimal.
   * Le jeton est généré en utilisant la fonction randomBytes de Node.js pour
   * générer 32 octets aléatoires.
   *
   * @function createUrlToken
   * @returns {string} Un jeton d'URL sécurisé.
   */
  createUrlToken: () => {
    return randomBytes(Math.ceil(64 / 2)).toString('hex')
  },

  /**
   * Cette fonction génère un UUID (Universally Unique Identifier) sécurisé. Elle
   * ne prend aucun paramètre et renvoie un UUID sous forme de chaîne de
   * caractères. Le UUID est généré en utilisant la fonction randomUUID de Node.js.
   *
   * @function createUUID
   * @returns {string} Un UUID sécurisé.
   */
  createUUID: () => {
    return randomUUID()
  },

  /**
   * Cette fonction génère un salt sécurisé. Elle ne prend aucun paramètre et
   * renvoie un salt sous forme de chaîne de caractères en base64. Le salt est
   * généré en utilisant la fonction randomBytes de Node.js pour générer 128
   * octets aléatoires.
   *
   * @function createSalt
   * @returns {string} Un salt sécurisé.
   */
  createSalt: () => {
    return randomBytes(128).toString('base64')
  },

  /**
   * Cette fonction génère un mot de passe sécurisé. Elle prend un objet en
   * paramètre qui peut contenir les options suivantes : length (la longueur du
   * mot de passe), lower (si le mot de passe doit contenir des lettres
   * minuscules), upper (si le mot de passe doit contenir des lettres majuscules),
   * number (si le mot de passe doit contenir des chiffres), et symbol (si le mot
   * de passe doit contenir des symboles). Si aucune option n'est fournie, des
   * valeurs par défaut sont utilisées. La fonction renvoie le mot de passe
   * généré.
   *
   * @function createPassword
   * @param {object} opts - Les options pour la génération du mot de passe.
   * @param {number} [opts.length=8] - La longueur du mot de passe.
   * @param {boolean} [opts.lower=true] - Si le mot de passe doit contenir des
   * lettres minuscules.
   * @param {boolean} [opts.upper=true] - Si le mot de passe doit contenir des
   * lettres majuscules.
   * @param {boolean} [opts.number=true] - Si le mot de passe doit contenir des
   * chiffres.
   * @param {boolean} [opts.symbol=false] - Si le mot de passe doit contenir des
   * symboles.
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
  },

  /**
   * Cette fonction génère un jeton de vente sécurisé. Elle ne prend aucun
   * paramètre et renvoie un jeton de vente sous forme de chaîne de caractères.
   * Le jeton est composé de 4 lettres majuscules aléatoires suivies d'un nombre
   * à deux chiffres aléatoire. Les lettres sont générées en utilisant le code
   * ASCII et le nombre est généré en utilisant la fonction Math.random de
   * JavaScript.
   *
   * @function createSaleToken
   * @returns {string} Un jeton de vente sécurisé.
   */
  createSaleToken: () => {
    let result = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const charactersLength = characters.length
    // Générer 4 lettres majuscules
    for (let i = 0; i < 4; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    // Générer un nombre à deux chiffres
    const number = Math.floor(Math.random() * 100).toString().padStart(2, '0')
    return result + number
  }
}
