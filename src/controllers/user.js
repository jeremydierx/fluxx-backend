/**
 * Fichier: user.js
 * Ce fichier définit les contrôleurs pour les routes liées aux utilisateurs.
 * Il exporte un objet avec plusieurs méthodes, chacune correspondant à une
 * route spécifique. Par exemple, la méthode 'get' est utilisée pour gérer la
 * route GET /api/users/:id. Chaque méthode est une fonction asynchrone qui
 * prend une requête et une réponse en paramètres. Les méthodes utilisent le
 * modèle 'user' pour interagir avec la base de données et le module 'redis'
 * pour gérer les tokens de rafraîchissement. Les erreurs sont gérées à l'aide
 * de blocs try/catch et sont renvoyées à l'utilisateur.
 */

/**
 * refreshToken: Cette fonction est utilisée pour rafraîchir les tokens d'un utilisateur.
 * Elle récupère le refresh token à partir des cookies de la requête.
 * Ensuite, elle vérifie la validité et l'expiration du refresh token.
 * Si le refresh token est valide et non expiré, elle génère de nouveaux tokens d'accès et de rafraîchissement.
 * Enfin, elle renvoie les nouveaux tokens.
 *
 * @param {Object} req - L'objet de la requête, contenant les cookies.
 * @param {Object} res - L'objet de la réponse, utilisé pour envoyer la réponse.
 * @returns {Promise<Object>} Un objet contenant les nouveaux tokens d'accès et de rafraîchissement.
 * @throws {Error} Si le refresh token est manquant ou invalide.
 */

module.exports.getAuth = async function (req) {
  try {
    const { cookies } = req
    if (!cookies || !cookies.access_token) {
      this.errors.user.missingAccessToken()
    }

    let user = await this.models.user.get({ accessToken: req.cookies.access_token })
    user = this.helpers.user.secureData(user)

    if (user.error || this.helpers.utils.isEmpty(user)) {
      this.errors.user.userDoesNotExist()
    }

    return {
      isAuth: true,
      user
    }
  } catch (error) {
    return { error }
  }
}

/**
 * Crée un nouvel utilisateur.
 *
 * @param {Object} req - L'objet de requête HTTP.
 * @param {Object} req.body.user - Les informations de l'utilisateur à créer.
 * @param {string} req.body.user.firstname - Le prénom de l'utilisateur.
 * @param {string} req.body.user.lastname - Le nom de famille de l'utilisateur.
 * @param {string} req.body.user.email - L'adresse e-mail de l'utilisateur.
 * @param {string} req.body.user.password - Le mot de passe de l'utilisateur.
 * @param {string} req.body.user.role - Le rôle de l'utilisateur.
 * @param {boolean} req.body.sendPasswordByEmail - Indique si le mot de passe doit être envoyé par e-mail à l'utilisateur.
 * @param {string} req.cookies.access_token - Le jeton d'accès de l'utilisateur actuel.
 *
 * @returns {Promise<Object>} Un objet contenant le message de réussite et les données de l'utilisateur créé.
 *
 * @throws {Error} Si l'utilisateur actuel n'est pas un administrateur, une erreur est levée.
 * @throws {Error} Si une erreur se produit lors de la création de l'utilisateur, l'erreur est renvoyée.
 */
module.exports.new = async function (req) {
  try {
    // seul un rôle autorisé (admin) peut ajouter un utilisateur
    const isAdmin = await this.models.user.isAdmin(req.cookies.access_token)
    if (!isAdmin) this.errors.user.userNotAuthorized()

    const { firstname, lastname, email, password, role } = req.body.user
    const { sendPasswordByEmail } = req.body
    const data = await this.models.user.new(
      {
        firstname,
        lastname,
        email,
        role
      },
      password
    )
    if (data.error) return data.error
    if (password && sendPasswordByEmail) {
      this.models.user.sendPasswordByEmail(email, password)
    }
    data.message = 'User account added successfully'
    return data
  } catch (error) {
    return error
  }
}

/**
 * Met à jour un utilisateur existant.
 *
 * @param {Object} req - L'objet de requête HTTP.
 * @param {string} req.params.id - L'ID de l'utilisateur à mettre à jour.
 * @param {Object} req.body.user - Les informations de l'utilisateur à mettre à jour.
 * @param {string} req.body.user.firstname - Le prénom de l'utilisateur.
 * @param {string} req.body.user.lastname - Le nom de famille de l'utilisateur.
 * @param {string} req.body.user.email - L'adresse e-mail de l'utilisateur.
 * @param {string} req.body.user.password - Le mot de passe de l'utilisateur.
 * @param {string} req.body.user.role - Le rôle de l'utilisateur.
 * @param {boolean} req.body.sendPasswordByEmail - Indique si le mot de passe doit être envoyé par e-mail à l'utilisateur.
 * @param {string} req.cookies.access_token - Le jeton d'accès de l'utilisateur actuel.
 *
 * @returns {Promise<Object>} Un objet contenant le message de réussite et les données de l'utilisateur mis à jour.
 *
 * @throws {Error} Si l'utilisateur actuel n'est pas un administrateur et tente de modifier un autre utilisateur, une erreur est levée.
 * @throws {Error} Si une erreur se produit lors de la mise à jour de l'utilisateur, l'erreur est renvoyée.
 */
module.exports.update = async function (req) {
  try {
    const { id } = req.params
    // on récupère l’utilisateur actif
    const activeUser = await this.models.user.get({ accessToken: req.cookies.access_token })
    // seul un utilisateur autorisé (admin) peut modifier un utilisateur autre que lui-même
    if (activeUser.role !== 'admin' && activeUser.id !== id) {
      this.errors.user.userNotAuthorized()
    }

    const { user, sendPasswordByEmail } = req.body
    const { password, email } = user

    // on supprime le mail si l’utilisateur n’est pas autorisé (admin)
    if (activeUser.role !== 'admin') delete user.email

    // on force l’id
    user.id = id
    const data = await this.models.user.update(user)

    if (data.error) {
      switch (data.error.message) {
      default:
        this.errors.user.unableToUpdateUser()
        break
      }
    }
    if (password && email && sendPasswordByEmail) {
      this.models.user.sendPasswordByEmail(email, password)
    } else {
      data.message = 'User account updated successfully'
    }
    return data
  } catch (error) {
    return error
  }
}

/**
 * Obtient tous les utilisateurs.
 *
 * @param {Object} req - L'objet de requête HTTP.
 * @param {Object} res - L'objet de réponse HTTP.
 * @param {string} req.cookies.access_token - Le jeton d'accès de l'utilisateur actuel.
 * @param {string} req.query.role - Le rôle des utilisateurs à obtenir.
 *
 * @returns {Promise<Object>} Un objet contenant le tableau des utilisateurs.
 *
 * @throws {Error} Si l'utilisateur actuel n'est pas un administrateur, une erreur est levée.
 * @throws {Error} Si une erreur se produit lors de l'obtention des utilisateurs, l'erreur est renvoyée.
 */
module.exports.getAll = async function (req, res) {
  try {
    // seul un utilisateur autorisé (admin) peut obtenir des utilisateurs
    const isAdmin = await this.models.user.isAdmin(req.cookies.access_token)
    if (!isAdmin) this.errors.user.userNotAuthorized()

    const { role } = req.query
    const users = await this.models.user.getAll(role)
    if (users.error) this.errors.user.unableToGetUsers()
    res.send({ users })
  } catch (error) {
    return error
  }
}

/**
 * Supprime un utilisateur.
 *
 * @param {Object} req - L'objet de requête HTTP.
 * @param {string} req.params.id - L'ID de l'utilisateur à supprimer.
 * @param {string} req.cookies.access_token - Le jeton d'accès de l'utilisateur actuel.
 *
 * @returns {Promise<Object>} Un objet contenant le message de réussite.
 *
 * @throws {Error} Si l'utilisateur actuel n'est pas un administrateur, une erreur est levée.
 * @throws {Error} Si une erreur se produit lors de la suppression de l'utilisateur, l'erreur est renvoyée.
 */
module.exports.del = async function (req) {
  try {
    // seul un utilisateur autorisé (admin) peut ajouter un utilisateur
    const isAdmin = await this.models.user.isAdmin(req.cookies.access_token)
    if (!isAdmin) this.errors.user.userNotAuthorized()

    const { id } = req.params
    const data = await this.models.user.del({ id })
    if (data.error) {
      this.errors.user.userCannotBeDeleted()
    } else {
      data.message = 'User account deleted successfully'
    }
    return data
  } catch (error) {
    return { error }
  }
}

/**
 * Connecte un utilisateur.
 *
 * @param {Object} req - L'objet de requête HTTP.
 * @param {Object} req.body - Les informations de connexion de l'utilisateur.
 * @param {string} req.body.authMethod - La méthode d'authentification à utiliser ('emailAuth' ou 'streamLineAuth').
 * @param {string} req.body.password - Le mot de passe de l'utilisateur.
 * @param {string} req.body.email - L'adresse e-mail de l'utilisateur (pour 'emailAuth').
 * @param {string} req.body.urlToken - Le jeton d'URL de l'utilisateur (pour 'streamLineAuth').
 * @param {Object} res - L'objet de réponse HTTP.
 *
 * @returns {Promise<Object>} Un objet contenant les informations de l'utilisateur connecté et les jetons d'accès.
 *
 * @throws {Error} Si la méthode d'authentification n'est pas reconnue, une erreur est levée.
 * @throws {Error} Si les informations d'authentification sont incorrectes, une erreur est levée.
 * @throws {Error} Si une erreur se produit lors de la génération des jetons d'accès, l'erreur est renvoyée.
 */
module.exports.signIn = async function (req, res) {
  try {
    const { authMethod, password, email, urlToken } = req.body
    let data
    switch (authMethod) {
    case 'emailAuth':
      data = await this.models.user.authenticate(email, password, authMethod)
      break
    case 'streamLineAuth':
      data = await this.models.user.authenticate(urlToken, password, authMethod)
      break
    default:
      this.errors.user.authMethodNotRecognized()
    }
    if (!data.user || !data.authorized) {
      this.errors.user.badCredentials()
    }

    const {
      accessToken,
      refreshToken,
      xsrfToken
    } = await this.models.user.generateToken(data.user)

    // on sécurise les données utilisateur
    const user = this.helpers.user.secureData(data.user)

    // user authorized, send access token
    res
      .setCookie('access_token', accessToken, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: this.config.token.accessToken.expiresIn,
        path: '/api/'
      })
      .setCookie('refresh_token', refreshToken, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: this.config.token.refreshToken.expiresIn,
        path: '/api/'
      })
      .send({
        accessTokenExpiresIn: this.config.token.accessToken.expiresIn,
        refreshTokenExpiresIn: this.config.token.refreshToken.expiresIn,
        xsrfToken,
        isAuth: true,
        user
      })
  } catch (error) {
    return error
  }
}

/**
 * Rafraîchit les jetons d'accès de l'utilisateur.
 *
 * @param {Object} req - L'objet de requête HTTP.
 * @param {string} req.cookies.refresh_token - Le jeton de rafraîchissement de l'utilisateur.
 * @param {Object} res - L'objet de réponse HTTP.
 *
 * @returns {Promise<Object>} Un objet contenant les nouveaux jetons d'accès et leurs dates d'expiration.
 *
 * @throws {Error} Si le jeton de rafraîchissement est manquant, une erreur est levée.
 * @throws {Error} Si le jeton de rafraîchissement est invalide, une erreur est levée.
 * @throws {Error} Si le jeton de rafraîchissement a expiré, une erreur est levée.
 * @throws {Error} Si une erreur se produit lors de la génération des nouveaux jetons, l'erreur est renvoyée.
 */
module.exports.refreshToken = async function (req, res) {
  try {
    // on récupère le refresh token
    const { cookies } = req
    let refreshToken
    if (cookies && cookies.refresh_token) {
      refreshToken = cookies.refresh_token
    } else {
      this.errors.user.missingRefreshToken()
    }

    // on récuère l’ancien refresh token en DB
    let oldRefreshToken = await this.redis.hget('user:refreshToken', refreshToken)
    if (!oldRefreshToken) this.errors.user.invalidToken()
    oldRefreshToken = JSON.parse(oldRefreshToken)
    oldRefreshToken.expiresOn = parseInt(oldRefreshToken.expiresOn)

    // on test la date d’expiration du refresh token
    if (oldRefreshToken.expiresOn < Date.now()) {
      this.errors.user.expiredToken()
    }

    // on récupère l’utilisateur
    const user = await this.models.user.get({ id: oldRefreshToken.userId })
    if (user.error) return user.error

    // on re-génère les tokens
    const { accessToken, refreshToken: newRefreshToken, xsrfToken } = await this.models.user.generateToken(
      user
    )

    // on supprime l’ancien refresh token
    await this.redis.hdel('user:refreshToken', refreshToken)

    // user authorized, send access token
    res
      .setCookie('access_token', accessToken, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: this.config.token.accessToken.expiresIn,
        path: '/api/'
      })
      .setCookie('refresh_token', newRefreshToken, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: this.config.token.refreshToken.expiresIn,
        path: '/api/'
      })
      .send({
        accessTokenExpiresIn: this.config.token.accessToken.expiresIn,
        refreshTokenExpiresIn: this.config.token.refreshToken.expiresIn,
        xsrfToken
      })
  } catch (error) {
    return error
  }
}

/**
 * Obtient un utilisateur spécifique.
 *
 * @param {Object} req - L'objet de requête HTTP.
 * @param {string} req.params.id - L'ID de l'utilisateur à obtenir.
 * @param {string} req.cookies.access_token - Le jeton d'accès de l'utilisateur actuel.
 *
 * @returns {Promise<Object>} Un objet contenant les informations de l'utilisateur demandé.
 *
 * @throws {Error} Si l'utilisateur actuel n'est pas un administrateur et tente d'obtenir un autre utilisateur, une erreur est levée.
 * @throws {Error} Si une erreur se produit lors de l'obtention de l'utilisateur, l'erreur est renvoyée.
 */
module.exports.get = async function (req) {
  try {
    const { id } = req.params
    // on récupère l’utilisateur actif
    const activeUser = await this.models.user.get({ accessToken: req.cookies.access_token })
    // seul un utilisateur autorisé (admin) peut obtenir un utilisateur autre que lui même
    if (!activeUser.role !== 'admin' && activeUser.id !== id) this.errors.user.userNotAuthorized()

    const user = await this.models.user.get({ id })
    if (user.error) return user.error
    delete user.hPassword
    delete user.salt
    delete user.token
    delete user.createdOn
    return { user }
  } catch (error) {
    return error
  }
}

/**
 * Demande une réinitialisation du mot de passe de l'utilisateur.
 *
 * @param {Object} req - L'objet de requête HTTP.
 * @param {string} req.body.email - L'adresse e-mail de l'utilisateur qui demande une réinitialisation du mot de passe.
 * @param {Object} res - L'objet de réponse HTTP.
 *
 * @returns {Promise<Object>} Un objet contenant le message de réussite.
 *
 * @throws {Error} Si l'adresse e-mail n'est pas associée à un utilisateur, une erreur est levée.
 * @throws {Error} Si une erreur se produit lors de l'envoi de l'e-mail de réinitialisation du mot de passe, l'erreur est renvoyée.
 */
module.exports.askResetPassword = async function (req, res) {
  try {
    const { email } = req.body
    const data = await this.models.user.sendAskResetPassword(email)
    res.send(data)
  } catch (error) {
    return error
  }
}

/**
 * Réinitialise le mot de passe de l'utilisateur.
 *
 * @param {Object} req - L'objet de requête HTTP.
 * @param {string} req.body.token - Le jeton de réinitialisation du mot de passe.
 * @param {string} req.body.password - Le nouveau mot de passe de l'utilisateur.
 * @param {Object} res - L'objet de réponse HTTP.
 *
 * @returns {Promise<Object>} Un objet contenant le message de réussite.
 *
 * @throws {Error} Si le jeton de réinitialisation du mot de passe est invalide, une erreur est levée.
 * @throws {Error} Si une erreur se produit lors de la réinitialisation du mot de passe, l'erreur est renvoyée.
 */
