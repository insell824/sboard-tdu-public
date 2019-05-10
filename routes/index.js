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
router.get('/login', function(req, res, next) {
  res.render('signin');
});

module.exports = router;
