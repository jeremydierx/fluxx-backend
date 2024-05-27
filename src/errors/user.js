/**
 * @file
 * Ce fichier définit une classe d'erreur HTTP personnalisée qui étend 'WError'.
 * Elle prend en paramètre un objet contenant des informations sur l'erreur et
 * expose une méthode 'fullStack' pour obtenir la trace de la pile complète.
 *
 * @module user
 * @requires verror
 * @class HTTPError
 * @extends WError
 * @param {object} options - Les informations sur l'erreur.
 * @property {string} options.cause - La cause de l'erreur.
 * @property {string} options.name - Le nom de l'erreur.
 * @property {string} options.message - Le message de l'erreur.
 * @property {object} options.info - Les informations supplémentaires sur l'erreur.
 * @property {number} options.status - Le code de statut HTTP de l'erreur.
 * @property {boolean} [options.expose=true] - Indique si le message doit être envoyé au client.
 * @method fullStack
 * @returns {string} Une chaîne contenant la trace de la pile complète.
 */

const { WError, VError } = require('verror')

/**
 * Errors
 * @module errors
 */

/**
 * @class HTTPError
 */
class HTTPError extends WError {
  /**
   * @constructor
   * @param {Object} options
   * @param {string} options.cause - The error's cause.
   * @param {string} options.name - The error's name.
   * @param {string} options.message - The error's message.
   * @param {Object} options.info - The error's info.
   * @param {number} options.status - The status code.
   * @param {boolean} [options.expose=true] - Can be used to signal if message should be sent to the client.
   */
  constructor ({ cause, name, message, info, status, expose = true }) {
    super({ cause, message, name, info }, message)
    this.isHTTPError = true
    this.status = status
    this.expose = expose
  }

  /**
   * @method fullStack
   * @returns {string} A string containing the full stack trace.
   */
  fullStack () {
    return VError.fullStack(this)
  }
}

/**
 * @class MissingRequiredParameterError
 */
const MissingRequiredParameterError = class MissingRequiredParameterError extends HTTPError {
  constructor ({ message = 'Missing required parameters', info } = {}) {
    super({ name: 'missing_required_parameter', message, info, status: 400 })
  }
}

/**
 * @class BadCredentialsError
 */
const BadCredentialsError = class BadCredentialsError extends HTTPError {
  /**
   * @constructor
   * @param {Object} options
   * @param {string} [options.message='Bad credentials'] - The error's message.
   * @param {Object} options.info - The error's info.
   */
  constructor ({ message = 'Bad credentials', info } = {}) {
    super({ name: 'bad_credentials', message, info, status: 401 })
  }
}

/**
 * @class AuthMethodNotRecognizedError
 */
const AuthMethodNotRecognizedError = class AuthMethodNotRecognizedErro extends HTTPError {
  /**
   * @constructor
   * @param {Object} options
   * @param {string} [options.message='Auth method not recognized'] - The error's message.
   * @param {Object} options.info - The error's info.
   */
  constructor ({ message = 'Auth method not recognized', info } = {}) {
    super({ name: 'auth_method_not_recognized', message, info, status: 401 })
  }
}

/**
 * @class InvalidTokenError
 */
const InvalidTokenError = class InvalidTokenError extends HTTPError {
  /**
   * @constructor
   * @param {Object} options
   * @param {string} [options.message='Bad credentials'] - The error's message.
   * @param {Object} options.info - The error's info.
   */
  constructor ({ message = 'Invalid token', info } = {}) {
    super({ name: 'invalid_token', message, info, status: 401 })
  }
}

/**
 * @class ExpiredTokenError
 */
const ExpiredTokenError = class ExpiredTokenError extends HTTPError {
  /**
   * @constructor
   * @param {Object} options
   * @param {string} [options.message='Expired token'] - The error's message.
   * @param {Object} options.info - The error's info.
   */
  constructor ({ message = 'Expired token', info } = {}) {
    super({ name: 'expired_token', message, info, status: 401 })
  }
}

/**
 * @class MissingAccessTokenError
 */
const MissingAccessTokenError = class MissingAccessTokenError extends HTTPError {
  /**
   * @constructor
   * @param {Object} options
   * @param {string} [options.message='Missing access token'] - The error's message.
   * @param {Object} options.info - The error's info.
   */
  constructor ({ message = 'Missing access token', info } = {}) {
    super({ name: 'missing_access_token', message, info, status: 401 })
  }
}

/**
 * @class MissingRefreshTokenError
 */
const MissingPasswordTokenError = class MissingPasswordTokenError extends HTTPError {
  /**
   * @constructor
   * @param {Object} options
   * @param {string} [options.message='Missing password token'] - The error's message.
   * @param {Object} options.info - The error's info.
   */
  constructor ({ message = 'Missing password token', info } = {}) {
    super({ name: 'missing_password_token', message, info, status: 401 })
  }
}

/**
 * @class MissingRefreshTokenError
 */
const MissingRefreshTokenError = class MissingRefreshTokenError extends HTTPError {
  /**
   * @constructor
   * @param {Object} options
   * @param {string} [options.message='Missing refresh token'] - The error's message.
   * @param {Object} options.info - The error's info.
   */
  constructor ({ message = 'Missing refresh token', info } = {}) {
    super({ name: 'missing_refresh_token', message, info, status: 401 })
  }
}

/**
 * @class UserDoesNotExistError
 */
const UserDoesNotExistError = class UserDoesNotExistError extends HTTPError {
  /**
   * @constructor
   * @param {Object} options
   * @param {string} [options.message='User does not exist'] - The error's message.
   * @param {Object} options.info - The error's info.
   */
  constructor ({ message = 'User account does not exist', info } = {}) {
    super({ name: 'user_does_not_exist', message, info, status: 404 })
  }
}

/**
 * @class UserCannotBeDeletedError
 */
const UserCannotBeDeletedError = class UserCannotBeDeletedError extends HTTPError {
  /**
   * @constructor
   * @param {Object} options
   * @param {string} [options.message='User cannot be deleted'] - The error's message.
   * @param {Object} options.info - The error's info.
   */
  constructor ({ message = 'User account cannot be deleted', info } = {}) {
    super({ name: 'user_cannot_be_deleted', message, info, status: 500 })
  }
}

/**
 * @class UnableToGetUsersError
 */
const UnableToGetUsersError = class UnableToGetUsersError extends HTTPError {
  /**
   * @constructor
   * @param {Object} options
   * @param {string} [options.message='Unable to get users'] - The error's message.
   * @param {Object} options.info - The error's info.
   */
  constructor ({ message = 'Unable to get users', info } = {}) {
    super({ name: 'unable_to_get_users', message, info, status: 500 })
  }
}

/**
 * @class UnableToAddUserError
 */
const UnableToAddUserError = class UnableToAddUserError extends HTTPError {
  /**
   * @constructor
   * @param {Object} options
   * @param {string} [options.message='Unable to add user'] - The error's message.
   * @param {Object} options.info - The error's info.
   */
  constructor ({ message = 'Unable to add user account', info } = {}) {
    super({ name: 'unable_to_add_user', message, info, status: 500 })
  }
}

/**
 * @class UnableToResetPasswordError
 */
const UnableToResetPasswordError = class UnableToResetPasswordError extends HTTPError {
  /**
   * @constructor
   * @param {Object} options
   * @param {string} [options.message='Unable to add user'] - The error's message.
   * @param {Object} options.info - The error's info.
   */
  constructor ({ message = 'Unable to reset password', info } = {}) {
    super({ name: 'unable_to_reset_password', message, info, status: 500 })
  }
}

/**
 * @class UnableToUpdateUserError
 */
const UnableToUpdateUserError = class UnableToUpdateUserError extends HTTPError {
  /**
   * @constructor
   * @param {Object} options
   * @param {string} [options.message='Unable to update user'] - The error's message.
   * @param {Object} options.info - The error's info.
   */
  constructor ({ message = 'Unable to update user account', info } = {}) {
    super({ name: 'unable_to_update_user', message, info, status: 500 })
  }
}

/**
 * @class UserAlreadyExistsError
 */
const UserAlreadyExistsError = class UserAlreadyExistsError extends HTTPError {
  /**
   * @constructor
   * @param {Object} options
   * @param {string} [options.message='User already exists'] - The error's message.
   * @param {Object} options.info - The error's info.
   */
  constructor ({ message = 'User account already exists', info } = {}) {
    super({ name: 'user_already_exists', message, info, status: 500 })
  }
}

/**
 * @class UserNotAuthorizedError
 */
const UserNotAuthorizedError = class UserNotAuthorizedError extends HTTPError {
  /**
   * @constructor
   * @param {Object} options
   * @param {string} [options.message='user not authorized'] - The error's message.
   * @param {Object} options.info - The error's info.
   */
  constructor ({ message = 'User not authorized', info } = {}) {
    super({ name: 'user_not_authorized', message, info, status: 403 })
  }
}

/**
 * @class UnableSendNewContactError
 */
const UnableToSendNewContactError = class UnableToSendNewContactError extends HTTPError {
  /**
   * @constructor
   * @param {Object} options
   * @param {string} [options.message='Unable to send Message'] - The error's message.
   * @param {Object} options.info - The error's info.
   */
  constructor ({ message = 'Unable to send Message', info } = {}) {
    super({ name: 'unable_to_send_new_contact', message, info, status: 500 })
  }
}

module.exports = {
  missingRequiredParameter: (opts) => {
    throw new MissingRequiredParameterError(opts)
  },
  badCredentials: (opts) => {
    throw new BadCredentialsError(opts)
  },
  authMethodNotRecognized: (opts) => {
    throw new AuthMethodNotRecognizedError(opts)
  },
  invalidToken: (opts) => {
    throw new InvalidTokenError(opts)
  },
  expiredToken: (opts) => {
    throw new ExpiredTokenError(opts)
  },
  missingAccessToken: (opts) => {
    throw new MissingAccessTokenError(opts)
  },
  missingRefreshToken: (opts) => {
    throw new MissingRefreshTokenError(opts)
  },
  userDoesNotExist: (opts) => {
    throw new UserDoesNotExistError(opts)
  },
  missingPasswordToken: (opts) => {
    throw new MissingPasswordTokenError(opts)
  },
  userCannotBeDeleted: (opts) => {
    throw new UserCannotBeDeletedError(opts)
  },
  unableToGetUsers: (opts) => {
    throw new UnableToGetUsersError(opts)
  },
  unableToAddUser: (opts) => {
    throw new UnableToAddUserError(opts)
  },
  unableToUpdateUser: (opts) => {
    throw new UnableToUpdateUserError(opts)
  },
  userNotAuthorized: (opts) => {
    throw new UserNotAuthorizedError(opts)
  },
  userAlreadyExists: (opts) => {
    throw new UserAlreadyExistsError(opts)
  },
  unableToResetPassword: (opts) => {
    throw new UnableToResetPasswordError(opts)
  },
  unableToSendNewContact: (opts) => {
    throw new UnableToSendNewContactError(opts)
  }
}
