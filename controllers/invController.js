const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try{
      const classification_id = req.params.classificationId
      const data = await invModel.getInventoryByClassificationId(classification_id)
      const grid = await utilities.buildClassificationGrid(data)
      let nav = await utilities.getNav()
      const className = data[0].classification_name
      res.render("./inventory/classification", {
          title: className + " vehicles",
          nav,
          grid,
      })
  }
  catch(error){
    next(error)
  }
}

invCont.buildByInvId = async function (req, res, next) {
  try{
    const classification_id = req.params.classificationId
    const data1 = await invModel.getInventoryByInvId(classification_id)
    console.log(classification_id, data1)
    const details = await utilities.buildDetailsGrid(data1)
    let nav = await utilities.getNav()
    const className = data1[0].inv_make
    res.render("./inventory/vehicle-details", {
      title: className,
      nav,
      details,
    })
  }
  catch(error){
    next(error)
  }
}

invCont.buildManage = async function (req, res, next) {
    let nav = await utilities.getNav()
    const details = await utilities.buildClassificationList()
    res.render("./inventory/management", {
      title: "Vehicle Management",
      nav,
      details
    })
  }

  invCont.buildAddClass = async function (req, res, next) {
    let nav = await utilities.getNav()
    res.render("./inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
    })
  }

/* ****************************************
*  Process Registration
* *************************************** */

invCont.registerClass = async function (req, res) {
  let nav = await utilities.getNav()
  const { classification_name } = req.body

  const regResult = await invModel.registerClass(
    classification_name
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'ve registered ${classification_name}.`
    )
    res.status(201).render("inventory/management", {
      title: "Vehicle Management",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("inventory/management", {
      title: "Vehicle Management",
      nav,
    })
  }
}

invCont.buildAddInv = async function (req, res, next) {
  try{
  const classification_id = req.params.classificationId
    const data1 = await invModel.getInventoryByInvId(classification_id)
    console.log(classification_id, data1)
    const details = await utilities.buildClassificationList(data1)
  let nav = await utilities.getNav()
  res.render("./inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    errors: null,
    details
  })
  } catch(error){
    next(error)
  }
}

invCont.registerInv = async function (req, res) {
  const classification_id = req.params.classificationId
  const data1 = await invModel.getInventoryByInvId(classification_id)
  const details = await utilities.buildClassificationList(data1)
  let nav = await utilities.getNav()
  const { 
    inv_make, 
    inv_model, 
    inv_color, 
    inv_description, 
    inv_image, 
    inv_thumbnail, 
    inv_year, 
    inv_price, 
    inv_miles } = req.body

  const regResult = await invModel.registerInv(
    classification_id, 
    inv_make, 
    inv_model, 
    inv_color, 
    inv_description, 
    inv_image, 
    inv_thumbnail, 
    inv_year, 
    inv_price, 
    inv_miles
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'ve registered ${classification_id} ${inv_make} ${inv_model} ${inv_year}.`
    )
    const details = await utilities.buildClassificationList(data1)
    res.status(201).render("inventory/management", {
      title: "Vehicle Management",
      nav,
      details
    })
  } else {
    const details = await utilities.buildClassificationList(data1)
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("inventory/management", {
      title: "Vehicle Management",
      nav,
      details
    })
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  console.log("editInventoryView hit", req.params);
  const inv_id = parseInt(req.params.inv_id) 
  const itemDataArray = await invModel.getInventoryByInvId(inv_id)  
  const itemData = itemDataArray[0]; // Get first item
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  let nav = await utilities.getNav()
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    details:classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ***************************
*  Update Inventory Data
* ************************** */
invCont.updateInventory = async function (req, res, next) {
 let nav = await utilities.getNav()
 const {
   inv_id,
   inv_make,
   inv_model,
   inv_description,
   inv_image,
   inv_thumbnail,
   inv_price,
   inv_year,
   inv_miles,
   inv_color,
   classification_id,
 } = req.body
 const updateResult = await invModel.updateInventory(
   inv_id,  
   inv_make,
   inv_model,
   inv_description,
   inv_image,
   inv_thumbnail,
   inv_price,
   inv_year,
   inv_miles,
   inv_color,
   classification_id
 )

 if (updateResult) {
   const itemName = updateResult.inv_make + " " + updateResult.inv_model
   req.flash("notice", `The ${itemName} was successfully updated.`)
   res.redirect("/inv/")
 } else {
   const classificationSelect = await utilities.buildClassificationList(classification_id)
   const itemName = `${inv_make} ${inv_model}`
   req.flash("notice", "Sorry, the insert failed.")
   res.status(501).render("inventory/edit-inventory", {
   title: "Edit " + itemName,
   nav,
   classificationSelect: classificationSelect,
   errors: null,
   inv_id,
   inv_make,
   inv_model,
   inv_year,
   inv_description,
   inv_image,
   inv_thumbnail,
   inv_price,
   inv_miles,
   inv_color,
   classification_id
   })
 }
}

const jwt = require('jsonwebtoken');

invCont.checkUserType=async function(req, res, next) {
  const token = req.cookies.jwt
  if (!token) {
    return res.redirect("/account/login");
    // return next()
  }
  try {
    const verify = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    //The triple equal operator is used to compare two values to see if they are equal AND of the same type
    //it’s generally recommended to use the triple equal operator whenever possible, as it’s more reliable and less prone to errors
    if(verify.account_type!=="Admin" && verify.account_type!=="Employee"){
      return res.redirect("/account/login");
      // return next()
    }
    else{
        return next()
    }
  } catch (err) {
    console.log(err) 
    return res.redirect("/account/login");   
    
  }
}

module.exports = invCont