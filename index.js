const express = require('express');


const bodyParser = require('body-parser');

const mongoose = require('mongoose');

const cors = require('cors');

const helmet = require('helmet');

const path = require('path');




const admin1 = require('./routes/v1/admin/admin');
const user1 = require('./routes/v1/user/user');



const jwt = require('jsonwebtoken');



var useragent = require('express-useragent');


let app = express();
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '150mb'
  }));


  app.use(bodyParser.json({
    limit: '150mb'
  }));
 //SECURITY SETUP

app.use(cors());

app.use(helmet({crossOriginResourcePolicy:false}));
//CONSOLES THE USER INFORMATION AND API CALLS INTO THE
//SERVER ENVIRONMENT

app.use(useragent.express());

app.use((req, res, next) => {

var fullUrl = req.protocol + '://' + req.get('host') +
req.originalUrl;

console.log(fullUrl)

next();

})


//CONNECT TO MONGODB
mongoose.connect('mongodb+srv://ashishajce:ashish2005@cluster0.zjzfwcx.mongodb.net/hotelbook?retryWrites=true&w=majority&appName=Cluster0',

).then(() => {
    console.log('DATABASE CONNECTED SUCCESSFULLY');
}).catch((err) => {
    console.log('Error connecting to database');
    console.log(err);
});



var port = 5000;
app.use(admin1);  
app.use(user1);


const server = app.listen(port, function () {
    console.log("server running at port", port);
});
