const orm = require('sequelize'),
       passportLocalSequelize = require('passport-local-sequelize');

// start connection
const mess = new orm('sql12221611', 'sql12221611', 'Yq9k6Ak93r', {
    host: 'sql12.freemysqlhosting.net',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    operatorsAliases: false
});
// initialize model
var User = mess.define('user', {
    user: 
         {type:   orm.STRING,
          unique:true
            },
    password: orm.STRING,
    
});
 


User.sync();

module.exports = User;