module.exports.resetPassword = async function (req, res) {
  try {
    const { token, password } = req.body
    const data = await this.models.user.resetPassword(token, password)
    if (data.error) {
      this.errors.user.unableToResetPassword()
    } else {
      data.message = 'Password reset successfully'
    }
    res.send(data)
  } catch (error) {
    return error
  }
}

/**
 * Obtient les informations d'authentification de l'utilisateur.
 *
 * @param {Object} req - L'objet de requête HTTP.
 * @param {string} req.cookies.access_token - Le jeton d'accès de l'utilisateur.
 *
 * @returns {Promise<Object>} Un objet contenant le statut d'authentification et les informations de l'utilisateur.
 *
 * @throws {Error} Si le jeton d'accès est manquant, une erreur est levée.
 * @throws {Error} Si l'utilisateur associé au jeton d'accès n'existe pas, une erreur est levée.
 * @throws {Error} Si une erreur se produit lors de l'obtention des informations d'authentification, l'erreur est renvoyée.
 */
module.exports.getAuth = async function (req) {
  try {
    const { cookies } = req
    if (!cookies || !cookies.access_token) {
      this.errors.user.missingAccessToken()
    }

    let user = await this.models.user.get({ accessToken: req.cookies.access_token })
    user = this.helpers.user.secureData(user)

    if (user.error || this.helpers.utils.isEmpty(user)) {
      this.errors.user.userDoesNotExist()
    }

    return {
      isAuth: true,
      user
    }
  } catch (error) {
    return { error }
  }
}

/**
 * Ajoute un nouvel utilisateur.
 *
 * @param {Object} req - L'objet de requête HTTP.
 * @param {Object} req.body.user - Les informations du nouvel utilisateur.
 * @param {string} req.body.user.firstname - Le prénom du nouvel utilisateur.
 * @param {string} req.body.user.lastname - Le nom de famille du nouvel utilisateur.
 * @param {string} req.body.user.email - L'adresse e-mail du nouvel utilisateur.
 * @param {string} req.body.user.password - Le mot de passe du nouvel utilisateur.
 * @param {string} req.body.user.role - Le rôle du nouvel utilisateur.
 * @param {boolean} req.body.sendPasswordByEmail - Indique si le mot de passe doit être envoyé par e-mail.
 * @param {string} req.cookies.access_token - Le jeton d'accès de l'utilisateur actuel.
 *
 * @returns {Promise<Object>} Un objet contenant le message de réussite.
 *
 * @throws {Error} Si l'utilisateur actuel n'est pas un administrateur, une erreur est levée.
 * @throws {Error} Si une erreur se produit lors de l'ajout de l'utilisateur, l'erreur est renvoyée.
 */
module.exports.new = async function (req) {
  try {
    // seul un rôle autorisé (admin) peut ajouter un utilisateur
    const isAdmin = await this.models.user.isAdmin(req.cookies.access_token)
    if (!isAdmin) this.errors.user.userNotAuthorized()

    const { firstname, lastname, email, password, role } = req.body.user
    const { sendPasswordByEmail } = req.body
    const data = await this.models.user.new(
      {
        firstname,
        lastname,
        email,
        role
      },
      password
    )
    if (data.error) return data.error
    if (password && sendPasswordByEmail) {
      this.models.user.sendPasswordByEmail(email, password)
    }
    data.message = 'User account added successfully'
    return data
  } catch (error) {
    return error
  }
}

