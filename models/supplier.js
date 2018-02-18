const orm = require('sequelize');
const mess = require('./dbConnection/mess');


const Supplier = mess.define('supplier', {
    name: orm.STRING(200)
});

Supplier.sync();

module.exports = Supplier;
