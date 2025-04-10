const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      nav,
    })
  }
  
/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
    })
  }

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body
  
    // Hash the password before storing
    let hashedPassword
    try {
      // regular password and cost (salt is generated automatically)
      hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
      req.flash("notice", 'Sorry, there was an error processing the registration.')
      res.status(500).render("account/register", {
        title: "Registration",
        nav,
        errors: null,
      })
    }

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )
  
    if (regResult) {
      req.flash(
        "notice",
        `Congratulations, you\'re registered ${account_firstname}. Please log in.`
      )
      res.status(201).render("account/login", {
        title: "Login",
        nav,
      })
    } else {
      req.flash("notice", "Sorry, the registration failed.")
      res.status(501).render("account/register", {
        title: "Registration",
        nav,
      })
    }
  }

  /* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    //bcrypt.compare() function takes the password written and the hashed password in the database 
    //and then compares them to see if they match.
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      //if they match, remove the password data from the site to avoid it being read and then stolen
      delete accountData.account_password
      //then the JWT token is created. The accountData is inserted as the payload. The secret is read from the .env file. 
      //When the token is ready, it is stored into an "accessToken" variable. 
      //The token expiration must be set in seconds. The token will be given a life of 1 hour, thus, 60 seconds x 60 minutes = 3600 seconds. 
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      //checks to see if the development environment is "development" (meaning local for testing).
      if(process.env.NODE_ENV === 'development') {
        //If TRUE, a new cookie is created, named "jwt", the JWT token is stored in the cookie
        //and the options of "httpOnly: true" and "maxAge: 3600 * 1000" are set.
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        //If the environment is not "development", then the cookie is created with the same name and token 
        //but with the added option of "secure: true". This means that the cookie can only be passed through HTTPS and not HTTP. 
        //This is a security measure to ensure that the cookie is not passed through an unsecured connection.
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      //redirect to the "/account" page
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
      return
    }
  } catch (error) {
    // throw new Error('Access Forbidden')
    req.flash("notice", "An error occurred during login. Please try again.")
    res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
  
  }
}

async function buildManagement(req, res, next) {
  let nav = await utilities.getNav()
  try{
    res.render("./account/account-management", {
      title: "You're logged in!",
      nav,
    })
  }
  catch(error){
    next(error)
  }
}

async function buildEditAccount(req, res, next) {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      req.flash("notice", "Please log in.")
      return res.redirect("./login/")
    }
    const verify = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    // console.log(verify)
    // console.log(verify.account_id)
    let nav = await utilities.getNav()
    // const itemDataArray = await accountModel.getAccountById(verify.account_id)  
    // const itemData = itemDataArray[0]; // Get first item
    res.render("./account/update-view", {
        title: "Account Update",
        nav,
        errors: null,
        account_firstname:verify.account_firstname,
        account_lastname:verify.account_lastname,
        account_email:verify.account_email,
        account_id:verify.account_id,
    })
    }
    catch(error){
      next(error)
    }
}

async function editAccount(req, res, next){
    try {
      const token = req.cookies.jwt;
      if (!token) {
        req.flash("notice", "Please log in.")
        return res.redirect("./login/")
      }
      const verify = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
      let nav = await utilities.getNav()
      const { account_firstname, account_lastname, account_email, account_id } = req.body
      if(account_email!==verify.account_email || account_firstname!==verify.account_firstname || account_lastname!==verify.account_lastname)
      {
        if(account_email!==verify.account_email)
        {
          const accountData = await accountModel.getAccountByEmail(account_email)
          if (accountData.account_id!==account_id) {
            req.flash("notice", "Please use another email.")
            return res.status(400).render("account/edit", {
              title: "Account Update",
              nav,
              errors: null,
              account_firstname,
              account_lastname,
              account_email,
              account_id,
            })
          }
        }
        const updateResult = await accountModel.editAccountData(
           account_id,
           account_firstname,
           account_lastname,
           account_email,
         )
        if (updateResult){
          req.flash("notice",`Congratulations, info updated correctly.`)
          res.status(201).render("./account/account-management", {
            title: "You're logged in!",
            nav,
          })
        }else {
          req.flash("notice", "Sorry, the update failed.")
          res.status(501).render("./account/account-management", {
            title: "You're logged in!",
            nav,
          })
        }
      }
        
    }
    catch(error){
      next(error)
    }
}

async function editPassword(req, res, next) {
  const {account_password, account_id} = req.body
  let hashedPassword
        try {
          // regular password and cost (salt is generated automatically)
          hashedPassword = await bcrypt.hashSync(account_password, 10)
        } catch (error) {
          req.flash("notice", 'Sorry, there was an error processing the registration.')
          res.redirect("account/edit")
        }
      
        const regPassword = await accountModel.editPassword(
          account_id, 
          hashedPassword
        )

        let nav = await utilities.getNav()
        if (regPassword) {
          req.flash("notice",`Congratulations, Password changed correctly.`)
          res.status(201).render("./account/account-management", {
            title: "You're logged in!",
            nav,
          })
        } else {
          req.flash("notice", "Sorry, the registration failed.")
          res.status(501).render("./account/account-management", {
            title: "You're logged in!",
            nav,
          })
        }
  
}

  module.exports = { buildLogin, buildRegister, registerAccount,  accountLogin, buildManagement, buildEditAccount, editAccount, editPassword}