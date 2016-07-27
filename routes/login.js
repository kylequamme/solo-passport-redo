//require express router and passport modules
var router = require('express').Router();
var passport = require('passport');
//route /login requests
router.get('/', function(req, res) {
  res.send(req.isAuthenticated());
});
router.post('/', passport.authenticate('local', {
  successRedirect: 'views/success.html',
  failureRedirect: 'views/failure.html'
}));

module.exports = router;
