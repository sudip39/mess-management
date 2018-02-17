const orm = require('sequelize');
const Item = require('./newitem');

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

const ItemPerDay = mess.define('itemperday', {
    qty: orm.FLOAT
});
ItemPerDay.belongsTo(Item, {targetKey: 'id'});
ItemPerDay.sync();

module.exports = ItemPerDay;
