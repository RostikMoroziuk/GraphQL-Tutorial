const Koa = require('koa')
const koaBody = require('koa-body')
const Router = require('koa-router')
const { graphqlKoa, graphiqlKoa } = require('apollo-server-koa')
// schama graphql
const Schema = require('./src/schema/index')
const connectMongo = require('./src/mongo-connector');
const authentication = require('./src/authentication')
const buildDataloaders = require('./src/dataloader');

// init app
const app = new Koa()
const router = new Router()
// build schema
const buildOptions = async (req, res) => {
  const mongo = await connectMongo()
  const user = await authentication(req, mongo.Users);
  return { 
    schema: Schema,
    context: { mongo, user, dataloaders: buildDataloaders(mongo), },
  }
}
// routes
router
  .post('/graphql', koaBody(), graphqlKoa(buildOptions))
  .get('/graphiql', graphiqlKoa({
    endpointURL: '/graphql',
    passHeader: `'Authorization': 'bearer token-test@mail.com'`,
  }))

app.use(router.routes())
app.use(router.allowedMethods())
app.listen(3000)
