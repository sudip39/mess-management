const orm = require('sequelize');
const Item = require('newitem');
const Supplier = require('supplier');

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

const Order = mess.define('order', {
    qty: orm.FLOAT,
    billNo: orm.INTEGER(11)
});
Order.hasMany(Item, {target: 'id'});
Order.hasMany(Supplier, {target: 'id'});
Order.sync();

module.exports = Order;
