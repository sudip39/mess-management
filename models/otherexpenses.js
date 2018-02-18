const orm = require('sequelize');

const mess = require('./dbConnection/mess');

const OtherExpenses = mess.define('otherexpenses', {
    reason: orm.STRING(255),
    amount: orm.FLOAT
});
OtherExpenses.sync();

module.exports = OtherExpenses;
