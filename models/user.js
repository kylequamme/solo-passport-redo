//require postgres and bcrypt modules
var pg = require('pg');
var bcrypt = require('bcrypt');
//define SALT factor for bcrypt
var SALT_WORK_FACTOR = 10;
//postgres connection configuration
var pgConfig = {
  database: 'solo-passport-redo',
  port: 5432,
  max: 10, //max number of clients in the client pool
  idleTimeoutMillis: 30000 // how long a client is allowed to remain idle before being closed
};
//postgres client pool
var pgPool = new pg.Pool(pgConfig);
//postgres queries
function findByUsername(username, callback) {
  pgPool.connect(function(err, client, done){
    if (err) {
      done();
      return callback(err);
    }
    client.query('SELECT * FROM users WHERE username=$1;', [username], function(err, result){
      if (err) {
        done();
        return callback(err);
      }
      callback(null, result.rows[0]);
      done();
    });
  });
}
function create(username, password, callback) {
  bcrypt.hash(password, SALT_WORK_FACTOR, function(err, hash){
    pgPool.connect(function(err, client, done){
      if (err) {
        done();
        return callback(err);
      }
      client.query('INSERT INTO users (username, password) '
      +'VALUES ($1, $2) RETURNING id, username;',
      [username, hash],
      function(err, result){
        if (err) {
          done();
          return callback(err);
        }
        callback(null, result.rows[0]);
        done();
      });
    });
  });
}
function findAndComparePassword(username, candidatePassword, callback) {
    // candidatePassword is what we received on the request
    findByUsername(username, function(err, user) {
      if (err) {
        return callback(err);
      }
      if(!user) {
        return callback(null);
      }     
      bcrypt.compare(candidatePassword, user.password, function(err, isMatch){
        if(err){
          console.log(err);
          callback(err);
        } else {
          console.log('isMatch', isMatch);
          callback(null, isMatch, user);
        };
      });
    });
}
function findById(id, callback) {
  pgPool.connect(function(err, client, done){
    if (err) {
      done();
      return callback(err);
    }
    client.query('SELECT * FROM users WHERE id=$1;', [id], function(err, result){
      if (err) {
        done();
        return callback(err);
      }
      callback(null, result.rows[0]);
      done();
    });
  });
}
module.exports = {
  findByUsername: findByUsername,
  findById: findById,
  create: create,
  findAndComparePassword: findAndComparePassword
};
