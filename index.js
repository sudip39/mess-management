const express = require('express');
const app = express();
const Rate = require('./models/rate');
const ItemPerDay = require('./models/itemperday');
const bodyParser = require('body-parser');

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