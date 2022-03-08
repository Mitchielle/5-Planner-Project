const express = require('express')
const mysql = require('mysql')
const bodyParser = require('body-parser')
const session = require('express-session')
const cookieParser = require('cookie-parser')
var mysqlApostrophe = require("mysql-apostrophe")
const path = require('path')
const app = express()
const PORT = process.env.PORT || 5000;
require('dotenv').config()


//Templating Engine
app.set('view engine', 'ejs')
app.set('views', __dirname + '/views');

//Parsing middleware
app.use(bodyParser.urlencoded({extended: false }))
app.use(bodyParser.json())

//cookie parser
app.use(cookieParser());

//user session
app.use(session({
    name: 'session', 
    secret: 'secret',
    resave: true, 
    saveUninitialized: true, 
    cookie: { maxAge: 60000 }
}));


//static files
app.use(express.static('public'))

//mysql apostrophe
app.use(mysqlApostrophe);

//Create connection
const pool = mysql.createPool({
    connectionLimit: 100,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

//Connect to MySQL
pool.getConnection((err, connection) => {
    if(err) throw err; //not connected
    console.log('Connected as ID ' + connection.threadId);
});


//importing routes
const goalroutes = require('./routes/goal')
const routes = require('./routes/user')
const startroutes = require('./routes/validate')


//handling routes request
app.use('/', startroutes)
app.use('/goals', goalroutes)
app.use('/user', routes)



app.listen(PORT, () => {
    console.log('Server is running on port ${PORT}.');
})

