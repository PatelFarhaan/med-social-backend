// eslint-disable-next-line global-require
require('dotenv').config()
const http = require('http')
const path = require('path')
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const compression = require('compression')
const passport = require('passport')
const socketIo = require('socket.io')
const { makeExecutableSchema } = require('graphql-tools')
const { fileLoader, mergeTypes, mergeResolvers } = require('merge-graphql-schemas')
const { ApolloServer } = require('apollo-server-express')
const { graphqlUploadExpress } = require('graphql-upload')
const AdminBro = require('admin-bro')
const AdminBroSequelize = require('@admin-bro/sequelize')
const { createContext, EXPECTED_OPTIONS_KEY } = require('dataloader-sequelize')
const bcrypt = require('bcrypt')

AdminBro.registerAdapter(AdminBroSequelize)
const AdminBroExpress = require('@admin-bro/express')
const invitationAdmin = require('./admin/invitation/invitation.admin')

const { jwtStrategy } = require('./middleware/passport')
const logger = require('./lib/utils/logger')

const db = require('./db/models/')
// Top level middleware that will run before any route specific middleware
const middleware = require('./middleware')
const api = require('./api/v1')

const typeDefs = mergeTypes(fileLoader(path.join(__dirname, './db/graphql/schemas')))
const resolvers = mergeResolvers(fileLoader(path.join(__dirname, './db/graphql/resolvers')))

const schemas = makeExecutableSchema({ typeDefs, resolvers })

const app = express()
app.server = http.createServer(app)

// Connect Socket.io to server, pass it to routes below.
const io = socketIo(app.server)

const HEALTH_CHECK_URL = '/api/health'

app.use(helmet())
// logger
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
} else {
  app.use(
    morgan('combined', {
      skip: (req, res) => req.url === HEALTH_CHECK_URL && res.statusCode === 200
    })
  )
}

app.use(compression())

// TODO: Update origin to production domain
// eslint-disable-next-line prefer-const
let origin = ['*']
if (process.env.NODE_ENV !== 'production') origin.push(process.env.MOCK_WEBCLIENT_HOST || 'http://localhost:3000')

const adminBro = new AdminBro({
  databases: [db],
  resources: [
    {
      resource: db.sequelize.models.Invitation,
      options: invitationAdmin
    }
  ],
  rootPath: '/admin'
})

const router = AdminBroExpress.buildAuthenticatedRouter(adminBro, {
  authenticate: async (email, password) => {
    const user = await db.User.findOne({
      where: {
        email: email.toLowerCase(),
        deactivatedAt: null
      },
      include: [
        {
          model: db.Role,
          as: 'role',
          attributes: ['id', 'type', 'createdAt', 'updatedAt']
        }
      ]
    })
    if (user) {
      const comparison = await bcrypt.compare(password, user.hash)
      if (comparison === true && ['admin', 'superadmin'].includes(user.role.type)) {
        return { ...user.toJSON(), roles: [user.role.type] }
      }
      return null
    }
    return null
  },
  cookiePassword: process.env.JWT_SECRET
})

app.use(adminBro.options.rootPath, router)

// 3rd party middleware
app.use(cors({ origin, credentials: true }))

app.use(bodyParser.json({ limit: process.env.BODY_PARSER_LIMIT || '300kb' }))
app.use(bodyParser.urlencoded({ extended: true }))

app.use(middleware({ db }))

const jsonErrorHandler = (err, _req, res, next) => {
  if (!err) return next()
  let error
  try {
    error = JSON.parse(err.message)
  } catch (e) {
    error = err
  }

  // FIXME: This silences test logs and only sends logs in prod when something goes 'bad'
  if (process.env.NODE_ENV !== 'test' && (!error.status || error.status === 400 || error.status >= 500)) {
    logger.info(`APP ERROR: ${error.message === 'RESOURCE NOT FOUND' ? 'Bad request' : err.stack}`)
  }

  return res.status(error.status || 400).send({
    error: {
      status: error.status || 400,
      message: error.message
    }
  })
}

// jwt authentication
app.use(passport.initialize())
passport.use('jwt', jwtStrategy)

// 50 MB
app.use(graphqlUploadExpress({ maxFileSize: 50 * 1024 * 1024, maxFiles: 10 }))

const apolloServer = new ApolloServer({
  uploads: false,
  schema: schemas,
  resolvers,
  context: async ({ req }) => {
    const context = createContext(db.sequelize)
    return {
      req,
      db,
      context,
      EXPECTED_OPTIONS_KEY
    }
  }
})

apolloServer.applyMiddleware({ app, cors: { origin } })

const initApp = async () => {
  try {
    app.use('/static', express.static(path.join(__dirname, '/static')))
    app.use('/', api({ db, io }))
    app.use(jsonErrorHandler)
    return app
  } catch (err) {
    logger.warn('err', err)
    return err
  }
}

const bindApp = async appToBind => {
  appToBind.server.listen(process.env.MOCK_SERVER_PORT, process.env.MOCK_SERVER_HOST, () => {
    logger.info('🚀 Server ready at http://localhost:3005')
    logger.info(`🚀 GraphQL Server ready at http://localhost:3005${apolloServer.graphqlPath}`)
  })
}

module.exports = {
  app,
  io,
  initApp,
  bindApp,
  jsonErrorHandler
}
