const orm = require('sequelize')


// start connection
const mess = require('./dbConnection/mess');
/* This model will be used for recording the daily bill
 * It will have total bill per unique date
 */
const DailyBill = mess.define('dailyBill', {
    date: {
        type: orm.DATEONLY,
        primaryKey: true
    },
    totalBill: orm.FLOAT
});
DailyBill.sync();
module.exports = DailyBill;
