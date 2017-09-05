// needs for caching responses from server
const DataLoader = require('dataloader');

// the batch function just needs to make a single call to MongoDB with all the given ids
async function batchUsers (Users, keys) {
  return await Users.find({ _id: { $in: keys } }).toArray();
}

module.exports = ({ Users }) =>({
  userLoader: new DataLoader(
    // 1 arg
    keys => batchUsers(Users, keys),
    // 2 arg
    {
      cacheKeyFn(key) {
        return key.toString()
      }
    },
  ),
});