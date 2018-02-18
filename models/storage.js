const orm = require('sequelize');
const Item = require('./newitem');

const mess = require('./dbConnection/mess');


const Storage = mess.define('storage', {
    qty: orm.FLOAT
});
Storage.belongsTo(Item, {target: 'id'});
Storage.sync();

module.exports = Storage;
