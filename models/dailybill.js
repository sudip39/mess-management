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
const DailyBill = mess.define('dailyBill', {
    date: {
        type:orm.DATEONLY,
        primaryKey: true
    },
    totalBill: orm.FLOAT
});
DailyBill.sync();
module.exports = DailyBill;
