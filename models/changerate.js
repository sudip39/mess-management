const orm = require('sequelize');
const Rate = require('./rate');

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

const ChangeRate = mess.define('changerate', {
    date: orm.DATEONLY,
    oldPrice: orm.FLOAT,
    newPrice: orm.FLOAT
});
ChangeRate.belongsTo(Rate, {targeKey: 'id'});
ChangeRate.sync();

module.exports = ChangeRate;
