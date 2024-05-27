#! /bin/bash

# remoteWorker.sh
# Ce script bash est utilisé pour gérer les workers distants dans un environnement
# spécifique (stag ou prod).
# Il prend deux arguments lors de l'exécution : ENV et COMMAND.
# ENV spécifie l'environnement dans lequel les workers sont gérés (stag ou prod).
# COMMAND spécifie l'action à effectuer sur les workers. Les commandes possibles
# sont : start, stop, restart, delete.
# Le script récupère le nombre de workers à partir du fichier .env et exécute la
# commande PM2 pour chaque worker.
# Par exemple, pour démarrer tous les workers dans l'environnement de production,
# exécutez : ./remoteWorker.sh prod start

ENV=$1
COMMAND=$2

# on récupère le nombre de workers
NUM_OF_WORKERS=$(grep -oP 'NUM_OF_WORKERS=\K\d+' ../shared/.env)

# pour chacun des workers, on exécute la commande pm2
for i in $(seq 1 $NUM_OF_WORKERS)
do
  case $COMMAND in
  start)
      . ~/.nvm/nvm.sh && pm2 start worker.js --time --name $ENV-mpa-worker$i --max-memory-restart 300M -- numWorker=$i
      ;;
  stop)
      . ~/.nvm/nvm.sh && pm2 stop $ENV-mpa-worker$i
      ;;
  restart)
      . ~/.nvm/nvm.sh && pm2 restart $ENV-mpa-worker$i
      ;;
  delete)
      . ~/.nvm/nvm.sh && pm2 delete $ENV-mpa-worker$i
      ;;
  *)
      echo "Usage: $0 {stag|prod} {start|stop|restart|delete}"
      exit 1
      ;;
  esac
done
