const orm = require('sequelize');

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

const Supplier = mess.define('supplier', {
    name: orm.STRING(200)
});
Supplier.sync();

module.exports = Supplier;
