// 起動時実行(web, worker 共通)

/**
 * 環境設定
 */
require('dotenv').config();
var { debug, log, debuglog, systemMsg, setOptPrefix, processType } = require('./Log');
systemMsg('Starting server...');

/** 
 * プロセスライフを管理
 */
systemMsg('Loading ProcessLifeManager...');
let processLife = require('./ProcessLifeManager')


/**
 * MongoDBの接続
 */
systemMsg('Loading MongoDBManager...');
let mongoDBManager = require('./MongoDBManager');
mongoDBManager.init();
processLife.addEndListener(function (){
  return new Promise((resolve)=>{
    mongoDBManager.close();
    resolve();
  });
});


/**
 * 時間
 */
var moment = require('moment-timezone');
let TIME_FORMAT = "YYYY-MM-DD HH:mm:SS";
moment.locale('ja');
moment.tz.setDefault('Asia/Tokyo');

module.exports = {
  debug, 
  log, systemMsg, setOptPrefix, 
  moment,
  TIME_FORMAT,
}

