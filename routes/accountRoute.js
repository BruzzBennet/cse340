// Needed Resources 
const regValidate = require('../utilities/account-validation')
const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")


router.get("/register",utilities.handleErrors(accountController.buildRegister))
router.post(
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
  )

router.get("/login",utilities.handleErrors(accountController.buildLogin))
// Process the login attempt
router.post(
  "/login",
    regValidate.loginRules(),
    regValidate.checkLogData,
    utilities.handleErrors(accountController.accountLogin)
)

function logout(req, res) {
  res.clearCookie("jwt")
  res.redirect("/")
}
router.get("/logout", logout)

router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildManagement))

// router.get("/",utilities.handleErrors(accountController.buildAccountAccess))

router.get("/edit",utilities.handleErrors(accountController.buildEditAccount))
router.post("/edit-data",utilities.handleErrors(accountController.editAccount))
router.post("/edit-password",utilities.handleErrors(accountController.editPassword))
module.exports = router;