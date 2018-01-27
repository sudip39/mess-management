const orm = require('sequelize');

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

// initialize model
var Rate = mess.define('rate', {
    id: {
        type: orm.INTEGER(11),
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: orm.STRING(50),
        unique: true
    },
    price: orm.FLOAT,
    qtype: orm.STRING(20)
});
Rate.sync();

module.exports = Rate;