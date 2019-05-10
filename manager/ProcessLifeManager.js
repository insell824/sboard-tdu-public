var {systemMsg} = require('./Log');

var attachedSignalListeners = false;
var originalProcessExit = process.exit;

function callCurrentProcessExit() {
  process.exit();
}

var endCount = 0;
function asyncOnExit(listener, attachSignalListeners = true) {
  // Ensures that process.exit is called in case of SIGINT and SIGTERM
  // Because we proxyfy process.exit we need to ensure that signals call it
  // By default signals do not call process.exit()
  if (attachSignalListeners && !attachedSignalListeners) {
    // Not attaching process.exit directly because we need the reference
    // to process.exit at the time of signal and not when attaching listener\

    // ctrl + c
    process.on('SIGINT', callCurrentProcessExit);

    // heroku
    process.on('SIGTERM', callCurrentProcessExit);

    // nodemon
    process.on('SIGUSR2', callCurrentProcessExit);
    
    attachedSignalListeners = true;
  }

  var previousProcessExit = process.exit;

  // Overwrite process.exit()
  process.exit = function (code) {
    if(endCount == 0){
      endCount++;
      systemMsg('Finishing processing....');
    }
    try {
      Promise.resolve(listener()).then(function () {
        previousProcessExit(code);
      }).catch(function (err) {
        console.error('async-on-exit: Listener returned an error:', err.stack);
        previousProcessExit(1);
      });
    } catch (err) {
      console.error('async-on-exit: Listener returned an error:', err.stack);
      previousProcessExit(1);
    }
  }
}

asyncOnExit.dispose = function () {
  process.exit = originalProcessExit;
  process.removeListener('SIGINT', callCurrentProcessExit);
  process.removeListener('SIGTERM', callCurrentProcessExit);
  attachedSignalListeners = false;
}

function ProcessLife(){
  this.addEndListener = function (listener) {
    asyncOnExit(listener,true);
  }
}



var processLife = new ProcessLife();
processLife.addEndListener(function () {
  return new Promise(function (resolve, reject) {
    systemMsg('Process completed.');
    resolve();
  });
});


// var finisingMsg = function (){
  
// }

// // process.once("exit", function () {
// //   finisingMsg();
// // });

// // for ctrl + c
// process.once('SIGINT', function () {
//   finisingMsg();
// });

// // for nodemon
// process.once('SIGUSR2', function () {
//   finisingMsg();
// });

// // for heroku 
// process.once('SIGTERM', function () {
//   finisingMsg();
// });

module.exports = processLife;