/**
 * Met à jour les informations d'un utilisateur.
 *
 * @param {Object} req - L'objet de requête HTTP.
 * @param {string} req.params.id - L'ID de l'utilisateur à mettre à jour.
 * @param {Object} req.body.user - Les nouvelles informations de l'utilisateur.
 * @param {string} req.body.user.firstname - Le nouveau prénom de l'utilisateur.
 * @param {string} req.body.user.lastname - Le nouveau nom de famille de l'utilisateur.
 * @param {string} req.body.user.email - La nouvelle adresse e-mail de l'utilisateur.
 * @param {string} req.body.user.password - Le nouveau mot de passe de l'utilisateur.
 * @param {string} req.body.user.role - Le nouveau rôle de l'utilisateur.
 * @param {boolean} req.body.sendPasswordByEmail - Indique si le nouveau mot de passe doit être envoyé par e-mail.
 * @param {string} req.cookies.access_token - Le jeton d'accès de l'utilisateur actuel.
 *
 * @returns {Promise<Object>} Un objet contenant le message de réussite.
 *
 * @throws {Error} Si l'utilisateur actuel n'est pas un administrateur et tente de modifier un autre utilisateur, une erreur est levée.
 * @throws {Error} Si une erreur se produit lors de la mise à jour de l'utilisateur, l'erreur est renvoyée.
 */
module.exports.update = async function (req) {
  try {
    const { id } = req.params
    // on récupère l’utilisateur actif
    const activeUser = await this.models.user.get({ accessToken: req.cookies.access_token })
    // seul un utilisateur autorisé (admin) peut modifier un utilisateur autre que lui-même
    if (activeUser.role !== 'admin' && activeUser.id !== id) {
      this.errors.user.userNotAuthorized()
    }

    const { user, sendPasswordByEmail } = req.body
    const { password, email } = user

    // on supprime le mail si l’utilisateur n’est pas autorisé (admin)
    if (activeUser.role !== 'admin') delete user.email

    // on force l’id
    user.id = id
    const data = await this.models.user.update(user)

    if (data.error) {
      switch (data.error.message) {
      default:
        this.errors.user.unableToUpdateUser()
        break
      }
    }
    if (password && email && sendPasswordByEmail) {
      this.models.user.sendPasswordByEmail(email, password)
    } else {
      data.message = 'User account updated successfully'
    }
    return data
  } catch (error) {
    return error
  }
}

/**
 * Obtient tous les utilisateurs.
 *
 * @param {Object} req - L'objet de requête HTTP.
 * @param {string} req.query.role - Le rôle des utilisateurs à obtenir.
 * @param {string} req.cookies.access_token - Le jeton d'accès de l'utilisateur actuel.
 * @param {Object} res - L'objet de réponse HTTP.
 *
 * @returns {Promise<Object>} Un objet contenant la liste des utilisateurs.
 *
 * @throws {Error} Si l'utilisateur actuel n'est pas un administrateur, une erreur est levée.
 * @throws {Error} Si une erreur se produit lors de l'obtention des utilisateurs, l'erreur est renvoyée.
 */
module.exports.getAll = async function (req, res) {
  try {
    // seul un utilisateur autorisé (admin) peut obtenir des utilisateurs
    const isAdmin = await this.models.user.isAdmin(req.cookies.access_token)
    if (!isAdmin) this.errors.user.userNotAuthorized()

    const { role } = req.query
    const users = await this.models.user.getAll(role)
    if (users.error) this.errors.user.unableToGetUsers()
    res.send({ users })
  } catch (error) {
    return error
  }
}

/**
 * Supprime un utilisateur.
 *
 * @param {Object} req - L'objet de requête HTTP.
 * @param {string} req.params.id - L'ID de l'utilisateur à supprimer.
 * @param {string} req.cookies.access_token - Le jeton d'accès de l'utilisateur actuel.
 *
 * @returns {Promise<Object>} Un objet contenant le message de réussite.
 *
 * @throws {Error} Si l'utilisateur actuel n'est pas un administrateur, une erreur est levée.
 * @throws {Error} Si une erreur se produit lors de la suppression de l'utilisateur, l'erreur est renvoyée.
 */
module.exports.del = async function (req) {
  try {
    // seul un utilisateur autorisé (admin) peut ajouter un utilisateur
    const isAdmin = await this.models.user.isAdmin(req.cookies.access_token)
    if (!isAdmin) this.errors.user.userNotAuthorized()

    const { id } = req.params
    const data = await this.models.user.del({ id })
    if (data.error) {
      this.errors.user.userCannotBeDeleted()
    } else {
      data.message = 'User account deleted successfully'
    }
    return data
  } catch (error) {
    return { error }
  }
}

