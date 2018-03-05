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
      MonthlyBill = require('./models/monthlybill'),
      messConn = require('./models/dbConnection/mess.js');


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

app.get("/allsupplier",function(req,res){
    Supplier.findAll().then(rows=>{
        res.send(rows);
    })
})
app.get("/billsearch/:billno",function(req,res){
    let billNo=req.params.billno;
    messConn
        .query("select o.qty as qty, o.rate as rate,"+
               " s.name as supp, i.name as item"+
               " from orders as o, suppliers as s, items as i"+
               " where o.billno="+billNo+" and s.id=o.supplierId and o.itemId=i.id;")
        .then(rows => {
            console.log(rows);
            res.send(rows[0]);
        });
});

app.get("/suppliersearch/:sid/:month/:year", function (req, res) {
    let sid =parseInt( req.params.sid);
    let year = parseInt(req.params.year);
    let month = parseInt(req.params.month);
    messConn
        .query("select o.itemId, sum(o.qty) as total, o.rate, i.name" +
               " from orders as o, items as i" +
               " where o.itemId=i.id and o.supplierId="+sid+
               "  and year(o.createdAt)="+year+" and month(o.createdAt)="+month+
               " group by o.itemId, o.rate;")
        .then(rows => {
            console.log(rows);
            res.send(rows[0]);
        })
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

app.get("/dailybillrecords/:month/:year",function(req,res){
    let month =parseInt( req.params.month);
    let year = req.params.year;
    messConn.query("select * from dailyBills where month(createdAt)="+month+" and year(createdAt)="+year+";").then(bills => {
        let tot = 0;
        bills=JSON.stringify(bills);
        bills=JSON.parse(bills);
       // console.log(bills);
        for(i=0;i<bills[0].length;i++) {
            tot+=bills[0][i].totalBill;
        }


        res.send({
            record:bills,
            tot:tot
        })
    });
})
app.get("/dailybillrecords",function(req,res){
        res.render("records.ejs");
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
    if(typeof req.body.uitem !='undefined'){
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
    }
    ItemPerDay.findAll().then(row => {
        if(row.length!=0) {
            for(let j=0;j<row.length;j++) {
                let rowDate = row[j].dataValues.createdAt;
                if(rowDate.toDateString() !==new Date().toDateString()) {
                    ItemPerDay.destroy(
                       { where: {},
                        truncate: true
                       });

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
                        console.log(row);
                        if(row.length!=0) {
                            dailyBill.update({totalBill: total}, {where : {
                                date : row[0].dataValues.date
                            }}).then(ro =>{
                                console.log(ro);
                            });
                        } else {
                            dailyBill.create({
                                date:new Date().toDateString(),
                                totalBill: total
                            }).then(ro => {
                                console.log(ro);
                            });
                        }
                    });
                }, 200);
            });},200);
        res.redirect('/');
    },4000);

});
app.get("/supdetails",function(req,res){
    res.render("supDetails.ejs");
})

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
        if (input.datechecked == "true")
            items[i].createdAt = input.orderdate;

        Order.create(items[i]).then(row => {
            let up=0;
            if(input.orderdate != '')
            {
                let mo=parseInt(input.orderdate.split("-")[1]);
                let cmo = (new Date()).getMonth()+1;
               
                if(mo!=cmo)
                up=1;
            
            }
            if(up==0)
            {
                Storage.findAll(
                    { where: {itemId:parseInt(items[i].itemId)} }
                ).then(s =>{
                    Storage.update(
                        {qty:parseFloat(items[i].qty)+s[0].dataValues.qty},
                        { where: {itemId:parseInt(items[i].itemId)} }
                    );
                });
           }

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
app.get("/actualbill/:month/:year",function(req,res){
    console.log(req.params.month);
    let month=req.params.month;
    let year=req.params.year;
    let nameArr={name: [],total: [], sum: 0};


    messConn.query(
            "select sum(orders.qty*orders.rate) as totalPrice ,"+
            "suppliers.name from orders INNER JOIN suppliers on orders.supplierId=suppliers.id" +
            " where month(orders.createdAt)= " +"'"+month+"'"+
            " and year(orders.createdAt)="+year+
            " group by supplierId;"

    ).then(row=> {
         row=JSON.stringify(row);
        row=JSON.parse(row);
        let r=row[0];


        for(let i = 0; i < r.length; i++) {
            nameArr.name[i] = r[i]['name'];
            nameArr.total[i] = r[i].totalPrice;
            nameArr.sum += r[i].totalPrice;
        }

            Extras.findAll().then(row => {
                let esum = 0;
                for(let i = 0; i < row.length; i++) {
                    esum += row[i].bill;
                }
                res.send( {
                    bill: nameArr,
                    esum: esum
                });
            });

    });

})

app.get("/actualbill",function(req,res){

res.render('actualbill.ejs');
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


app.listen(8080,"localhost", function(){
    console.log("The Mess server has Started!!!");
});
