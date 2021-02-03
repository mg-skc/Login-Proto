if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}



const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const jwt = require ('jsonwebtoken')
const jwtSimple = require('jwt-simple')
const bodyParser = require("body-parser");
const initializePassport = require('./passport-config')
const cookieParser = require('cookie-parser')
//const { logIn, welcome, refresh } = require("./handlers")

//require mongoose-translates Node.js
const mongoose = require ("mongoose");
mongoose.set('useFindAndModify', false);
//returns object AFTER update was applied
mongoose.set('returnOriginal', false);

//call in schema models
var User = require ("./models/userDatabase.js");

//add path library
const path = require("path");

//declare port to connect t0
const port = 3000;

//connect to Atlas cluster
const mongoDB = "mongodb+srv://wastenotskilledkc:madANDal4life2021@wastenot1.sj0ff.mongodb.net/WasteNot1?retryWrites=true&w=majority";


//accessing the connect method of mongoose
//pass it the name of the DB cluster we have created
//mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true,}, (err, client) => {
    if(err) return console.error(err);
    console.log('Connected to database');
    });
const db = mongoose.connection;

//turns on the connection
db.on('error', console.error.bind(console, 'connection error:'));


//use the following middleware
app.use(
    //middleware for delivering static files
    express.static(
        //uses path library to take care of relative paths
        path.join(__dirname, 'public')));


// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended:true}));



//connect Mongoose - here  : HTML can do a post in the code bypassing the js file (per Jeff K)
//THIS WILL NEED TO BE CHANGED TO POSTS WITH DATABASE STORAGE FOR PRODUCTION!!!
//const users = []

//app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false}))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
app.use(express.json())
app.use (cookieParser())




//******WHERER I AM WITH CODING:   This is where I need to change
//console.log(document.getElementById('emailLog'))

// loginForm.onsubmit = async(e) => {
//     e.preventDefault();

//     let response = await fetch (/)
// }

//const formData = document.getElementById('loginForm')
loginForm.onsubmit = async (e) => {
    e.preventDefault();

    let response = await fetch('/login', {
      method: 'POST',
      body: new FormData(loginForm)
    });

    let result = await response.json();

    alert(result.message);
  };


const loginEmail = formData.get('emailLog')
const loginPassword = formData.get('passwordLog')
//waste not get email lookup
// SERVER SIDE FIND USER
app.get('/users/:'+loginEmail+`'`), (request, response) => {
    console.log(request.params.email);
    User.findOne({email: `${request.params.email}`}).exec((err, user) => {
        if (err) return console.error(err);
        response.send(user);
    })
};


// initializePassport(
//     passport,
//      email => user.find(user => user.email===email),
//      id => user.find(user => user.id===id)
// )


app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', {name: req.name})
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

//from Waste Not get user
// SERVER SIDE FIND USER
// app.get('/users/:email', (request, response) => {
//     console.log(request.params.email);
//     User.findOne({email: `${request.params.email}`}).exec((err, user) => {
//         if (err) return console.error(err);
//         response.send(user);
//     })
// });

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))
   


app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) =>{
try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    var newUser = {
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        phone: req.body.phone,
        user_role: 'None'
         }
   let user = new User(newUser)
    user.save(newUser)
    res.redirect('/login')
} catch{
    res.redirect('/register')
}
})


app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

//open up server, list on specific id and port
//ip address aka hostnames
app.listen(port, function(){
    console.log("Server is running at " + port)
});
