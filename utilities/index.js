const invModel = require("../models/inventory-model")
const Util = {}

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
