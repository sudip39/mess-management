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

const Worker = mess.define('worker', {
    name: orm.STRING(50),
    salary: orm.FLOAT
});

module.exports = Worker;
