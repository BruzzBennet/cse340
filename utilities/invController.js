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
    res.render("./inventory/management", {
      title: "Vehicle Management",
      nav,
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
  let nav = await utilities.getNav()
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


module.exports = invCont