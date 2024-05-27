/**
 * @file
 * Ce fichier définit un middleware pour vérifier le JWT (JSON Web Token) de
 * l'utilisateur. Il exporte un objet avec une méthode 'verifyJWT' qui est une
 * fonction asynchrone. Cette fonction récupère les cookies et les headers de
 * la requête, vérifie la présence d'un access token dans les cookies et d'un
 * xsrf token dans les headers. Si l'un de ces tokens est manquant, une erreur
 * est générée. Ensuite, l'access token est décodé et comparé au xsrf token. Si
 * les tokens ne correspondent pas, une erreur est générée.
 *
 * @module secure
 * @param {object} req - La requête HTTP.
 * @param {object} res - La réponse HTTP.
 * @returns {Promise} Une promesse qui résout si les tokens sont valides, et rejette sinon.
 */

module.exports = {
  verifyJWT: async function (req, res) {
    try {
      // on récupère les cookies et headers
      const { cookies, headers } = req
      if (!cookies || !cookies.access_token) {
        this.errors.user.missingAccessToken({
          message: 'Missing access token (cookie)'
        })
      }

      // on récupère l’access token dans les cookies
      const accessToken = cookies.access_token

      // on récupère le xsrf token dans les headers
      let xsrfToken
      if (headers.upgrade === 'websocket') {
        if (!headers || !headers['sec-websocket-protocol'] || !headers['sec-websocket-protocol']) {
          this.errors.user.missingAccessToken({
            message: 'Missing x-srf-token (headers)'
          })
        }
        xsrfToken = headers['sec-websocket-protocol'].split(',')[0]
      } else {
        if (!headers || !headers['x-srf-token']) {
          this.errors.user.missingAccessToken({
            message: 'Missing x-srf-token (headers)'
          })
        }
        xsrfToken = headers['x-srf-token']
      }

      // on décode l’access token
      const decodedToken = this.jwt.verify(accessToken)

      if (xsrfToken !== decodedToken.xsrfToken) {
        this.errors.user.invalidToken({
          message: 'Bad x-srf-token'
        })
      }

      // on récupère l’id de l’utilisateur depuis
      // l’access token déocdé
      const userId = decodedToken.id

      // on récupère l’utilisateur avec son id
      const user = await this.models.user.get({ id: userId })
      if (user.error || this.helpers.utils.isEmpty(user)) {
        this.errors.user.badCredentials({
          message: 'User does not exist'
        })
      }
    } catch (err) {
      res.code(401).send(err)
    }
  }
}
