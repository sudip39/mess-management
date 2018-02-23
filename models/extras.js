const orm = require('sequelize')


// start connection
const mess = require('./dbConnection/mess');




/* This model will be used for recording the daily bill
 * It will have total bill per unique date
 */
const Extras = mess.define('extra', {
    
    reason:orm.STRING,
    bill: orm.FLOAT
});
Extras.sync();
module.exports = Extras;