const express = require('express');
const app = express();
const Rate = require('./models/rate');
const ItemPerDay = require('./models/itemperday');
const ChangeRate = require('./models/changerate.js');
const bodyParser = require('body-parser');
const dailyBill = require('./models/dailybill');
const timers = require("timers");
const common = require('./common')

// setup body parser
app.use(bodyParser.urlencoded({extended: true}));

// setup assets location
app.use(express.static(__dirname + "/public"));
//app.use(express.static('public'));

app.get("/", function(req, res) {
    res.render("home.ejs");
});

app.get("/allrates", function(req, res) {
    Rate.findAll().then(rates => {
        res.render("allrate.ejs", {rate: rates});
    });
});
app.get("/dailybillrecords",function(req,res){
        console.log("yes");
    dailyBill.findAll().then(bills => {
        res.render("records.ejs",{record :bills});
    })
})
app.post("/finalize",function(req,res) {
    let total=0;
    let itemTotal=0;
    ItemPerDay.findAll({
        attributes: ["id", "qty"]
    }).then(row => {
        for(let i=0;i<row.length;i++)
        {
            itemTotal=0;

            Rate.findAll({
                attributes: ["name", "price"],
                where: {id: row[i].dataValues.id}
            }).then(row1 => {
                itemTotal = (row1[0].dataValues.price*row[i].dataValues.qty);
                total += itemTotal;
                // console.log(row1[0].dataValues,row[0].dataValues.qty," ",itemTotal)})
            });
            // console.log("total bill=",total);
        }

        timers.setTimeout(() => {
            dailyBill.findAll({
                    where:{date : new Date().toDateString()}

            }).then(row => {
                if(row.length!=0) {
                    dailyBill.update({totalBill: total}, {where : {
                        id : row[0].dataValues.id
                    }});
                } else {
                    dailyBill.create({
                        date:new Date().toDateString(),
                        totalBill: total
                    }).then(row => {
                        console.log(row);
                    });
                }
            });
        }, 200);
    });
});

app.get("/print", function(req, res) {
    let total=0;
    let itemTotal=0;
    var bilArr = [];

    ItemPerDay.findAll({
        attributes: ["id", "qty"]
    }).then(row => {
        for(let i = 0; i < row.length; i++) {
            itemTotal=0;
            Rate.findAll({
                attributes: ["name", "price"],
                where: {id: row[i].dataValues.id}
            }).then(row1 => {
                itemTotal = (row1[0].dataValues.price*row[i].dataValues.qty);
                total += itemTotal;
                console.log("Bill Array:", bilArr);
                bilArr.push({
                    name: row1[0].dataValues.name,
                    rate : row1[0].dataValues.price,
                    qty : row[i].dataValues.qty,
                    price : itemTotal
                });
                // console.log(row1[0].dataValues,row[0].dataValues.qty," ",itemTotal)})
            });
            // console.log("total bill=",total);
        }
        timers.setTimeout(function () {
            // dailyBill.create({date:new Date().toDateString(),totalBill: total}).then(row=>
            //     {
            //         console.log(row);
            //     }
            // )
            res.render("dailyBill.ejs", {items: bilArr, total: total});
        }, 200);
    });
});

app.get("/itemperday", function(req, res) {
    Rate.findAll().then(rates => {
        res.render("itemPerDay.ejs", {rate: rates});
    });
});
app.post("/itemperday", function(req, res) {
    //console.log(ItemPerDay);
    let Items = req.body.item;
    for (let i = 0; i < Items.length; ++i) {
        if (Items[i]['qty'] != 0) {
            ItemPerDay.findAll({
                attributes: ["id", "qty"],
                where: { id: parseInt(Items[i]['id'])}
                // ItemPerDay.findAll({
                //     attributes: ["id", "qty"]
                // }).then(row => {
                //     Rate.findAll({
                //         attributes: ["name", "price"],
                //         where: {id: row[0].dataValues.id}
                //     }).then(row1 => {console.log(row1[0].dataValues,row[0].dataValues.qty)})
                // })
            }).then(row => {
                if(row.length != 0)
                {
                    ItemPerDay.update(
                        {qty: parseFloat(Items[i]['qty']) + row[0].dataValues.qty},
                        {where: {id: parseInt(Items[i]['id'])}
                        });
                } else {
                    ItemPerDay.create(Items[i]);
                }
            });
        }
    }
    //req.body.item.map(ItemPerday.ItemPerDay.create)
    //console.log(req.body.item);
    res.redirect('/');
});

app.get("/changerate", function(req,res) {
    Rate.findAll().then(rows => {
        console.log("Length =", rows.length);
        res.render("changeRate.ejs", {row: rows});
    });
});
app.post("/changerate",function(req,res) {
    // ChangeRate.create({
    //     id: req.body.id,
    //     oldPrice:
    // });
    Rate.update(
        {price: parseInt(req.body.rate.price)},
        {where: {id : parseInt(req.body.rate.id)}}
    ).then(rows => {
        res.redirect('/');
    });
});

app.get("/newrate", function(req, res) {
    res.render("rate.ejs");
});
app.post("/newrate", function(req, res){
    Rate.sync().then(() => {
        // insert row
        req.body.rate.name = common.capitalizeAllWords(req.body.rate.name);
        return Rate.create(req.body.rate);
    }).then(jane => {
        console.log(jane.toJSON());
    });
    res.redirect('/');
    // console.log(req.body);
});

app.listen(8080,"localhost", function(){
    console.log("The Mess server has Started!!!");
});
