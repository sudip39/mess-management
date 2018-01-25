const orm = require('sequelize')
const Rate = require('./rate');

// start connection
const mess = new orm('mess', 'root', 'sudip@123', {
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

const ItemPerDay = mess.define('itemperday', {
    qty: orm.FLOAT
})
ItemPerDay.belongsTo(Rate, {targetKey: 'id'});

module.exports = ItemPerDay;