/**
 * Connecte un utilisateur.
 *
 * @param {Object} req - L'objet de requête HTTP.
 * @param {Object} req.body - Les informations de connexion de l'utilisateur.
 * @param {string} req.body.authMethod - La méthode d'authentification à utiliser ('emailAuth' ou 'streamLineAuth').
 * @param {string} req.body.password - Le mot de passe de l'utilisateur.
 * @param {string} req.body.email - L'adresse e-mail de l'utilisateur (pour 'emailAuth').
 * @param {string} req.body.urlToken - Le jeton d'URL de l'utilisateur (pour 'streamLineAuth').
 * @param {Object} res - L'objet de réponse HTTP.
 *
 * @returns {Promise<Object>} Un objet contenant les informations de l'utilisateur connecté et les jetons d'accès.
 *
 * @throws {Error} Si la méthode d'authentification n'est pas reconnue, une erreur est levée.
 * @throws {Error} Si les informations d'authentification sont incorrectes, une erreur est levée.
 * @throws {Error} Si une erreur se produit lors de la génération des jetons d'accès, l'erreur est renvoyée.
 */
module.exports.signIn = async function (req, res) {
  try {
    const { authMethod, password, email, urlToken } = req.body
    let data
    switch (authMethod) {
    case 'emailAuth':
      data = await this.models.user.authenticate(email, password, authMethod)
      break
    case 'streamLineAuth':
      data = await this.models.user.authenticate(urlToken, password, authMethod)
      break
    default:
      this.errors.user.authMethodNotRecognized()
    }
    if (!data.user || !data.authorized) {
      this.errors.user.badCredentials()
    }

    const {
      accessToken,
      refreshToken,
      xsrfToken
    } = await this.models.user.generateToken(data.user)

    // on sécurise les données utilisateur
    const user = this.helpers.user.secureData(data.user)

    // user authorized, send access token
    res
      .setCookie('access_token', accessToken, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: this.config.token.accessToken.expiresIn,
        path: '/api/'
      })
      .setCookie('refresh_token', refreshToken, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: this.config.token.refreshToken.expiresIn,
        path: '/api/'
      })
      .send({
        accessTokenExpiresIn: this.config.token.accessToken.expiresIn,
        refreshTokenExpiresIn: this.config.token.refreshToken.expiresIn,
        xsrfToken,
        isAuth: true,
        user
      })
  } catch (error) {
    return error
  }
}

/**
 * Rafraîchit les tokens d'accès et de rafraîchissement de l'utilisateur.
 *
 * @param {Object} req - L'objet de requête HTTP.
 * @param {string} req.cookies.refresh_token - Le jeton de rafraîchissement de l'utilisateur.
 * @param {Object} res - L'objet de réponse HTTP.
 *
 * @returns {Promise<Object>} Un objet contenant les nouveaux tokens et leurs dates d'expiration.
 *
 * @throws {Error} Si le jeton de rafraîchissement est manquant, une erreur est levée.
 * @throws {Error} Si le jeton de rafraîchissement est invalide, une erreur est levée.
 * @throws {Error} Si le jeton de rafraîchissement a expiré, une erreur est levée.
 * @throws {Error} Si une erreur se produit lors de la génération des nouveaux tokens, l'erreur est renvoyée.
 */
