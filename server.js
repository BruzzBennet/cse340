/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const session = require("express-session")
const pool = require('./database/')
const baseController = require("./controllers/baseController")
const inventoryController = require("./controllers/invController")
const inventoryRoute = require("./routes/inventoryRoute")
// const accountRoute = require("./routes/accountRoute")
const express = require("express")
const utilities = require("./utilities")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

/* ***********************
 * Middleware
 * ************************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(cookieParser())
app.use(utilities.checkJWTToken)

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root


/* ***********************
 * Routes
 *************************/
app.use(static)

/* ***********************
 * Index route
 *************************/
app.get("/", utilities.handleErrors(baseController.buildHome))


// Inventory routes
app.use("/inv", inventoryRoute)
app.get("/inv", utilities.handleErrors(inventoryController.buildByInvId))
app.get("/inv", utilities.handleErrors(inventoryController.buildByClassificationId))
app.get("/inv/detail", utilities.handleErrors(inventoryController.buildByInvId))
app.get("/inv/type", utilities.handleErrors(inventoryController.buildByClassificationId))
app.get("/inv/manage", utilities.handleErrors(inventoryController.buildManage))
app.get("/inv/class", utilities.handleErrors(inventoryController.buildAddClass))
app.get("/inv/inv", utilities.handleErrors(inventoryController.buildAddInv))

//Account Route
app.use("/account", require("./routes/accountRoute"))

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'})
})

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  if(err.status == 404){ message = err.message} else {message = 'Oh no! There was a crash. Maybe try a different route?'}
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  })
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
