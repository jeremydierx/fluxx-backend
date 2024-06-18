/**
 * @fileoverview Ce fichier définit les méthodes pour l'authentification des
 * utilisateurs.
 *
 * @requires this.models.user Pour accéder au modèle utilisateur.
 * @requires this.helpers.utils Pour utiliser les fonctions utilitaires.
 * @requires this.helpers.secure Pour utiliser les fonctions de sécurité.
 *
 * @method authenticate Authentifie un utilisateur.
 * @param {string} id L'identifiant de l'utilisateur. Peut être un email ou un
 * token.
 * @param {string} password Le mot de passe de l'utilisateur.
 * @param {string} [authType='emailAuth'] Le type d'authentification à utiliser.
 * Peut être 'emailAuth' ou 'streamLineAuth'.
 *
 * @throws {Error} Si le type d'authentification n'est pas reconnu.
 *
 * @returns {Promise<object>} Un objet contenant les informations de l'utilisateur
 * si l'authentification réussit, ou un objet vide si elle échoue.
 */

module.exports = {

  /**
   * Authentifie un utilisateur.
   *
   * @async
   * @function authenticate
   * @param {string} id - L'identifiant de l'utilisateur. Peut être un email ou un
   * token.
   * @param {string} password - Le mot de passe de l'utilisateur.
   * @param {string} [authType='emailAuth'] - Le type d'authentification à utiliser.
   * Peut être 'emailAuth' ou 'streamLineAuth'.
   *
   * @throws {Error} Si le type d'authentification n'est pas reconnu.
   *
   * @returns {Promise<object>} Un objet contenant les informations de l'utilisateur
   * si l'authentification réussit, ou un objet vide si elle échoue.
   */
  authenticate: async function (id, password, authType = 'emailAuth') {
    try {
      let opts
      // try to find user
      switch (authType) {
      case 'emailAuth':
        opts = { email: id }
        break
      case 'streamLineAuth':
        opts = { token: id }
        break
      default:
        throw new Error('Auth method not recognized.')
      }
      const user = await this.models.user.get(opts)

      // check password
      if (!user.error && !this.helpers.utils.isEmpty(user)) {
        const { hash } = this.helpers.secure.createPasswordHash(password, user.salt)
        if (hash === user.hPassword) {
          return {
            user,
            authorized: true
          }
        }
      }
      return { authorized: false }
    } catch (error) {
      return {
        error,
        authorized: false
      }
    }
  },

  /**
   * Crée un nouvel utilisateur.
   *
   * @async
   * @function new
   * @param {object} user - L'objet utilisateur contenant les informations de
   * l'utilisateur.
   * @param {string} password - Le mot de passe de l'utilisateur.
   *
   * @throws {Error} Si l'utilisateur existe déjà ou si une erreur se produit
   * lors de l'écriture dans la base de données.
   *
   * @returns {Promise<object>} Un objet contenant le statut de l'opération et
   * l'identifiant de l'utilisateur si la création réussit, ou un objet contenant
   * l'erreur si elle échoue.
   */
  new: async function (user, password) {
    try {
      // on vérifie si l’utilisateur n’existe pas déjà
      // en fonction de son email
      const userId = await this.redis.hget('user:idByEmail', user.email)
      if (userId) {
        this.errors.user.userAlreadyExists()
      }
      user.id = this.helpers.secure.createUUID()
      user.salt = this.helpers.secure.createSalt()
      user.hPassword = this.helpers.secure.createPasswordHash(password, user.salt).hash
      user.createdOn = Date.now()
      user.token = this.helpers.secure.createUrlToken()

      // on lowercase l’email
      user.email = user.email.toLowerCase()

      await this.redis.multi()
        .hset(`user:${user.role}:${user.id}`, user)
        .hset('user:idByEmail', user.email, user.id)
        .hset('user:roleById', user.id, user.role)
        .hset('user:idByToken', user.token, user.id)
        .exec((error) => {
          if (error) throw new Error(error)
        })
      return {
        userAdded: true,
        id: user.id
      }
    } catch (error) {
      return { error }
    }
  },

  /**
   * Met à jour un utilisateur existant.
   *
   * @async
   * @function update
   * @param {object} userParams - L'objet contenant les nouvelles informations de
   * l'utilisateur.
   *
   * @throws {Error} Si l'email existe déjà pour un autre utilisateur, si une
   * erreur se produit lors de la lecture ou de l'écriture dans la base de données,
   * ou si une erreur se produit lors de la mise à jour du rôle ou de l'email.
   *
   * @returns {Promise<object>} Un objet contenant le statut de l'opération et
   * l'identifiant de l'utilisateur si la mise à jour réussit, ou un objet contenant
   * l'erreur si elle échoue.
   */
  update: async function (userParams) {
    try {
      // on test si l’email n’existe pas déjà
      if (userParams.email) {
        const userTest = await this.models.user.get({ email: userParams.email })
        if (userTest && userTest.email === userParams.email && userTest.id !== userParams.id) throw new Error('userStillExists')
      }

      // on récupère l’utilisateur par son id
      const user = await this.models.user.get({ id: userParams.id })

      if (user.error) return user.error

      // on timestamp la màj
      userParams.updatedOn = Date.now()

      // on modifie le password s’il existe
      if (userParams.password) {
        userParams.hPassword = this.helpers.secure.createPasswordHash(
          userParams.password,
          user.salt
        ).hash
        // et on supprime le password par sécurité
        delete userParams.password
      }

      // on modifie le mail s’il existe
      if (
        userParams.email &&
        this.helpers.user.isEmailOk(userParams.email) &&
        userParams.email !== user.email
      ) {
        // on lowercase l’email
        userParams.email = userParams.email.toLowerCase()
        await this.redis.multi()
          .hset('user:idByEmail', userParams.email, user.id)
          .hdel('user:idByEmail', user.email)
          .exec((error) => {
            if (error) throw new Error(error)
          })
      }

      // on modifie le role s’il est différent
      if (
        userParams.role &&
        userParams.role !== user.role &&
        this.helpers.user.isRoleExist(userParams.role)
      ) {
        await this.redis.multi()
          .hset('user:roleById', userParams.id, userParams.role)
          .del(`user:${user.role}:${user.id}`)
          .exec((error) => {
            if (error) throw new Error(error)
          })
      }

      await this.redis.hset(`user:${user.role}:${userParams.id}`, userParams)

      return {
        userUpdated: true,
        id: user.id
      }
    } catch (error) {
      return { error }
    }
  },

  /**
   * Récupère un utilisateur existant.
   *
   * @async
   * @function get
   * @param {object} opts - L'objet contenant les critères de recherche de
   * l'utilisateur. Peut contenir 'id', 'email', 'token', ou 'accessToken'.
   *
   * @throws {Error} Si l'utilisateur n'existe pas, si une erreur se produit lors
   * de la lecture dans la base de données, ou si une erreur se produit lors du
   * décodage de l'accessToken.
   *
   * @returns {Promise<object>} Un objet contenant les informations de l'utilisateur
   * si la recherche réussit, ou un objet contenant l'erreur si elle échoue.
   */
  get: async function (opts) {
    let user, role, userId
    try {
      // recherche par id
      if ('id' in opts) {
        // on récupère le role
        role = await this.redis.hget('user:roleById', opts.id)
        // puis on récupère l’utilisateur
        user = await this.redis.hgetall(`user:${role}:${opts.id}`)
      }
      // recherche par email
      if ('email' in opts) {
        // on récupère l’id
        userId = await this.redis.hget('user:idByEmail', opts.email)
        // puis on récupère le role
        role = await this.redis.hget('user:roleById', userId)
        // enfin on récupère l’utilisateur
        user = await this.redis.hgetall(`user:${role}:${userId}`)
      }
      // recherche par token
      if ('token' in opts) {
        // on récupère l’id
        userId = await this.redis.hget('user:idByToken', opts.token)
        // on récupère le role
        role = await this.redis.hget('user:roleById', userId)
        // enfin on récupère l’utilisateur
        user = await this.redis.hgetall(`user:${role}:${userId}`)
      }

      if ('accessToken' in opts) {
        // on décode l’access token
        const decodedToken = this.jwt.verify(opts.accessToken)
        // on récupère l’id de l’utilisateur depuis
        // l’access token déocdé
        userId = decodedToken.sub
        // on récupère l’utilisateur avec son id
        // user = await this.models.user.get({ id: userId })
        // on récupère le role
        role = await this.redis.hget('user:roleById', userId)
        // puis on récupère l’utilisateur
        user = await this.redis.hgetall(`user:${role}:${userId}`)
      }
      if (this.helpers.utils.isEmpty(user)) {
        this.errors.user.userDoesNotExist()
      }
      user = this.helpers.user.formatRead(user)
      return user
    } catch (error) {
      return { error }
    }
  },

  /**
   * Récupère tous les utilisateurs d'un certain rôle.
   *
   * @async
   * @function getAll
   * @param {string} [role='customer'] - Le rôle des utilisateurs à récupérer.
   *
   * @throws {Error} Si une erreur se produit lors de la lecture dans la base de
   * données.
   *
   * @returns {Promise<Array<object>>} Un tableau contenant les informations des
   * utilisateurs si la recherche réussit, ou un objet contenant l'erreur si elle
   * échoue.
   */
  getAll: async function (role = 'customer') {
    try {
      const users = []
      const keys = await this.redis.keys(`user:${role}:*`)
      for (let i = 0; i < keys.length; i++) {
        users[i] = await this.redis.hgetall(keys[i])
        // on supprime les données sensibles
        users[i] = this.helpers.user.formatRead(this.helpers.user.secureData(users[i]))
      }
      return users
    } catch (error) {
      return { error }
    }
  },

  /**
   * Supprime un utilisateur existant.
   *
   * @async
   * @function del
   * @param {object} opts - L'objet contenant les critères de recherche de
   * l'utilisateur à supprimer. Peut contenir 'id', 'email', 'token', ou
   * 'accessToken'.
   *
   * @throws {Error} Si l'utilisateur n'existe pas, si une erreur se produit lors
   * de la lecture ou de l'écriture dans la base de données, ou si une erreur se
   * produit lors de la suppression des topics associés à l'utilisateur.
   *
   * @returns {Promise<object>} Un objet contenant le statut de l'opération et
   * l'identifiant de l'utilisateur si la suppression réussit, ou un objet contenant
   * l'erreur si elle échoue.
   */
  del: async function (opts) {
    try {
      const user = await this.models.user.get(opts)
      await this.redis.multi()
        .hset(`user:archived:${user.email}`, user)
        .zadd('user:archived', 'NX', Date.now(), user.email)
        .del(`user:${user.role}:${user.id}`)
        .hdel('user:idByEmail', user.email)
        .hdel('user:roleById', user.id)
        .hdel('user:idByToken', user.token)
        .exec((error) => {
          if (error) throw new Error(error)
        })

      return {
        userDeleted: true,
        id: user.id
      }
    } catch (error) {
      return { error }
    }
  },

  /**
   * Envoie une demande de réinitialisation de mot de passe à un utilisateur.
   *
   * @async
   * @function sendAskResetPassword
   * @param {string} email - L'email de l'utilisateur.
   *
   * @throws {Error} Si l'utilisateur n'existe pas, si une erreur se produit lors
   * de la lecture dans la base de données, lors de la création du token, lors de
   * l'écriture dans Redis, ou lors de l'envoi du mail.
   *
   * @returns {Promise<object>} Un objet contenant le statut de l'opération si
   * l'envoi réussit, ou un objet contenant l'erreur si elle échoue.
   */
  sendAskResetPassword: async function (email) {
    try {
      const user = await this.models.user.get({ email })
      if (user.error) return user.error
      // on créé le token avec expiration
      const token = this.helpers.secure.createUrlToken()
      const key = `user:passwordToken:${token}`
      await this.redis.set(key, user.id)
      const expiresIn = this.config.token.askResetPasswordToken.expiresIn / 1000
      await this.redis.expire(key, expiresIn)
      // on envoie le mail avec le token
      return await this.models.mailer.sendAskResetPassword(user, token)
    } catch (error) {
      return { error }
    }
  },

  /**
   * Envoie un mot de passe à un utilisateur par email.
   *
   * @async
   * @function sendPasswordByEmail
   * @param {string} email - L'email de l'utilisateur.
   * @param {string} password - Le mot de passe de l'utilisateur.
   *
   * @throws {Error} Si l'utilisateur n'existe pas, si une erreur se produit lors
   * de la lecture dans la base de données, ou lors de l'envoi du mail.
   *
   * @returns {Promise<object>} Un objet contenant le statut de l'opération si
   * l'envoi réussit, ou un objet contenant l'erreur si elle échoue.
   */
  sendPasswordByEmail: async function (email, password) {
    try {
      // on recépère l’utilisateur
      const user = await this.models.user.get({ email })
      if (user.error) return user.error
      // on envoie le mail avec le token
      return await this.models.mailer.sendPasswordByEmail(user, password)
    } catch (error) {
      return { error }
    }
  },

  /**
   * Réinitialise le mot de passe d'un utilisateur.
   *
   * @async
   * @function resetPassword
   * @param {string} token - Le token de réinitialisation de mot de passe.
   * @param {string} password - Le nouveau mot de passe de l'utilisateur.
   *
   * @throws {Error} Si le token n'existe pas, si l'utilisateur n'existe pas, si
   * une erreur se produit lors de la lecture dans la base de données, ou lors de
   * la mise à jour du mot de passe.
   *
   * @returns {Promise<object>} Un objet contenant le statut de l'opération si
   * la réinitialisation réussit, ou un objet contenant l'erreur si elle échoue.
   */
  resetPassword: async function (token, password) {
    try {
      // on récupère l’id utilisateur
      const id = await this.redis.get(`user:passwordToken:${token}`)
      if (!id) this.errors.user.missingPasswordToken()
      // on récupère l’utilisateur
      const user = await this.models.user.get({ id })
      if (user.error) return user.error
      // enregistre le nouveau mot de passe
      const ret = await this.models.user.update({
        id,
        password
      })
      return ret
    } catch (error) {
      return { error }
    }
  },

  /**
   * Génère un token pour un utilisateur.
   *
   * @async
   * @function generateToken
   * @param {object} user - L'objet utilisateur contenant les informations de
   * l'utilisateur.
   *
   * @throws {Error} Si une erreur se produit lors de la création des tokens ou
   * lors de l'écriture dans la base de données.
   *
   * @returns {Promise<object>} Un objet contenant les tokens si la génération
   * réussit, ou un objet contenant l'erreur si elle échoue.
   */
  generateToken: async function (user) {
    try {
      // create xsrf token
      const xsrfToken = this.helpers.secure.createXsrfToken()

      // create refresh token
      const refreshToken = this.helpers.secure.createRefreshToken()

      // generate accessToken
      const accessToken = this.jwt.sign(
        {
          firstname: user.firstname,
          lastname: user.lastname,
          id: user.id,
          xsrfToken,
          refreshToken
        },
        {
          algorithm: this.config.token.accessToken.algorithm,
          audience: this.config.token.accessToken.audience,
          expiresIn: this.config.token.accessToken.expiresIn / 1000,
          issuer: this.config.token.accessToken.issuer,
          sub: user.id
        }
      )

      // on enregistre le refresh token en DB

      await this.redis.hset('user:refreshToken', {
        [refreshToken]: JSON.stringify({
          userId: user.id,
          expiresOn: Date.now() + this.config.token.refreshToken.expiresIn
        })
      })

      return {
        accessToken,
        refreshToken,
        xsrfToken
      }
    } catch (error) {
      return { error }
    }
  },

  /**
   * Vérifie si un utilisateur est un administrateur.
   *
   * @async
   * @function isAdmin
   * @param {string} accessToken - Le token d'accès de l'utilisateur.
   *
   * @throws {Error} Si une erreur se produit lors de la lecture dans la base de
   * données.
   *
   * @returns {Promise<boolean>} Un booléen indiquant si l'utilisateur est un
   * administrateur si la vérification réussit, ou un objet contenant l'erreur si
   * elle échoue.
   */
  isAdmin: async function (accessToken) {
    try {
      // les rôles autorisés
      const authorizedRoles = ['admin']
      // on récupère l’utilisateur actif
      const activeUser = await this.models.user.get({ accessToken })
      return authorizedRoles.includes(activeUser.role)
    } catch (error) {
      return { error }
    }
  },
  functionsToBind: [
    'authenticate',
    'new',
    'update',
    'get',
    'getAll',
    'del',
    'sendAskResetPassword',
    'sendPasswordByEmail',
    'resetPassword',
    'generateToken',
    'isAdmin'
  ]
}
