const express = require('express');
const app = express();
const Item = require('./models/newitem');
const ItemPerDay = require('./models/itemperday');
const ChangeRate = require('./models/changerate');
const bodyParser = require('body-parser');
const dailyBill = require('./models/dailybill');
const timers = require("timers");
const common = require('./common');
const User = require("./models/user"),
      bcrypt = require('bcrypt');
const saltRounds = 10;

var f=0;

// setup body parser
app.use(bodyParser.urlencoded({extended: true}));

// setup assets location
app.use(express.static(__dirname + "/public"));


app.get("/", function(req, res) {
    if(f==0)
        res.render("home.ejs",{error: "", success: ""});
    else if(f==1) {
        res.render("home.ejs",{error: "", success: "Successfully added"});
    }
    else {
        res.render("home.ejs",{error: "Wrong details", success: ""});
    }
    f=0;
});
app.get("/login",function(req,res){
    res.render("login.ejs");
});
app.get("/printOut",function(req,res){
    let total=0;
    let itemTotal=0;
    var bilArr = [];

    ItemPerDay.findAll({
        attributes: ["id", "qty"]
    }).then(row => {
        for(let i = 0; i < row.length; i++) {
            itemTotal=0;
            Item.findAll({
                attributes: ["name", "price"],
                where: {id: row[i].dataValues.id}
            }).then(row1 => {
                itemTotal = (row1[0].dataValues.price*row[i].dataValues.qty);
                total += itemTotal;

                bilArr.push({
                    name: row1[0].dataValues.name,
                    rate : row1[0].dataValues.price,
                    qty : row[i].dataValues.qty,
                    price : itemTotal
                });
            });
        }
        timers.setTimeout(function () {
            res.render("printOut.ejs", {items: bilArr, total: total});
        }, 200);
    });
})

app.post("/login",isMessSake, function(req, res){
    bcrypt.hash(req.body.newPassword, saltRounds, function(err, hash) {
        // Store hash in your password DB.
        User.update(
            {password: hash },
            {where: {user: "Mess Sake"}}
        ).then(row =>{
            if(row[0]==0) {
                User.create({user:"Mess Sake",password:hash}).then(row1 =>{})
            }
        });
    });
    res.redirect("/");
});


app.get("/itemrates", function(req, res) {
    Item.findAll().then(rates => {
        res.render("itemRates.ejs", {rate: rates});
    });
});
app.get("/dailybillrecords",function(req,res){

    dailyBill.findAll({
        where:{
            month: new Date().toDateString().split(" ")[1]
        }
    }).then(bills => {
        let tot=0;
        console.log(bills);
        for(i=0;i<bills.length;i++) {
            tot+=bills[i].dataValues.totalBill;
        }

        res.render("records.ejs",{record :bills, total:tot});
    })
})
app.post("/finalize",isHome,function(req,res) {
    let total=0;
    let itemTotal=0;
    ItemPerDay.findAll({
        attributes: ["id", "qty"]
    }).then(row => {
        for(let i=0;i<row.length;i++)
            {
                itemTotal=0;
                Item.findAll({
                    attributes: ["name", "price"],
                    where: {id: row[i].dataValues.id}
                }).then(row1 => {
                    itemTotal = (row1[0].dataValues.price*row[i].dataValues.qty);
                    total += itemTotal;
                });
            }

        timers.setTimeout(() => {
            dailyBill.findAll({
                where:{date : new Date().toDateString()}
            }).then(row => {
                if(row.length!=0) {
                    dailyBill.update({totalBill: total}, {where : {
                        date : row[0].dataValues.date
                    }});
                } else {

                    dailyBill.create({
                        date:new Date().toDateString(),
                        month:
                        new Date().toDateString().split(" ")[1],
                        totalBill: total
                    }).then(row => {

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
            Item.findAll({
                attributes: ["name", "price"],
                where: {id: row[i].dataValues.id}
            }).then(row1 => {
                itemTotal = (row1[0].dataValues.price*row[i].dataValues.qty);
                total += itemTotal;

                bilArr.push({
                    name: row1[0].dataValues.name,
                    rate : row1[0].dataValues.price,
                    qty : row[i].dataValues.qty,
                    price : itemTotal
                });
            });
        }
        timers.setTimeout(function () {
            res.render("dailyBill.ejs", {items: bilArr, total: total});
        }, 200);
    });
});

app.get("/itemperday", function(req, res) {
    Item.findAll().then(rates => {
        res.render("itemPerDay.ejs", {rate: rates});
    });
});
app.post("/itemperday",isMessSake, function(req, res) {
    let Items = req.body.item;
    ItemPerDay.findAll().then(row => {
        if(row.length!=0) {
            for(let j=0;j<row.length;j++) {
                let rowDate = row[j].dataValues.createdAt;
                if(rowDate.toDateString() !==new Date().toDateString()) {
                    ItemPerDay.destroy();
                    break;
                }
            }
    });
    timers.setTimeout(function(){
        for (let i = 0; i < Items.length; ++i) {
            if (Items[i]['qty'] != 0) {
                ItemPerDay.findAll({
                    attributes: ["id", "qty","createdAt"],
                    where: { id: parseInt(Items[i]['id'])}

                }).then(row => {
                    if (row.length != 0) {
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
        res.redirect('/');
    },4000)
});

app.get("/changerate", function(req,res) {
    Item.findAll().then(rows => {
        res.render("changeRate.ejs", {row: rows});
    });
});

app.post("/changerate",isMessSake,function(req,res) {
    let object = JSON.parse(req.body.rate.itemGroup);
    req.body.rate.itemId = object.itemId;
    req.body.rate.oldPrice = object.oldPrice;
    req.body.rate.newPrice = parseFloat(req.body.rate.newPrice);
    ChangeRate.create(req.body.rate);
    Item.update(
        {price: parseFloat(req.body.rate.newPrice)},
        {where: {id : parseInt(req.body.rate.itemId)}}
    ).then(rows => {
        console.log("hello");
        res.redirect('/');
    });
});

app.get("/newitem", function(req, res) {
    res.render("newitem.ejs");
});
app.post("/newitem",isMessSake, function(req, res){
    Item.sync().then(() => {
        // insert row
        req.body.rate.name = common.capitalizeAllWords(req.body.rate.name);
        return Item.create(req.body.rate);
    }).then(jane => {});
    res.redirect('/');
});
function isHome(req,res,next){
    User.findAll().then(row =>{
        if(row.length==0)
            next();
        else {
            bcrypt.compare(req.body.password,row[0].dataValues.password, function(err, result) {
                if(result==true) {
                    f=1;
                    res.redirect('/printOut');
                    next();
                } else {
                    f=2;
                    res.redirect('/');
                }
            });
        }
    })
    // res.redirect('/printOut');
    // next();
}
function isMessSake(req,res,next) {
    User.findAll().then(row =>{
        if(row.length==0)
            next();
        else {
            bcrypt.compare(req.body.password,row[0].dataValues.password, function(err, result) {
                if(result==true) {
                    f=1;
                    next();
                } else {
                    f=2;
                    res.redirect('/');
                }
            });
        }
    })
}

app.listen(8080,"localhost", function(){
    console.log("The Mess server has Started!!!");
});
