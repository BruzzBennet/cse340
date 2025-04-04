const invModel = require("../models/inventory-model")
const Util = {}
const { body, validationResult } = require("express-validator")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
    data = await invModel.getClassifications();
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid += '<div class="cars">'
      grid += '<div>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '</div>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}


Util.buildDetailsGrid = async function(data){
    let details;
    if(data.length > 0){
      details = '<div class="vehicle">';
      data.forEach(vehicle => {        
        let splitword = `${vehicle.inv_image}`;
        let split = splitword.split("/");
        let word = split[2];
        if (word == "vehicle"){
          thumbnail = vehicle.inv_image; 
        }
        else{
          thumbnail="/images/vehicles/" + split[2];
        }
        details += '<h1>' + vehicle.inv_make + '</h1>';
        details +='<div class="twogrid">';
        details +=  '<div class="vehicle-img"> <img src="' + thumbnail
        +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
        +' on CSE Motors" /> </div>'
        details += '<div class="vehicle-details">'
        details += '<h2><strong>Price: </strong>$' 
        + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</h2>'
        details += '<p><strong>Description: </strong>'+vehicle.inv_description+'<p>'
        details += '<p><strong>Model: </strong>'+vehicle.inv_model+'<p>'
        details += '<p><strong>Color: </strong>'+vehicle.inv_color+'<p>'
        details += '<p><strong>Miles: </strong>'+vehicle.inv_miles+'<p>'
        details += '</div></div>'
    })
    details+='</div>';
    } else { 
      details += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return details
}

Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}

Util.checkInvData = async (req, res, next) => {
  const { 
    classification_id, 
    inv_make, 
    inv_model, 
    inv_color, 
    inv_description, 
    inv_image, 
    inv_thumbnail, 
    inv_year, 
    inv_price, 
    inv_miles} = req.body
  let errors = []
  const classification_id_1 = req.params.classificationId
      const data1 = await invModel.getInventoryByInvId(classification_id_1)
      console.log(classification_id_1, data1)
      const details = await Util.buildClassificationList(data1)
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await Util.getNav()
    res.render("inventory/add-inventory", {
      errors,
      title: "Add Inventory",
      nav,
      details,
      classification_id, 
      inv_make, 
      inv_model, 
      inv_color, 
      inv_description, 
      inv_image, 
      inv_thumbnail, 
      inv_year, 
      inv_price, 
      inv_miles,
      details
    })
    return
  }
  next()
}

Util.checkUpdateData = async (req, res, next) => {
  const { 
    inv_id,
    classification_id, 
    inv_make, 
    inv_model, 
    inv_color, 
    inv_description, 
    inv_image, 
    inv_thumbnail, 
    inv_year, 
    inv_price, 
    inv_miles} = req.body
  let errors = []
  const classification_id_1 = req.params.inv_id
      const data1 = await invModel.getInventoryByInvId(classification_id_1)
      console.log(classification_id_1, data1)
      const details = await Util.buildClassificationList(data1)
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await Util.getNav()
    res.render("inventory/edit-inventory", {
      errors,
      title: "Edit Inventory",
      nav,
      details,
      inv_id,
      classification_id, 
      inv_make, 
      inv_model, 
      inv_color, 
      inv_description, 
      inv_image, 
      inv_thumbnail, 
      inv_year, 
      inv_price, 
      inv_miles,
      details
    })
    return
  }
  next()
}


Util.invRegistationRules = () => {
  return [

    body("classification_id")
      .trim()
      .escape()
      .notEmpty()
      .isNumeric()
      .withMessage("Please enter a valid class name."),

    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1})
      .withMessage("Please enter a valid make name."),

    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please enter a valid model name."),

    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .isAlpha()
      .withMessage("Please enter a valid color name."),

      body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please enter a valid description name."),

      body("inv_image")
      .trim()
      .escape()
      .isLength({ min: 2 })
      .withMessage("Please enter a valid image route."),

      body("inv_thumbnail")
      .trim()
      .escape()
      .isLength({ min: 2 })
      .withMessage("Please enter a valid thumbnail route."),

      body("inv_year")
      .trim()
      .escape()
      .notEmpty()
      .isNumeric()
      .withMessage("Please enter a valid year."),

      body("inv_price")
      .trim()
      .escape()
      .notEmpty()
      .isNumeric()
      .withMessage("Please enter a valid price."),

      body("inv_miles")
      .trim()
      .escape()
      .notEmpty()
      .isNumeric()
      .withMessage("Please enter valid miles.")
  ]
}

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
   jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
     if (err) {
      req.flash("Please log in")
      res.clearCookie("jwt")
      return res.redirect("/account/login")
     }
     res.locals.accountData = accountData
     res.locals.loggedin = 1
     next()
    })
  } else {
   next()
  }
 }

 /* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }