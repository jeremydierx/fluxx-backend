/**
 * @file
 * Ce fichier définit les routes pour les opérations liées aux utilisateurs.
 * Il exporte une fonction qui prend une instance de Fastify en argument et
 * retourne un tableau de configurations de routes.
 *
 * Chaque configuration de route est un objet qui spécifie la méthode HTTP,
 * l'URL, un pré-gestionnaire et un gestionnaire pour la route.
 *
 * Le pré-gestionnaire 'fastify.auth' est utilisé pour vérifier le JWT avant
 * d'exécuter le gestionnaire de la route.
 *
 * Le gestionnaire de la route est une fonction définie dans le contrôleur
 * utilisateur qui est responsable de l'exécution de l'opération spécifique.
 *
 * Pour la route '/api/users/signIn', un schéma est défini pour valider le
 * corps de la requête. Le schéma spécifie que le corps de la requête doit
 * être un objet avec des propriétés 'email', 'token', 'password' et
 * 'authMethod', et que 'authMethod' est requis.
 *
 * @module user
 * @param {object} fastify - Une instance de Fastify.
 * @returns {Array} Un tableau de configurations de routes.
 */

module.exports = (fastify) => {
  return [
    /**
     * Route: GET /api/users/getAuth
     * Cette route est utilisée pour obtenir les informations d'authentification de
     * l'utilisateur. Elle nécessite une authentification JWT, qui est vérifiée par
     * le middleware 'secure.verifyJWT'. Le contrôleur 'user.getAuth' est utilisé
     * pour gérer la requête.
     */
    {
      method: 'GET',
      url: '/api/users/getAuth',
      preHandler: fastify.auth([fastify.middlewares.secure.verifyJWT]),
      handler: fastify.controllers.user.getAuth
    },
    /**
     * Route: POST /api/users/signIn
     * Cette route est utilisée pour connecter un utilisateur. Elle attend un corps
     * de requête qui est un objet avec des propriétés 'email', 'token', 'password'
     * et 'authMethod'. La propriété 'authMethod' est requise. Le corps de la
     * requête est validé par le schéma défini dans la propriété 'schema'.
     */
    {
      method: 'POST',
      url: '/api/users/signIn',
      schema: {
        body: {
          type: 'object',
          properties: {
            email: { type: 'string' },
            token: { type: 'string' },
            password: { type: 'string' },
            authMethod: { type: 'string' }
          },
          required: ['authMethod']
        }
      },
      handler: fastify.controllers.user.signIn
    },
    /**
     * Route: GET /api/users/refreshToken
     * Cette route est utilisée pour rafraîchir le token d'authentification de
     * l'utilisateur. Elle ne nécessite pas d'authentification. Le contrôleur
     * 'user.refreshToken' est utilisé pour gérer la requête.
     */
    {
      method: 'GET',
      url: '/api/users/refreshToken',
      handler: fastify.controllers.user.refreshToken
    },
    /**
     * Route: POST /api/users
     * Cette route est utilisée pour créer un nouvel utilisateur. Elle attend un
     * corps de requête qui est un objet avec une propriété 'user' et une propriété
     * 'sendPasswordByEmail'. La propriété 'user' est un objet avec des propriétés
     * 'firstname', 'lastname', 'email', 'password' et 'role'. Toutes ces
     * propriétés sont requises. La propriété 'sendPasswordByEmail' est un booléen
     * qui indique si le mot de passe doit être envoyé par email à l'utilisateur.
     * Le corps de la requête est validé par le schéma défini dans la propriété
     * 'schema'.
     */
    {
      method: 'POST',
      url: '/api/users',
      schema: {
        body: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                firstname: { type: 'string' },
                lastname: { type: 'string' },
                email: { type: 'string', format: 'email' },
                password: { type: 'string' },
                role: { type: 'string' }
              },
              required: [
                'firstname',
                'lastname',
                'email',
                'password',
                'role'
              ]
            },
            sendPasswordByEmail: { type: 'boolean' }
          },
          required: [
            'user',
            'sendPasswordByEmail'
          ]
        }
      },
      preHandler: fastify.auth([fastify.middlewares.secure.verifyJWT]),
      handler: fastify.controllers.user.new
    },
    /**
     * Route: PUT /api/users/:id
     * Cette route est utilisée pour mettre à jour les informations d'un utilisateur
     * spécifique. L'ID de l'utilisateur est passé en tant que paramètre d'URL.
     * Elle attend un corps de requête qui est un objet avec une propriété 'user'
     * et une propriété 'sendPasswordByEmail'. La propriété 'user' est un objet
     * avec des propriétés 'firstname', 'lastname', 'email', 'password' et 'role'.
     * Les propriétés 'firstname', 'lastname' et 'email' sont requises. La
     * propriété 'sendPasswordByEmail' est un booléen qui indique si le mot de
     * passe doit être envoyé par email à l'utilisateur. Le corps de la requête est
     * validé par le schéma défini dans la propriété 'schema'. Elle nécessite une
     * authentification JWT, qui est vérifiée par le middleware
     * 'secure.verifyJWT'. Le contrôleur 'user.update' est utilisé pour gérer la
     * requête.
     */
    {
      method: 'PUT',
      url: '/api/users/:id',
      schema: {
        body: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                firstname: { type: 'string' },
                lastname: { type: 'string' },
                email: { type: 'string' },
                password: { type: 'string' },
                role: { type: 'string' }
              },
              required: [
                'firstname',
                'lastname',
                'email'
              ]
            },
            sendPasswordByEmail: { type: 'boolean' }
          },
          required: [
            'user',
            'sendPasswordByEmail'
          ]
        }
      },
      preHandler: fastify.auth([fastify.middlewares.secure.verifyJWT]),
      handler: fastify.controllers.user.update
    },
    /**
     * Route: GET /api/users
     * Cette route est utilisée pour obtenir une liste de tous les utilisateurs.
     * Elle nécessite une authentification JWT, qui est vérifiée par le middleware
     * 'secure.verifyJWT'. Le contrôleur 'user.getAll' est utilisé pour gérer la
     * requête. La propriété 'role' est requise dans le corps de la requête.
     */
    {
      method: 'GET',
      url: '/api/users',
      required: ['role'],
      preHandler: fastify.auth([fastify.middlewares.secure.verifyJWT]),
      handler: fastify.controllers.user.getAll
    },
    /**
     * Route: DELETE /api/users/:id
     * Cette route est utilisée pour supprimer un utilisateur spécifique. L'ID de
     * l'utilisateur est passé en tant que paramètre d'URL. Elle nécessite une
     * authentification JWT, qui est vérifiée par le middleware
     * 'secure.verifyJWT'. Le contrôleur 'user.del' est utilisé pour gérer la
     * requête.
     */
    {
      method: 'DELETE',
      url: '/api/users/:id',
      required: ['id'],
      preHandler: fastify.auth([fastify.middlewares.secure.verifyJWT]),
      handler: fastify.controllers.user.del
    },
    /**
     * Route: GET /api/users/:id
     * Cette route est utilisée pour obtenir les informations d'un utilisateur
     * spécifique. L'ID de l'utilisateur est passé en tant que paramètre d'URL.
     * Elle nécessite une authentification JWT, qui est vérifiée par le middleware
     * 'secure.verifyJWT'. Le contrôleur 'user.get' est utilisé pour gérer la
     * requête.
     */
    {
      method: 'GET',
      url: '/api/users/:id',
      required: ['id'],
      preHandler: fastify.auth([fastify.middlewares.secure.verifyJWT]),
      handler: fastify.controllers.user.get
    },
    /**
     * Route: POST /api/users/askResetPassword
     * Cette route est utilisée pour demander une réinitialisation du mot de passe.
     * Elle attend un corps de requête qui est un objet avec une propriété 'email'.
     * Le corps de la requête est validé par le schéma défini dans la propriété
     * 'schema'. Le contrôleur 'user.askResetPassword' est utilisé pour gérer la
     * requête.
     */
    {
      method: 'POST',
      url: '/api/users/askResetPassword',
      schema: {
        body: {
          type: 'object',
          properties: {
            email: { type: 'string' }
          },
          required: ['email']
        }
      },
      handler: fastify.controllers.user.askResetPassword
    },
    /**
     * Route: PUT /api/users/resetPassword
     * Cette route est utilisée pour réinitialiser le mot de passe. Elle attend un
     * corps de requête qui est un objet avec des propriétés 'token' et 'password'.
     * Le corps de la requête est validé par le schéma défini dans la propriété
     * 'schema'. Le contrôleur 'user.resetPassword' est utilisé pour gérer la
     * requête.
     */
    {
      method: 'PUT',
      url: '/api/users/resetPassword',
      schema: {
        body: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            password: { type: 'string' }
          },
          required: ['token', 'password']
        }
      },
      handler: fastify.controllers.user.resetPassword
    }
  ]
}
