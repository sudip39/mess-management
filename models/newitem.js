const orm = require('sequelize');

// start connection
const mess = new orm('sql12221611', 'sql12221611', 'Yq9k6Ak93r', {
    host: 'sql12.freemysqlhosting.net',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    operatorsAliases: false
});
// initialize model
var Item = mess.define('item', {
    id: {
        type: orm.INTEGER(11),
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: orm.STRING(50)
    },
    common: {
        type: orm.INTEGER(11),
        defaultValue: 0
    },
    price: orm.FLOAT,
    qtype: orm.STRING(20)
});
Item.sync();

module.exports = Item;
