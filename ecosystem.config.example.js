/**
 * @file
 * Ce fichier est utilisé pour configurer PM2, un gestionnaire de processus pour
 * Node.js. Il définit une fonction 'getPostSetup' qui génère une série de
 * commandes en fonction de l'environnement spécifié.
 *
 * Ces commandes sont utilisées pour créer une structure de répertoires sur le
 * serveur de production. Les chemins vers ces répertoires sont stockés dans des
 * variables pour être utilisés ultérieurement.
 *
 * Les commandes sont ensuite jointes en une seule chaîne avec ' && ' entre
 * chaque commande, ce qui signifie que si une commande échoue, les commandes
 * suivantes ne seront pas exécutées.
 *
 * @function getPostSetup
 * @param {string} env - L'environnement dans lequel les répertoires sont créés.
 * @returns {string} - Une chaîne de commandes pour créer la structure de
 * répertoires.
 */

let cmd
let currentPath
let sharedPath
let postDeploy
let assetsPath
let imagesPath
let fontsPath
let postSetup

function getPostSetup (env) {
  switch (env) {
  case 'production':
    sharedPath = '~/apps/fluxx.fr/shared'
    assetsPath = `${sharedPath}/assets`
    imagesPath = `${assetsPath}/images`
    fontsPath = `${assetsPath}/fonts`
    postSetup = [
      `mkdir ${sharedPath}`,
      `mkdir ${assetsPath}`,
      `mkdir ${imagesPath}`,
      `mkdir ${fontsPath}`
    ].join(' && ')
    break
  case 'staging':
    sharedPath = '~/apps/stag.fluxx.fr/shared'
    assetsPath = `${sharedPath}/assets`
    imagesPath = `${assetsPath}/images`
    fontsPath = `${assetsPath}/fonts`
    postSetup = [
      `mkdir ${sharedPath}`,
      `mkdir ${assetsPath}`,
      `mkdir ${imagesPath}`,
      `mkdir ${fontsPath}`
    ].join(' && ')
    break
  }
  return postSetup
}

function getPostDeploy (env) {
  switch (env) {
  case 'production':
    cmd = '. ~/.nvm/nvm.sh'
    currentPath = '~/apps/fluxx.fr/backend/current'
    sharedPath = '~/apps/fluxx.fr/backend/shared'
    postDeploy = [
      cmd,
      'npm install',
      `rm -f ${currentPath}/.env`,
      `ln -s ${sharedPath}/.env ${currentPath}/`,
      `cp ${currentPath}/src/seed/assets/images/* ~/apps/fluxx.fr/shared/assets/images/`,
      `cp ${currentPath}/src/seed/assets/fonts/* ~/apps/fluxx.fr/shared/assets/fonts/`
    ].join(' && ')
    break
  case 'staging':
    cmd = '. ~/.nvm/nvm.sh'
    currentPath = '~/apps/stag.fluxx.fr/backend/current'
    sharedPath = '~/apps/stag.fluxx.fr/backend/shared'
    postDeploy = [
      cmd,
      'npm install',
      `rm -f ${currentPath}/.env`,
      `ln -s ${sharedPath}/.env ${currentPath}/`,
      `cp ${currentPath}/src/seed/assets/images/* ~/apps/stag.fluxx.fr/shared/assets/images/`,
      `cp ${currentPath}/src/seed/assets/fonts/* ~/apps/stag.fluxx.fr/shared/assets/fonts/`
    ].join(' && ')
    break
  }
  return postDeploy
}

module.exports = {
  apps: [{
    name: 'Fluxx Backend'
  }],

  // Configuration de déploiement
  deploy: {
    production: {
      user: 'ubuntu',
      host: ['nom_ou_ip_du_serveur'],
      ref: 'origin/main',
      repo: 'git@deployment:jeremydierx/fluxx.fr-backend.git',
      path: '/home/ubuntu/apps/fluxx.fr/backend',
      'post-deploy': getPostDeploy('production'),
      'post-setup': getPostSetup('production')
    },
    staging: {
      user: 'ubuntu',
      host: ['nom_ou_ip_du_serveur'],
      ref: 'origin/main',
      repo: 'git@deployment:jeremydierx/fluxx.fr-backend.git',
      path: '/home/ubuntu/apps/stag.fluxx.fr/backend',
      'post-deploy': getPostDeploy('staging'),
      'post-setup': getPostSetup('staging')
    }
  }
}
