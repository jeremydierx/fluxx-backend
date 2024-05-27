const path = require('path')
const cwd = process.cwd()

const { getEnv } = require(path.join(cwd, 'src/helpers/utils.js'))
const env = getEnv('./test/.env.test')

module.exports = () => {
  return {
    appMode: 'console',
    redisDBIndex: env.REDIS_DB_INDEX,
    redisDBPassword: env.REDIS_DB_PASSWORD,
    redisDBPort: env.REDIS_DB_PORT,
    envFile: './test/.env.test',
    assetsImagesPath: env.ASSETS_IMAGES_PATH
  }
}
