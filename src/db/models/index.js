// eslint-disable-next-line global-require
require('dotenv').config()
require('pg').defaults.parseInt8 = true // Used to convert numerical strings into integers

const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')
require('sequelize-hierarchy')(Sequelize)

const basename = path.basename(__filename)
const env = process.env.NODE_ENV || 'development'
const { Op } = Sequelize

const config = require('../../../config/db.config.js')[env]
const { rebuildHierarchy, dbSync, forceDBSync } = require('../../../config/config.js')

config.operatorsAliases = Op

const db = {}

let sequelize
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config)
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config)
}

fs.readdirSync(__dirname)
  .filter(file => file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js')
  .forEach(file => {
    const model = sequelize.import(path.join(__dirname, file))
    db[model.name] = model
  })

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

if (rebuildHierarchy) db.Post.rebuildHierarchy()

if (dbSync && forceDBSync) sequelize.sync({ force: true })

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
