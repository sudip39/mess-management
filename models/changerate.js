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

const ChangeRate = mess.define('changerate', {
    oldPrice: orm.FLOAT,
    newPrice: orm.FLOAT
});
ChangeRate.belongsTo(Item, {targetKey: 'id'});
ChangeRate.sync();

module.exports = ChangeRate;
