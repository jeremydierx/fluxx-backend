/**
 * @file mailer.js
 * @description Ce fichier configure le transporteur de courrier électronique et charge les variables d'environnement nécessaires.
 * @requires nodemailer - Module pour envoyer des emails
 * @requires handlebars - Module pour gérer les modèles de courrier électronique
 * @requires fs - Module pour lire les fichiers du système
 * @requires path - Module pour gérer les chemins de fichiers
 * @requires dotenv - Module pour charger les variables d'environnement à partir d'un fichier .env
 * @property {string} privateKey - Lit la clé privée DKIM à partir du chemin spécifié dans les variables d'environnement
 * @property {nodemailer.Transporter} transporter - Crée un transporteur de courrier électronique avec les paramètres spécifiés dans les variables d'environnement
 * @property {Object} emailLogo - Définit le logo à utiliser dans les courriels
 */

const nodemailer = require('nodemailer')
const Handlebars = require('handlebars')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

const privateKey = fs.readFileSync(process.env.DKIM_PRIVATE_KEY_PATH, 'utf8')
const transporter = nodemailer.createTransport({
  host: process.env.MAILER_HOST,
  port: process.env.MAILER_PORT,
  secure: process.env.MAILER_SECURE,
  auth: {
    user: process.env.MAILER_AUTH_USER,
    pass: process.env.MAILER_AUTH_PASS
  },
  dkim: {
    domainName: process.env.DKIM_DOMAIN_NAME,
    keySelector: process.env.DKIM_KEY_SELECTOR,
    privateKey
  }
})

const emailLogo = {
  filename: 'logo.png',
  path: path.join(process.env.ASSETS_IMAGES_PATH, 'logo.png'),
  cid: 'logo@fluxx.fr'
}

const askResetPasswordTpl = Handlebars.compile(
  fs.readFileSync(path.join(
    __dirname,
    '../mailTemplates',
    'askResetPassword.hbs'
  )).toString()
)

module.exports = {
  /**
   * @async
   * @function sendAskResetPassword
   * @description Envoie un email à l'utilisateur avec un lien pour réinitialiser son mot de passe.
   * @param {Object} user - L'utilisateur à qui envoyer l'email. Doit contenir au moins les propriétés 'email' et 'name'.
   * @param {string} token - Le jeton de réinitialisation du mot de passe à inclure dans l'email.
   * @returns {Promise} Renvoie une promesse qui se résout lorsque l'email a été envoyé.
   */
  sendAskResetPassword: async function (user, token) {
    try {
      const attachments = []
      attachments.push(emailLogo)

      const html = askResetPasswordTpl({
        firstname: user.firstname,
        askResetPasswordUrl: `${this.config.frontend.appUrl}${this.config.mailer.askResetPasswordUrl}${token}`
      })

      await transporter.sendMail({
        from: this.config.mailer.mainFrom,
        to: user.email,
        subject: 'Demande de réinitialisation de votre mot de passe',
        html,
        attachments
      })

      return {
        askResetPasswordSent: true
      }
    } catch (error) {
      return error
    }
  },
  functionsToBind: [
    'sendAskResetPassword'
  ]
}
