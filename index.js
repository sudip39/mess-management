const express = require('express'),
      app = express(),
      Item = require('./models/newitem'),
      ItemPerDay = require('./models/itemperday'),
      bodyParser = require('body-parser'),
      dailyBill = require('./models/dailybill'),
      timers = require("timers"),
      common = require('./common'),
      User = require("./models/user"),
      bcrypt = require('bcrypt'),
      orm = require('sequelize'),
      Supplier = require('./models/supplier'),
      Order = require('./models/order'),
      Worker = require('./models/worker'),
      Storage = require('./models/storage'),
      Extras = require('./models/extras'),
      MonthlyBill = require('./models/monthlybill');


var f=0;

// setup body parser
app.use(bodyParser.urlencoded({extended: true}));

// setup assets location
app.use(express.static(__dirname + "/public"));

app.get("/test",function(req,res){
    Item.findAll().then(row=>{
        res.send(row);
    })
})
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


app.get("/printOut", function(req,res) {
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


app.post("/finalize",isMessSake,function(req,res){
    res.redirect("/printOut");
})


app.post("/login",isMessSake, function(req, res){
    bcrypt.hash(req.body.newPassword, 10, function(err, hash) {
        // Store hash in your password DB.
        User.update(
            {password: hash },
            {where: {user: "Mess Sake"}}
        ).then(row => {
            if(row[0] == 0) {
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

    dailyBill.findAll().then(bills => {
        let tot = 0;
        for(i=0;i<bills.length;i++) {
            tot+=bills[i].dataValues.totalBill;
        }
        res.render("records.ejs",{record :bills, total:tot});
    })
})


app.get("/todaysBill", function(req, res) {
    let total=0;
    let itemTotal=0;
    var bilArr = [];

    ItemPerDay.findAll({
        attributes: ["itemId", "qty"]
    }).then(row => {
        for(let i = 0; i < row.length; i++) {
            itemTotal=0;
            Item.findAll({
                attributes: ["name", "price"],
                where: {id: row[i].dataValues.itemId}
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
            res.render("todaysBill.ejs", {items: bilArr, total: total});
        }, 200);
    });
});


app.get("/itemperday", function(req, res) {
    Item.findAll().then(rates => {
        res.render("itemPerDay.ejs", {rate: rates});
    });
});


app.post("/itemperday",isMessSake, function(req, res) {
    let Items = common.convertObjectToArray(req.body.item);
    let uItems = common.convertObjectToArray(req.body.uitem);
    let m=uItems.length;
    let k=Items.length;
    console.log(Items);
    console.log(uItems);
    for(let i=0;i<m;i++) {
        Items.push({
            itemId: uItems[i].itemId,
            qty: uItems[i].qty
        });
    }
    ItemPerDay.findAll().then(row => {
        if(row.length!=0) {
            for(let j=0;j<row.length;j++) {
                let rowDate = row[j].dataValues.createdAt;
                if(rowDate.toDateString() !==new Date().toDateString()) {
                    ItemPerDay.destroy();
                    break;
                }
            }
        }
    });

    timers.setTimeout(function(){
        for (let i = 0; i < Items.length; ++i) {
            if (Items[i]['qty'] != 0) {
                Storage.findAll(
                    { where: {itemId:parseInt(Items[i].itemId)} }
                ).then(s =>{
                    Storage.update(
                        {qty:s[0].dataValues.qty-Items[i]['qty']},
                        { where: {itemId:parseInt(Items[i]['itemId'])} }
                    );
                });
                ItemPerDay.findAll({
                    attributes: ["itemId", "qty","createdAt"],
                    where: { itemId: parseInt(Items[i]['itemId'])}

                }).then(row => {
                    if (row.length != 0) {
                        ItemPerDay.update(
                            {qty: parseFloat(Items[i]['qty']) + row[0].dataValues.qty},
                            {where: {itemId: parseInt(Items[i]['itemId'])}
                            });
                    } else {
                        ItemPerDay.create(Items[i]);
                    }

                });
            }
        }
        timers.setTimeout( function(){
            let total=0;
            let itemTotal=0;
            ItemPerDay.findAll({
                attributes: ["itemId", "qty"]
            }).then(row => {
                for(let i=0;i<row.length;i++)
                {
                    itemTotal=0;
                    Item.findAll({
                        attributes: ["name", "price"],
                        where: {id: row[i].dataValues.itemId}
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
            });},200);
        res.redirect('/');
    },4000);

});


app.get("/changerate", function(req,res) {
    Item.findAll().then(rows => {
        res.render("changeRate.ejs", {row: rows});
    });
});


app.post("/changerate",isMessSake,function(req,res) {
    let object = JSON.parse(req.body.rate.itemGroup);
    req.body.rate.itemId = object.itemId;
    req.body.rate.newPrice = parseFloat(req.body.rate.newPrice);
    Item.update(
        {price: parseFloat(req.body.rate.newPrice)},
        {where: {id : parseInt(req.body.rate.itemId)}}
    ).then(rows => {
        res.redirect('/');
    });
});


app.get("/worker",function(req,res){
    res.render("worker.ejs");
});


app.post("/worker",isMessSake,function(req,res){
    Worker.create(req.body.worker);
    res.redirect("/");
});


app.get("/wdetails",function(req,res){
    Worker.findAll().then(record => {
        res.render("wdetails.ejs",{record:record});
    })
});


app.get("/order",function(req,res) {
    Supplier.findAll().then(row => {
        Item.findAll().then(row1 => {
            res.render("order.ejs",{supplier: row,item: row1});
        });
    });
});


app.post("/order", isMessSake, function(req,res){
    let input = req.body;
    let items = input.item;
    for (let i = 0; i < items.length; ++i) {
        items[i].supplierId = input.supplierId;
        items[i].billNo = input.billNo;
        items[i].month = new Date().toDateString().split(" ")[1];

        Order.create(items[i]).then(row => {
            Storage.findAll(
                { where: {itemId:parseInt(items[i].itemId)} }
            ).then(s =>{
                Storage.update(
                    {qty:parseFloat(items[i].qty)+s[0].dataValues.qty},
                    { where: {itemId:parseInt(items[i].itemId)} }
                );
                let month= new Date().toDateString().split(" ")[1];
                let nameArr={name: [],total: [], sum: 0};

                Order.findAll({
                    where: {month: month},
                    group: ['supplierId'],
                    attributes: [[orm.fn('sum', orm.literal('qty * rate')), 'totalPrice']],
                    raw: true,
                    include: [{
                        model: Supplier,
                        attributes: ['name'],
                        required: true
                    }]
                }).then(r => {
                    for(let i = 0; i < r.length; i++) {
                        nameArr.name[i] = r[i]['supplier.name'];
                        nameArr.total[i] = r[i].totalPrice;
                        nameArr.sum += r[i].totalPrice;
                    }
                    Worker.findAll().then(row=>{
                        let workerSum = 0;
                        for(let i = 0; i < row.length; i++) {
                            workerSum+=row[i].salary;
                        }
                        Extras.findAll().then(row => {
                            let esum = 0;
                            for(let i = 0; i < row.length; i++) {
                                esum += row[i].bill;
                            }

                           let year = parseInt(new Date().toDateString().split(" ")[3]);
                           let bill=esum+workerSum+nameArr.sum;
                            MonthlyBill.update({
                                bill:bill},
                               { where:{ month: month } }

                            ).then(row=>{
                                console.log(row[0]);
                                if(row[0]==0)
                                {
                                    MonthlyBill.create({
                                     month:month,
                                     year:year,
                                     bill:bill

                                    });
                                }
                            })
                        });
                    });
                });
            });

        });

    }
    res.redirect('/');
});


app.get("/extras",function(req,res){
    res.render("extras.ejs");
});


app.post("/extras",isMessSake,function(req,res){
    Extras.create(req.body.extra);
    res.redirect('/');
});


app.get("/extradetails",function(req,res){
    Extras.findAll().then(extra =>{
        res.render("extradetails.ejs",{extra:extra});
    });
});


app.get("/actualbill",function(req,res){
    let month=new Date().toDateString().split(" ")[1];
    let nameArr={name: [],total: [], sum: 0};

    Order.findAll({
        where: {month: month},
        group: ['supplierId'],
        attributes: [[orm.fn('sum', orm.literal('qty * rate')), 'totalPrice']],
        raw: true,
        include: [{
            model: Supplier,
            attributes: ['name'],
            required: true
        }]
    }).then(r => {
        for(let i = 0; i < r.length; i++) {
            nameArr.name[i] = r[i]['supplier.name'];
            nameArr.total[i] = r[i].totalPrice;
            nameArr.sum += r[i].totalPrice;
        }
        Worker.findAll().then(row=>{
            let workerSum = 0;
            for(let i = 0; i < row.length; i++) {
                workerSum+=row[i].salary;
            }
            Extras.findAll().then(row => {
                let esum = 0;
                for(let i = 0; i < row.length; i++) {
                    esum += row[i].bill;
                }
                res.render('actualbill.ejs', {
                    bill: nameArr,
                    wsum: workerSum,
                    esum: esum
                });
            });
        });
    });
});


app.get("/storage",function(req,res){
    Storage.findAll({
        include: [{
            model: Item,
            required: true
        }]
    }).then(storage => {
        let items = {qty: [], name: [], qtype: []};
        for (let i = 0; i < storage.length; ++i) {
            items.qty[i] = storage[i].dataValues.qty;
            items.name[i] = storage[i].item.dataValues.name;
            items.qtype[i]= storage[i].item.dataValues.qtype;
        }
        res.render('storage.ejs', {items:items});
    });
})


app.get("/newsupplier",function(req,res){
    res.render("supplier.ejs");
});


app.post("/newsupplier",isMessSake,function(req,res){
    Supplier.create({"name": req.body.name});
    res.redirect("/");
});


app.get("/newitem", function(req, res) {
    res.render("newitem.ejs");

});


app.post("/newitem",isMessSake, function(req, res){

    req.body.rate.name = common.capitalizeAllWords(req.body.rate.name);
    Item.create(req.body.rate).then(row => {
        let s = {
            qty: 0,
            itemId: row.dataValues.id
        }
        Storage.create(s).then(row1 =>{
        })
    });
    res.redirect('/newitem');
});
function isHome(req,res,next){
    User.findAll().then(row =>{
        if(row.length==0)
            next();
        else {
            bcrypt.compare(req.body.password,
                           row[0].dataValues.password,
                           function(err, result) {
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

}
function isMessSake(req,res,next) {
    User.findAll().then(row =>{
        if(row.length==0)
            next();
        else {
            bcrypt.compare(req.body.password,
                           row[0].dataValues.password,
                           function(err, result) {
                if(result == true) {
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


// app.listen(app.get('port'), function() {
//     console.log('Node app is running on port', app.get('port'));
//   });


app.listen(8080,"localhost", function(){
    console.log("The Mess server has Started!!!");
});
