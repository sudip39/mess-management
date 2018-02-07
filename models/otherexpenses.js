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

const OtherExpenses = mess.define('otherexpenses', {
    reason: orm.STRING(255),
    amount: orm.FLOAT
});
OtherExpenses.sync();

module.exports = OtherExpenses;
