const orm = require('sequelize');
const mess = require('./dbConnection/mess');

const Monthlybill = mess.define('monthlyBill', {
    month: orm.STRING,
    year :orm.INTEGER,
    bill : orm.FLOAT
});
Monthlybill.sync();

module.exports = Monthlybill;