//ALways load env variables immediately first
require('dotenv').config();


const fs = require('fs');


var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');

//security middleware - hemlet
const helmet = require('helmet');


const options = require("./knexfile.js");
const knex = require("knex")(options);
const logOriginalUrl = require("./middleware/logOriginalUrl"); 
const authorize = require("./middleware/authorization.js");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// Declare SwaggerUI
const swaggerUI = require('swagger-ui-express');
const swaggerDocument = require('./docs/openapi.json');




//USE EVERYTHING AFTER HERE 
//use CORS
app.use(cors());

//Use security helmet middware
app.use(helmet());

// POST & CORS - 
// Body parsing middleware - REQUIRED for req.body to work for POST/PUT requests
//    These MUST come before any routes that process request bodies.
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
    req.db = knex;
    next();
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.get("/profile", authorize, async function (req, res) {
  try {
    // Use the email from the JWT payload to fetch user details
    const user = await req.db('users').where({ email: req.user.email }).first();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Exclude sensitive info like password/hash
    const { id, email } = user;

    res.json({
      message: `Welcome, ${email}`,
      user: { id, email }
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});



/* GET knex page check */
app.get("/knex", function (req, res, next) {
    req.db
        .raw("SELECT VERSION()")
        .then((version) => console.log(version[0][0]))
        .catch((err) => {
            console.log(err);
            throw err;
        });

    res.send("Version Logged successfully");
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
