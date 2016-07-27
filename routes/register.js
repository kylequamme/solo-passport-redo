//require express router and passport modules
var router = require('express').Router();
var path = require('path');
//require the User model
var User = require('../models/user');
//route /register requests
router.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../public/views/register.html'));
});
router.post('/', function(req, res) {
  User.create(req.body.username, req.body.password, function(err) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      res.redirect('/');
    }
  });
});

module.exports = router;
