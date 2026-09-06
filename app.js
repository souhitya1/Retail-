require('dotenv').config();
const express = require("express");
const port = 8080;
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const ejsMate = require('ejs-mate');
const User = require("./model/user");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const Inventory = require("./model/inventory");
const {isLoggedIn} = require("./views/validation/isloggedin");
const Counter = require("./model/counter");

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.urlencoded({ extended: true })); // to read form data (login/signup forms)
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // session lasts 1 day
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));
  app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
})

  
app.get("/retail",(req,res)=>{
    res.render("home.ejs");
})
app.get("/retail/signup",(req,res)=>{
    res.render("signup.ejs");
})
app.post("/retail/signup",async(req,res,next)=>{
try{
  let {name,email,password,phone} = req.body;
  let newUser = new User({name,email,phone});
  let registeruser = await User.register(newUser, password);
  req.logIn(registeruser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success","signed up");
            res.redirect("/retail");
        })
    }catch(e){
        req.flash("error",e.message);
        res.redirect("/retail/signup");
    }
})

app.get("/retail/login",(req,res)=>{
  res.render("login.ejs");
})
app.post("/retail/login",passport.authenticate('local', {
        failureRedirect: '/retail/login',
        failureFlash: true
    }),(req,res)=>{
      res.redirect("/retail");
      console.log("logged in");
})
app.get("/logout", (req, res, next) => {
    req.logOut((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/retail");
    })
})
app.get("/retail/inventory",isLoggedIn,async(req,res)=>{
    const items = await Inventory.find({owner : req.user._id});
    res.render("inventory.ejs",{items});
})
app.get("/retail/inventory/new",(req,res)=>{
    res.render("inventorynew.ejs");
})
app.post("/retail/inventory",isLoggedIn,async(req,res)=>{
    try{
    let { productName, category, quantity, price, unit, lowStockThreshold } = req.body;
    let newitem = new Inventory({
        productName,
        category,
        quantity,
        price,
        unit,
        lowStockThreshold,
        owner: req.user._id
    });
    await newitem.save();
    req.flash("success","Inventory created");
    res.redirect("/retail/inventory");
}catch(err){
  req.flash("error", err.message);
  res.redirect("/retail/inventory/new");
}
})
app.get("/retail/inventory/:id/edit",async(req,res)=>{
  try{
    const {id} = req.params;
    const item = await Inventory.findOne({_id: id, owner: req.user._id});
    res.render("inventoryedit.ejs",{item});
  }catch(err){
    req.flash("error", err.message);
    res.redirect("/retail/inventory");
  }
})
app.post("/retail/inventory/:id/edit",async(req,res)=>{
    const {id} = req.params;
    let { productName, category, quantity, price, unit, lowStockThreshold } = req.body;
    const updated = await Inventory.findByIdAndUpdate({ _id: id, owner: req.user._id },
    { productName, category, quantity, price, unit, lowStockThreshold }
    )
    if (!updated) {
            req.flash("error", "Product not found or you don't have permission to edit it");
            return res.redirect("/retail/inventory");
        }
    res.redirect("/retail/inventory");
})
app.get("/retail/dwelltime",(req,res)=>{
    res.render("dwelltime.ejs");
})
app.get("/retail/counter",(req,res)=>{
    res.render("counter.ejs");
})
app.post("/retail/counter",isLoggedIn,async(req,res)=>{
  const{name,capacity,x1,y1,x2,y2} = req.body;
  const counter =  new Counter({
    name,
    capacity,
    x1,
    y1,
    x2,
    y2,
    owner: req.user._id
  });
  await counter.save();
   res.json({
            success: true,
            message: "Counter saved successfully",
            counter
        });
})

app.listen(port,()=>{
    console.log("app is listening");
})
