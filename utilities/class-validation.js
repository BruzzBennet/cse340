const utilities = require(".")
  const { body, validationResult } = require("express-validator")
  const validate = {}
  const invModel = require("../models/inventory-model")

  /*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
  validate.registationRules = () => {
    return [
  
      // lastname is required and must be string
      body("classification_name")
        .trim()
        .escape()
        .notEmpty()
        .isAlpha()
        .withMessage("Please enter a valid class name.")
        .custom(async (classification_name) => {
          const emailExists = await invModel.checkExistingClass(classification_name)
          if (emailExists){
            throw new Error("Please provide a new class name.")
          }
        }),
    ]
  }

  
  /* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { classification_name} = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      errors,
      title: "Add Classification",
      nav,
      classification_name,
    })
    return
  }
  next()
}

  /* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */

  
  module.exports = validate