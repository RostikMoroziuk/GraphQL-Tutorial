const Koa = require('koa')
const koaBody = require('koa-body')
const Router = require('koa-router')
const { graphqlKoa, graphiqlKoa } = require('apollo-server-koa')
const cors = require('koa2-cors')
//---------
const {execute, subscribe} = require('graphql');
const {createServer} = require('http');
const {SubscriptionServer} = require('subscriptions-transport-ws');
//---------
// schama graphql
const schema = require('./src/schema/index')
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
    schema,
    context: { mongo, user, dataloaders: buildDataloaders(mongo), },
  }
}
// routes
const PORT = 3000;
router
  .post('/graphql', koaBody(), graphqlKoa(buildOptions))
  .get('/graphiql', graphiqlKoa({
    endpointURL: '/graphql',
    passHeader: `'Authorization': 'bearer token-test@mail.com'`,
    subscriptionsEndpoint: `ws://localhost:${PORT}/subscriptions`,
  }))

app.use(cors())
app.use(router.routes())
app.use(router.allowedMethods())
// app.listen(3000)
const server = createServer(app.callback(), (request, response) => {
  response.writeHead(404);
  response.end();
});
server.listen(PORT);

const subscriptionServer = SubscriptionServer.create(
  {
    schema,
    execute,
    subscribe,
  },
  {
    server,
    path: '/subscriptions',
  },
);

