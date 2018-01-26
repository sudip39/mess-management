const orm = require('sequelize')


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

const dailyBill = mess.define('dailyBill', {
    date: {
        type:orm.DATEONLY,

        },
    totalBill: orm.FLOAT
})
dailyBill.sync();
module.exports= dailyBill;