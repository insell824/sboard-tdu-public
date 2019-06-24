var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var _data = {
    panePath:"/pane/index",
    data:{
      title: ""
    }
  }
  res.render('common/temp', _data);
});

router.get('/mlabschedule', function(req, res, next) {
  var _data = {
    panePath:"/pane/mlabschedule",
    data:{
      title: "残留申請"
    }
  }
  res.render('common/temp', _data);
});

router.get('/login', function(req, res, next) {
  res.render('signin');
});

router.get('/kiosk/test', function(req, res, next) {
  res.render('kiosk/test');
});

module.exports = router;
