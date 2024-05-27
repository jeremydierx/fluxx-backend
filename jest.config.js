/**
 * @file
 * Ce fichier est utilisé pour configurer Jest, un cadre de test JavaScript.
 * Il exporte un objet de configuration qui est utilisé par Jest pour déterminer
 * comment exécuter les tests.
 *
 * @property {Array<string>} testPathIgnorePatterns - Un tableau de chaînes de
 * caractères qui spécifie les chemins à ignorer lors de l'exécution des tests.
 * Par défaut, tous les fichiers dans le répertoire './test/models' sont ignorés.
 */

module.exports = {
  testPathIgnorePatterns: [
    // './test/models/.*.js'
  ]
}
