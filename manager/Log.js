var debug = require('debug')('heroku-multi-dyno-test-nodejs2:server');
var moment = require('moment-timezone');
let TIME_FORMAT = "MM/DD HH:mm.ssZZ";

moment.locale('ja')
moment.tz.setDefault('Asia/Tokyo');


var black   = debug.enabled?'\u001b[30m':'';
var red     = debug.enabled?'\u001b[31m':'';
var green   = debug.enabled?'\u001b[32m':'';
var yellow  = debug.enabled?'\u001b[33m':'';
var blue    = debug.enabled?'\u001b[34m':'';
var magenta = debug.enabled?'\u001b[35m':'';
var cyan    = debug.enabled?'\u001b[36m':'';
var white   = debug.enabled?'\u001b[37m':'';
var reset   = debug.enabled?'\u001b[0m':'';

var prefix = '';
var setOptPrefix = (prefix_) =>{
  prefix = cyan+'['+prefix_+']';
}


var dyno = (process.env.DYNO)?cyan+'['+process.env.DYNO+']':cyan+'[LOCAL]';
var force = (process.env.FORCE_OUTPUT && process.env.FORCE_OUTPUT == 'TRUE');

var debuglog = (something) =>{
  if(debug.enabled || force){
    console.log(dyno+prefix+yellow+moment().format(TIME_FORMAT)+green, something, reset);
  }
}
var log = (something) =>{
  console.log(dyno+prefix+yellow+moment().format(TIME_FORMAT)+reset, something);
}
var systemMsg = (str) =>{
  console.log(dyno+prefix+yellow+moment().format(TIME_FORMAT)+blue, str, reset);
}

function ProcessType(){
  this.setProcessType = (t) =>{
    this.processType = (t.toUpperCase() == 'WORKER')?'WORKER':'WEB';
  }
}
var processType = new ProcessType();

module.exports = {
  debug, log, debuglog, systemMsg, setOptPrefix,
  processType
}
