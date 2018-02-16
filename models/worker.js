const orm = require('sequelize');

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

const Worker = mess.define('worker', {
    name: orm.STRING(50),
    salary: orm.FLOAT
});
Worker.sync();

module.exports = Worker;
