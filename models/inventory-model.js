const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
    try {
      const data = await pool.query(
        `SELECT * FROM public.inventory AS i 
        JOIN public.classification AS c 
        ON i.classification_id = c.classification_id 
        WHERE i.classification_id = $1`,
        [classification_id]
      )
      if (data.rows.length === 0) {
        throw new Error(`No inventory found for inv_id: ${inv_id}`);
      }
      return data.rows
      
    } catch (error) {
      console.error("getclassificationsbyid error " + error)
    }
  }

  /* ***************************
 *  Get all inventory items by inv_id
 * ************************** */
  async function getInventoryByInvId(inv_id) {
    try {
      const data = await pool.query(
        `SELECT * FROM public.inventory WHERE inv_id = $1`,
        [inv_id]
      );
      if (data.rows.length === 0) {
        throw new Error(`No inventory found for inv_id: ${inv_id}`);
      }
      return data.rows;
    } catch (error) {
      console.error("getInventoryByInvId error:", error);
      throw error; // Ensure the error is thrown
    }
  }

/* *****************************
*   Register new account
* *************************** */
async function registerClass(classification_name){
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *"
    return await pool.query(sql, [classification_name])
  } catch (error) {
    return error.message
  }
}

async function checkExistingClass(classification_name){
  try {
    const sql = "SELECT * FROM classification WHERE classification_name = $1"
    const email = await pool.query(sql, [classification_name])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}

async function registerInv(
  classification_id, 
  inv_make, 
  inv_model, 
  inv_color, 
  inv_description, 
  inv_image, 
  inv_thumbnail, 
  inv_year, 
  inv_price, 
  inv_miles){
  try {
    const sql = "INSERT INTO inventory (classification_id, inv_make, inv_model, inv_color, inv_description, inv_image, inv_thumbnail, inv_year, inv_price, inv_miles) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *"
    return await pool.query(sql, [classification_id, inv_make, inv_model, inv_color, inv_description, inv_image, inv_thumbnail, inv_year, inv_price, inv_miles])
  } catch (error) {
    return error.message
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
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
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
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
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

module.exports = {getClassifications, getInventoryByClassificationId, getInventoryByInvId, registerClass, registerInv, checkExistingClass, updateInventory};