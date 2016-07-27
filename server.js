//express
var express = require('express');
var session = require('express-session');
//needed for POST functions
var bodyParser = require('body-parser');
//needed for relative file paths
var path = require('path');
//authentication modules
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
//models
var User = require('./models/user');
//routes
var login = require('./routes/login');
var register = require('./routes/register');
//express
var app = express();
//setup express-session
app.use(session({
  secret:'fluffy',
  key: 'user',
  resave: true,
  saveUninitialized: false,
  cookie: {maxAge: 30 * 60 * 1000, secure: false}
}));
//setup passport
app.use(passport.initialize());
app.use(passport.session());
passport.use('local', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password'
}, function(username, password, done){
  User.findAndComparePassword(username, password, function(err, isMatch, user){
    if(err){
      return done(err);
    }
    if(isMatch){
      return done(null, user);
    }else{
      done(null, false);
    }
  });
}));
// converts user to user id
passport.serializeUser(function(user, done){
  done(null, user.id);
});
// converts user id to user
passport.deserializeUser(function(id, done){
  User.findById(id, function(err, user){
    if (err) {
      return done(err);
    }

    done(null, user);
  });
});
//body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
//static route to public directory
app.use(express.static('public'));
//route for bare URL
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'public/views/login.html'));
});
//authentication routes
app.use('/login', login);
app.use('/register', register);
//route checks if user is authenticated
app.use('/api', function(req, res, next){
  if (req.isAuthenticated()) {
    next();
  } else {
    res.sendStatus(403);
  }
});
//start server and log port to console
var port = process.env.PORT || 3000;
var server = app.listen(port, function () {
  console.log('Server listening on ' + server.address().port);
});
