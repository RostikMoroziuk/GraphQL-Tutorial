const fs = require('fs')

const { Logger, MongoClient } = require('mongodb');

const MONGO_URL = 'mongodb://localhost:27017/hackernews';

const connectMongo = async () => {
  const db = await MongoClient.connect(MONGO_URL);
  let logCount = 0;
  fs.createWriteStream(__dirname + '/../dev/log')
  // Set the current logger function
  Logger.setCurrentLogger((msg, state) => {
    fs.appendFile(__dirname + '/../dev/log', `MONGO DB REQUEST ${++logCount}: ${msg}\n`, err => {
      if (err) {
        console.log(err)
      }
    })
  })
  // Set the current log level
  Logger.setLevel('debug')
  // Set what classes to log.
  Logger.filter('class', ['Cursor'])
  return {
    Links: db.collection('links'),
    Users: db.collection('users'),
    Votes: db.collection('votes'),    
  };
}

module.exports = connectMongo
