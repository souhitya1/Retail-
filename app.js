require('dotenv').config();
const express = require("express");
const port = 8080;
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const ejsMate = require('ejs-mate');

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true })); // to read form data (login/signup forms)
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // for bootstrap/css/js files

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // session lasts 1 day
}));

app.use(flash());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));
  
app.get("/retail",(req,res)=>{
    res.render("home.ejs");
})
app.get("/retail/signup",(req,res)=>{
    res.render("signup.ejs");
})


app.listen(port,()=>{
    console.log("app is listening");
})
