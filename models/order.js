const orm = require('sequelize');
const Item = require('./newitem');
const Supplier = require('./supplier');
const mess = require('./dbConnection/mess');


const Order = mess.define('order', {
    qty: orm.FLOAT,
    rate: orm.FLOAT,
    billNo: orm.INTEGER(11)
});
Order.belongsTo(Item, {target: 'id'});
Order.belongsTo(Supplier, {target: 'id'});
Order.sync();

module.exports = Order;
