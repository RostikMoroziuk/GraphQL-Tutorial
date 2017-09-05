const {ObjectID} = require('mongodb')

/* 
obj The previous object, which for a field on the root Query type is often not used.
-------
args The arguments provided to the field in the GraphQL query.
-------
context A value which is provided to every resolver and holds important contextual information 
like the currently logged in user, or access to a database.
*/

const resolvers = {
  Query: {
    async allLinks(root, data, { mongo: { Links } }) {
      return await Links.find({}).toArray()
    },
    async allUsers(root, data, { mongo: { Users } }) {
      return await Users.find({}).toArray()
    }
  },

  Mutation: {
    async createLink(root, data, { mongo: { Links }, user }) {
      const newLink = Object.assign({ postedById: user && user._id }, data)
      const response = await Links.insert(newLink)
      return Object.assign({ id: response.insertedIds[0]}, newLink)
    },
    async createUser(root, data, { mongo: { Users } }) {
      const newUser = {
        name: data.name,
        email: data.authProvider.email.email,
        password: data.authProvider.email.password,
      }
      const response = await Users.insert(newUser);
      return Object.assign({id: response.insertedIds[0]}, newUser)
    },
    async signinUser(root, data, { mongo: { Users } }) {
      const user = await Users.findOne({ email: data.email.email })
      if (data.email.password === user.password) {
        return { token: `token-${user.email}`, user}
      }
    },
    async createVote(root, data, { mongo: { Votes }, user }) {
      const newVote = {
        userId: user && user._id,
        linkId: new ObjectID(data.linkId),
      };
      const response = await Votes.insert(newVote);
      return Object.assign({ id: response.insertedIds[0] }, newVote);
    },
  },

  // Convert the "_id" field from MongoDB to "id" from the schema.
  // need for query
  Link: {
    id(root) {
      return root._id || root.id
    },
    async postedBy({ postedById }, data, { dataloaders: { userLoader } }) {
      return await userLoader.load(postedById);
    },
    async votes({ _id }, data, { mongo: { Votes } }) {
      return await Votes.find({ linkId: _id }).toArray();
    },
  },

  User: {
    id(root) {
      return root._id || root.id
    },
    async votes({ _id }, data, { mongo: { Votes } }) {
      return await Votes.find({ userId: _id }).toArray()
    },
  },

  Vote: {
    id(root) {
      return root._id || root.id
    },
    async user({ userId }, data, { dataloaders: { userLoader } }) {
      return await userLoader.load(userId)
    },
    async link({ linkId }, data, { mongo: { Links } }) {
      return await Links.findOne({ _id: linkId })
    },
  },
}

module.exports = resolvers

