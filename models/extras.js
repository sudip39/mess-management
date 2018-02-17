const orm = require('sequelize')


// start connection
const mess = new orm('mess', 'root', 'root', {
    host: 'localhost',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    operatorsAliases: false
});


/* This model will be used for recording the daily bill
 * It will have total bill per unique date
 */
const Extras = mess.define('extra', {
    reason:orm.STRING,
    bill: orm.FLOAT
});
Extras.sync();
module.exports = Extras;