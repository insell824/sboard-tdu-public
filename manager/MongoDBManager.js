var { systemMsg } = require('./Log');

const Mongo = require('mongodb');
const MongoClient = Mongo.MongoClient;
var mClient;

let connectionString = process.env.MONGO_DB || '';

function MongoDBManager() {
  this.init = function (){

    mClient = new MongoClient(connectionString, { useNewUrlParser: (process.env.MONGO_DB_NEW_PARSER=='TRUE') });
    
    var event = require('events').EventEmitter;
    this.em = new event();

    new Promise((resolve, reject) => {
      systemMsg('Mongo DB connecting...');
      mClient.connect(err => {
        if (err) return reject(err);
        resolve();
      });
    }).then(() => {
      systemMsg('Mongo DB connected.');
      this.em.emit('connected', mClient);
    }).catch((reason) => {
      mClient = null;
      systemMsg("Mongo DB ERROR:");
      console.log(reason.message);
    });
  }

  this.addEventListener = function (event, listener) {
    this.em.on(event, listener);
  }
  this.getClient = function () {
    return mClient;
  }

  this.close = function(){
    if (mClient) {
      systemMsg('Closing Mongo DB Connection...');
      mClient.close();
      systemMsg("Closed Mongo DB Connection.");
    }
  }
}

var mongoDBManager = new MongoDBManager();
module.exports = mongoDBManager;