//const mysql = require('mysql');
const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');

dotenv.config({ part: './.env'});

const app = express();

// const db = mysql.createConnection({
//   host: process.env.DATABASE_HOST ,
//   user: process.env.DATABASE_USER ,
//   password: process.env.DATABASE_PASSWORD ,
//   database: process.env.DATABASE
// });

const db = require('./connect');

const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));
//console.log(__dirname);

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());

//app.set('view engine', 'hbs');

//define routes
//app.use('/', require('./routes/pages'))
app.use('/auth', require('./routes/auth'))

app.listen(3000, ()=>{
  console.log("Server on port 3000");
});

// db.connect(function(err) {
//   if (err) throw err;
//   console.log("Connected!");
// });

// app.use((error, req, res, next) => {
//   const message = `this is unexpectedError -> "${error.field}" `
//   console.log(message);
//   return res.status(500).send(message);
// })
