const orm = require('sequelize');

const mess = require('./dbConnection/mess');


const Worker = mess.define('worker', {
    name: orm.STRING(50),
    salary: orm.FLOAT
});
Worker.sync();

module.exports = Worker;
