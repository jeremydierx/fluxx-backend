/**
 * @file mailer.js
 * @description Ce fichier gère l'envoi de mails.
 * @requires handlebars - Utilisé pour créer des templates de mails.
 * @requires dotenv - Utilisé pour charger les variables d'environnement.
 * @param {string} MAILER_HOST - L'hôte du serveur de messagerie.
 * @param {number} MAILER_PORT - Le port du serveur de messagerie.
 * @param {boolean} MAILER_SECURE - Définit si la connexion est sécurisée.
 * @param {string} MAILER_AUTH_USER - L'utilisateur pour l'authentification.
 * @param {string} MAILER_AUTH_PASS - Le mot de passe pour l'authentification.
 * @param {string} DKIM_DOMAIN_NAME - Le nom de domaine pour DKIM.
 * @param {string} DKIM_KEY_SELECTOR - Le sélecteur de clé pour DKIM.
 * @param {string} DKIM_PRIVATE_KEY_PATH - Le chemin vers la clé privée DKIM.
 */

// const nodemailer = require('nodemailer')
// const fs = require('fs')
// const path = require('path')
const Handlebars = require('handlebars')

require('dotenv').config()

// Préparation de l’envoi du mail

// const privateKey = fs.readFileSync(process.env.DKIM_PRIVATE_KEY_PATH, 'utf8')
// const transporter = nodemailer.createTransport({
//   host: process.env.MAILER_HOST,
//   port: process.env.MAILER_PORT,
//   secure: process.env.MAILER_SECURE,
//   auth: {
//     user: process.env.MAILER_AUTH_USER,
//     pass: process.env.MAILER_AUTH_PASS
//   },
//   dkim: {
//     domainName: process.env.DKIM_DOMAIN_NAME,
//     keySelector: process.env.DKIM_KEY_SELECTOR,
//     privateKey
//   }
// })

// const emailLogo = {
//   filename: 'logo.png',
//   path: path.join(process.env.ASSETS_IMAGES_PATH, 'logo.jpg'),
//   cid: 'logo@fluxx.fr'
// }

Handlebars.registerHelper('replaceNewlines', function (text) {
  if (!text) return ''
  return new Handlebars.SafeString(text.replace(/\n/g, '<br>'))
})

module.exports = {
  functionsToBind: []
}
