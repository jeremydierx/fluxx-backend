/**
 * @file
 * Ce fichier exporte une fonction qui retourne un objet de configuration
 * pour les assets en fonction des variables d'environnement.
 *
 * @module assets
 * @param {object} env - Les variables d'environnement.
 * @property {string} env.ASSETS_IMAGES_PATH - Le chemin vers les images.
 * @property {string} env.ASSETS_FONTS_PATH - Le chemin vers les polices.
 * @returns {object} Un objet de configuration pour les assets.
 */

module.exports = env => ({
  imagesPath: env.ASSETS_IMAGES_PATH,
  fontsPath: env.ASSETS_FONTS_PATH
})
