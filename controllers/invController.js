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


module.exports = invCont