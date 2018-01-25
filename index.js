const express = require('express');
const app = express();
const Rate = require('./models/rate');
const ItemPerDay = require('./models/itemperday');
const bodyParser = require('body-parser');
const dailyBill = require('./models/dailybill');

// setup body parser
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", function(req, res) {
    res.render("home.ejs");
})

app.get("/allrates", function(req, res) {
    Rate.findAll().then(rates => {
        res.render("allrate.ejs", {rate: rates});
    });
})

app.get("/print", function(req, res) {
    let total=0;
    let itemTotal=0;
    ItemPerDay.findAll({
        attributes: ["id", "qty"]
    }).then(row => 
        {
            itemTotal=0;
        Rate.findAll({
            attributes: ["name", "price"],
            where: {id: row[0].dataValues.id}
        }).then(row1 => {
            itemTotal=(row1[0].dataValues.price*row[0].dataValues.qty);
                total+=itemTotal;
            console.log(row1[0].dataValues,row[0].dataValues.qty," ",itemTotal)})
    })
    console.log("total bill=",total);
})

app.get("/itemperday", function(req, res) {
    Rate.findAll().then(rates => {
        res.render("itemPerDay.ejs", {rate: rates});
    });
})
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
                    })
                } else {
                    ItemPerDay.create(Items[i])
                }
            })
        }
    }
    //req.body.item.map(ItemPerday.ItemPerDay.create)
    //console.log(req.body.item);
    res.redirect('/');
})

app.get("/newrate", function(req, res) {
    res.render("rate.ejs");
})
app.post("/newrate", function(req, res){
    Rate.sync().then(() => {
        // insert row
        return Rate.create(req.body.rate);
    }).then(jane => {console.log(jane.toJSON());});
    res.redirect('/');
    // console.log(req.body);
})

app.listen(8080,"localhost", function(){
    console.log("The Mess server has Started!!!");
})