module.exports.refreshToken = async function (req, res) {
  try {
    // on récupère le refresh token
    const { cookies } = req
    let refreshToken
    if (cookies && cookies.refresh_token) {
      refreshToken = cookies.refresh_token
    } else {
      this.errors.user.missingRefreshToken()
    }

    // on récuère l’ancien refresh token en DB
    let oldRefreshToken = await this.redis.hget('user:refreshToken', refreshToken)
    if (!oldRefreshToken) this.errors.user.invalidToken()
    oldRefreshToken = JSON.parse(oldRefreshToken)
    oldRefreshToken.expiresOn = parseInt(oldRefreshToken.expiresOn)

    // on test la date d’expiration du refresh token
    if (oldRefreshToken.expiresOn < Date.now()) {
      this.errors.user.expiredToken()
    }

    // on récupère l’utilisateur
    const user = await this.models.user.get({ id: oldRefreshToken.userId })
    if (user.error) return user.error

    // on re-génère les tokens
    const { accessToken, refreshToken: newRefreshToken, xsrfToken } = await this.models.user.generateToken(
      user
    )

    // on supprime l’ancien refresh token
    await this.redis.hdel('user:refreshToken', refreshToken)

    // user authorized, send access token
    res
      .setCookie('access_token', accessToken, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: this.config.token.accessToken.expiresIn,
        path: '/api/'
      })
      .setCookie('refresh_token', newRefreshToken, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: this.config.token.refreshToken.expiresIn,
        path: '/api/'
      })
      .send({
        accessTokenExpiresIn: this.config.token.accessToken.expiresIn,
        refreshTokenExpiresIn: this.config.token.refreshToken.expiresIn,
        xsrfToken
      })
  } catch (error) {
    return error
  }
}

/**
 * Obtient les informations d'un utilisateur spécifique.
 *
 * @param {Object} req - L'objet de requête HTTP.
 * @param {string} req.params.id - L'ID de l'utilisateur à obtenir.
 * @param {string} req.cookies.access_token - Le jeton d'accès de l'utilisateur actuel.
 *
 * @returns {Promise<Object>} Un objet contenant les informations de l'utilisateur.
 *
 * @throws {Error} Si l'utilisateur actuel n'est pas un administrateur et tente d'obtenir un autre utilisateur, une erreur est levée.
 * @throws {Error} Si une erreur se produit lors de l'obtention de l'utilisateur, l'erreur est renvoyée.
 */
module.exports.get = async function (req) {
  try {
    const { id } = req.params
    // on récupère l’utilisateur actif
    const activeUser = await this.models.user.get({ accessToken: req.cookies.access_token })
    // seul un utilisateur autorisé (admin) peut obtenir un utilisateur autre que lui même
    if (!activeUser.role !== 'admin' && activeUser.id !== id) this.errors.user.userNotAuthorized()

    const user = await this.models.user.get({ id })
    if (user.error) return user.error
    delete user.hPassword
    delete user.salt
    delete user.token
    delete user.createdOn
    return { user }
  } catch (error) {
    return error
  }
}

/**
 * Demande une réinitialisation du mot de passe de l'utilisateur.
 *
 * @param {Object} req - L'objet de requête HTTP.
 * @param {string} req.body.email - L'adresse e-mail de l'utilisateur.
 * @param {Object} res - L'objet de réponse HTTP.
 *
 * @returns {Promise<Object>} Un objet contenant le message de réussite.
 *
 * @throws {Error} Si l'adresse e-mail n'est pas associée à un utilisateur, une erreur est levée.
 * @throws {Error} Si une erreur se produit lors de l'envoi de l'e-mail de réinitialisation du mot de passe, l'erreur est renvoyée.
 */
module.exports.askResetPassword = async function (req, res) {
  try {
    const { email } = req.body
    const data = await this.models.user.sendAskResetPassword(email)
    res.send(data)
  } catch (error) {
    return error
  }
}

/**
 * Réinitialise le mot de passe de l'utilisateur.
 *
 * @param {Object} req - L'objet de requête HTTP.
 * @param {string} req.body.token - Le jeton de réinitialisation du mot de passe.
 * @param {string} req.body.password - Le nouveau mot de passe de l'utilisateur.
 * @param {Object} res - L'objet de réponse HTTP.
 *
 * @returns {Promise<Object>} Un objet contenant le message de réussite.
 *
 * @throws {Error} Si le jeton de réinitialisation du mot de passe est invalide, une erreur est levée.
 * @throws {Error} Si une erreur se produit lors de la réinitialisation du mot de passe, l'erreur est renvoyée.
 */
module.exports.resetPassword = async function (req, res) {
  try {
    const { token, password } = req.body
    const data = await this.models.user.resetPassword(token, password)
    if (data.error) {
      this.errors.user.unableToResetPassword()
    } else {
      data.message = 'Password reset successfully'
    }
    res.send(data)
  } catch (error) {
    return error
  }
}
