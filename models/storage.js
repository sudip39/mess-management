const orm = require('sequelize');
const Item = require('./newitem');

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

const Storage = mess.define('order', {
    qty: orm.FLOAT
});
Storage.belongsTo(Item, {target: 'id'});
Storage.sync();

module.exports = Storage;
