// Needed Resources 
const express = require("express")
const router = new express.Router() 
const router1 = new express.Router()
const invController = require("../controllers/invController")
const regValidate = require('../utilities/class-validation')
const utilities = require("../utilities")
// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
router.get("/detail/:classificationId", utilities.handleErrors(invController.buildByInvId));
router.get("/",utilities.handleErrors(invController.buildManage))
router.get("/class",utilities.handleErrors(invController.buildAddClass))
router.post(
    "/class",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(invController.registerClass)
  )
router.get("/inv",utilities.handleErrors(invController.buildAddInv))
router.post(
  "/inv",
  utilities.invRegistationRules(),
  utilities.checkInvData,
  utilities.handleErrors(invController.registerInv)
)

module.exports = router;