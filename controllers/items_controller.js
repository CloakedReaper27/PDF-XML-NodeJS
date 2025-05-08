const bodyParser = require('body-parser');
const puppeteer = require("puppeteer");
const ejs = require("ejs");
const fs = require("fs-extra");
require('dotenv').config();
const path = require('path');
const { connection  } = require("../config/db_config.js");
const { getKeyExpression } = require('../config/keychecker.js');
const{ authenticateToken } = require('../helper/helper.js');
const jwt = require('jsonwebtoken');
const multer = require('multer');

const encryptionKey = getKeyExpression();

// Get Items Page Start

const getItemsPage = (req, res) => {

    const sql = `SELECT 
        CAST(AES_DECRYPT(name, ${encryptionKey}) AS CHAR) AS name,
        CAST(AES_DECRYPT(description, ${encryptionKey}) AS CHAR) AS description,
        CAST(AES_DECRYPT(price, ${encryptionKey}) AS UNSIGNED) AS price,
        CAST(AES_DECRYPT(tax, ${encryptionKey}) AS UNSIGNED) AS tax,
        item_id
        FROM items_customer;`
    
    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        console.log('====================================');
        console.log("DB => Website result: ", result[0]);
        console.log('====================================');
        if (result.length == 0 || result === undefined ){
            console.log("No data")
        }
        return res.render(path.join(process.cwd(), 'secure', 'items.ejs'), { data: result});
    });
}

// Get Items Page End

// Create Item Start

const addItem = (req, res) => {

    const {
        ItemName,
        Beschreibung,
        Steuer,
        Preis } = req.body;

    const sql = `INSERT INTO items_customer (name, description, tax, price) VALUES (
      AES_ENCRYPT('${ItemName}', ${encryptionKey}),
      AES_ENCRYPT('${Beschreibung}', ${encryptionKey}),
      AES_ENCRYPT('${Steuer}', ${encryptionKey}),
      AES_ENCRYPT('${Preis}', ${encryptionKey})
    );`

    
    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return err;
        }
        console.log("====================================")
        console.log("Query result", result);
        console.log("====================================")
        console.log("Item Added!")
        console.log("====================================")
    });


    return res.status(200).json({ redirectUrl: '/items' })
}

// Create Item End

// Get Item Start

const fetchItemById = (id, callback) => {
    const sql = `SELECT 
        CAST(AES_DECRYPT(name, ${encryptionKey}) AS CHAR) AS name,
        CAST(AES_DECRYPT(description, ${encryptionKey}) AS CHAR) AS description,
        CAST(AES_DECRYPT(price, ${encryptionKey}) AS UNSIGNED) AS price,
        CAST(AES_DECRYPT(tax, ${encryptionKey}) AS UNSIGNED) AS tax,
        item_id
        FROM items_customer;`

    connection.query(sql, (err, result) => {
        if (err) return callback(err, null);
        callback(null, result[0]);
    });
};

const getAllItemData = (req, res) => {

    const id = req.params.id;

    fetchItemById(id, (err, item) => {
        if (err) {
            console.error("Error fetching item:", err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        res.status(200).json({ item });
    });
}

// GET Item End

// Edit Item Start

const editItem = (req, res) => {

    const {
        NewName,
        NewBeschreibung,
        NewSteuer,
        NewPreis,
        item_id,
        currentUrl } = req.body;

    const sql = `UPDATE items_customer SET
        name = AES_ENCRYPT('${NewName}', ${encryptionKey}),
        description = AES_ENCRYPT('${NewBeschreibung}', ${encryptionKey}),
        price = AES_ENCRYPT('${NewPreis}', ${encryptionKey}),
        tax = AES_ENCRYPT('${NewSteuer}', ${encryptionKey})
        WHERE item_id = ${item_id};`;

    
    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return err;
        }
        console.log("====================================")
        console.log("Query result", result);
        console.log("====================================")
        console.log("item Edited!")
        console.log("====================================")
    });


    return res.status(200).json({ redirectUrl: currentUrl })
}

// Edit Item End

// Delete Item Start

const deleteItem = (req, res) => {

    const {item_id} = req.body;

    const sql = `DELETE FROM items_customer WHERE item_id = ${item_id};`

    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return err;
        }
        console.log("====================================")
        console.log("Item Deleted!")
        console.log("====================================")
    });

    return res.status(200).json({ redirectUrl: '/items' })

}

// Delete Item End

module.exports={getItemsPage, getAllItemData, addItem, editItem, deleteItem}