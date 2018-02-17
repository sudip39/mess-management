const orm = require('sequelize');
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

const Monthlybill = mess.define('monthlyBill', {
    month: orm.STRING,
    year :orm.INTEGER,
    bill : orm.FLOAT
});
Monthlybill.sync();

module.exports = Monthlybill;