const express = require('express');
const router = express.Router();
const Mongo = require('mongodb');
const MongoClient = Mongo.MongoClient;
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const moment = require('moment');
const AuthListManager = require('../../middleware/AuthListManager');
const useragent = require('express-useragent');
moment.locale('ja');


var alMan = new AuthListManager();

// 認証用ルータ
router.use(function (req, res, next) {
  req.isAPI = false;
  req.isForcedLoad = false;
  req.userInfo = {
    isLogin: false,
    record: null
  }
  req.authExec = function (jsonResult) {
    return new Promise((allResolve, allReject) => {
      const mClient = req.mongo;
      var isCookie = false;
      var isSession = false;
      new Promise((resolve, reject) => {
        var token = "";
        if (req.cookies.sessionKey) {
          isCookie = true;
          token = req.cookies.sessionKey;
        }
        if (req.session.userSessionKey) {
          isSession = true;
          token = req.session.userSessionKey;
        }
        if (req.token) {
          token = req.token;
        }
        if (token == '') {
          if (req.isAPI) {
            jsonResult.statusCode = 403;
            jsonResult.statusTextJP = "認証が必要です";
            return reject(new Error("No token."));
          } else {
            return res.status(403).render('page/no_permission_guest', { message: "サインインが必要です" });
          }
        } else {
          return resolve(token);
        }
      }).then((token) => {
        return new Promise((resolve, reject) => {
          mClient.db("DocsMain").collection("Users").findOne({ 'tokens': { $elemMatch: { 'token': token } } }, function (err, row) {
            if (err) return reject(err);
            if (row == null) {
              if (req.isAPI) {
                jsonResult.statusCode = 403;
                jsonResult.statusTextJP = "無効なトークン";
                return reject(new Error("Token invalid."));
              } else {
                return res.status(403).render('page/no_permission_guest', { message: "サインインが必要です" });
              }
            } else {
              if(isCookie && !isSession){
                console.log('session登録');
                req.session.userSessionKey = token;
                mClient.db("DocsMain").collection("Users").updateOne({ _id : row._id, 'tokens.token': token   },
                { $set: { "tokens.$.lastUpdatedAt": new Date(moment.utc()), 'tokens.$.lastUpdatedIP': req.headers['x-forwarded-for']} },function(a,b){
                  console.log(b);
                  console.log("Updated");
                });
              }
              
              return resolve(row);
            }
          });
        });
      }).then((userRow) => {
        req.userInfo.isLogin = true;
        userRow.name = userRow.name + "様";
        req.userInfo.record = userRow;
      }).then(() => {
        allResolve();
      }).catch((e) => {
        allReject(e);
      });
    });
  }
  next();
});

// Login
router.get('/auth/signin', function (req, res, next) {
  res.render('auth/signin');
});



router.post('/auth/signin', function (req, res, next) {
  var result = req.jsonInit();
  const mClient = req.mongo;
  new Promise((resolve, reject) => {
    if (req.body.id && req.body.pass) {
      resolve();
    } else {
      result.statusCode = 400;
      result.statusTextJP = "不正なアクセス";
      reject(new Error("Invalid Parameter."));
    }
  }).then(() => {
    return new Promise((resolve, reject) => {
      mClient.db("DocsMain").collection("Users").findOne({ "username": req.body.id }, function (err, row) {
        if (err || !row) {
          row = {
            username: "xxx",
            passwordHash: '$2b$10$4iMYuMi5zWRFx1FZtbhj8Ozsk7F03JqsTjQ5lEHdnaNwbhcGRcuJa' // yyy
          }
          req.body.pass = "zzz";
        }
        if (row && !row.username) {
          result.statusCode = 500;
          result.statusTextJP = "このIDは使用できません";
          return reject(new Error("Sorry, you can't Login this id."));
        }
        bcrypt.compare(req.body.pass, row.passwordHash, function (err, res) {
          if (res) {
            // OK
            resolve(row);
          } else {
            // NG
            result.statusCode = 401;
            result.statusTextJP = "IDまたはパスワードが一致しません";
            return reject(new Error("ID or Password, invalid."));
          }
        });
      });
    });
  }).then((row) => {
    return new Promise((resolve, reject) => {
      var ua = useragent.parse(req.headers['user-agent']);
      req.session.userSessionKey = crypto.randomBytes(50).toString('hex');
      mClient.db("DocsMain").collection("Users").updateOne(
        { _id: row._id },
        {
          $push: {
            "tokens":
            {
              token: req.session.userSessionKey,
              createdAt: new Date(moment.utc()),
              createdIP: req.headers['x-forwarded-for'],
              lastUpdatedAt: new Date(moment.utc()),
              lastUpdatedIP: req.headers['x-forwarded-for'],
              userAgent: ua.source,
              browser: ua.browser,
              os: ua.os,
              platform: ua.platform
            }
          }
        },
        { upsert: false },
        function (err, _result) {
          if (err) throw reject(err);
          if (req.body.auto) {
            result.body = {
              sessionKey: req.session.userSessionKey
            }
          }
          return resolve();
        });
    });
  }).then(() => {
    result.status = true;
    result.statusCode = 200;
    result.statusText = 'Sign in.';
    result.statusTextJP = "サインインしました";
    res.json(result);
    return;
  }).catch((reason) => {
    // reject
    result.statusText = reason.message;
    res.json(result);
  });
});



router.get('/auth/signout', function (req, res, next) {
  const mClient = req.mongo;
  new Promise((resolve, reject) => {
    var token = "";
    if (req.cookies.sessionKey) {
      token = req.cookies.sessionKey;
    }
    if (req.session.sessionKey) {
      token = req.session.sessionKey;
      req.session.userSessionKey = null;
    }
    if (req.token) {
      token = req.token;
    }
    mClient.db("DocsMain").collection("Users").updateOne(
      { "tokens": { $elemMatch: { 'token': token } } },
      { $pull: { "tokens": { 'token': token } } },
      { upsert: false },
      function (err, _result) {
        if (err) throw reject(err);
        return resolve();
      });
  }).then(() => {
    res.redirect('/');
    return;
  }).catch((reason) => {
    res.redirect('/');
  });
});

router.delete('/auth/token/:token', function (req, res, next) {
  var result = req.jsonInit();
  const mClient = req.mongo;
  new Promise((resolve, reject) => {
    var token = req.params.token;
    mClient.db("DocsMain").collection("Users").updateOne(
      { "tokens": { $elemMatch: { 'token': token } } },
      { $pull: { "tokens": { 'token': token } } },
      { upsert: false },
      function (err, _result) {
        if (err) throw reject(err);
        return resolve();
      });
  }).then(() => {
    result.status = true;
    result.statusCode = 200;
    result.statusText = 'Sign out.';
    result.statusTextJP = "サインアウトしました";
    res.json(result);
    return;
  }).catch((reason) => {
    // reject
    result.statusText = reason.message;
    res.json(result);
  });

});
module.exports = router;
