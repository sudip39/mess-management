const orm = require('sequelize'),
       passportLocalSequelize = require('passport-local-sequelize');

// start connection
const mess = require('./dbConnection/mess');


// initialize model
var User = mess.define('user', {
    user: {
        type: orm.STRING,
        unique: true
    },
    password: orm.STRING
});

User.sync();

module.exports = User;
