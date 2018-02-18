const orm = require('sequelize');
const Item = require('./newitem');

// start connection
const mess = require('./dbConnection/mess');


const ItemPerDay = mess.define('itemperday', {
    qty: orm.FLOAT
});
ItemPerDay.belongsTo(Item, {targetKey: 'id'});
ItemPerDay.sync();

module.exports = ItemPerDay;
