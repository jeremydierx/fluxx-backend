/**
 * @file
 * Ce fichier JavaScript est utilisé pour démarrer et gérer un service worker
 * dans une application Node.js. Il importe l'application à partir du fichier
 * 'app.js' et initialise le mode de l'application en tant que 'worker'.
 *
 * En cas de réception d'un signal SIGINT (généralement envoyé lors de l'arrêt
 * du processus), le script arrête gracieusement le service en fermant la
 * connexion Redis et en enregistrant un événement 'worker_stopped' dans le
 * journal des événements.
 *
 * Si une erreur se produit lors de l'arrêt du service, l'erreur est enregistrée
 * dans la console.
 *
 * @requires module:./src/app
 * @requires module:process
 */

const app = require('./src/app')({
  appMode: 'worker'
})

// Graceful Stop
process.on('SIGINT', function () {
  app.redis.quit()
    .then(() => {
      // on enregistre l’évenement (log:events)
      app.models.log.add({
        type: 'events',
        event: 'worker_stopped',
        message: 'Worker stopped',
        save: true
      })
      process.exit(0)
    })
    .catch(err => {
      console.log(err)
      process.exit(1)
    })
})

/**
 * Fonction principale qui initialise et démarre le service worker
 *
 * @function main
 * @param {none} Aucun paramètre d'entrée
 * @returns {void} Aucune valeur de retour
 */
function main () {
  app.ready(() => {
    // on enregistre l’évenement (log:events)
    app.models.log.add({
      type: 'events',
      event: 'worker_started',
      message: 'Worker started',
      save: true
    })
  })
  console.log('Worker started')
}

main()
