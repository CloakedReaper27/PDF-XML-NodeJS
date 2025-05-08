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

// Get Services Page Start

const getServicesPage = (req, res) => {

    const sql = `SELECT 
        CAST(AES_DECRYPT(zuschlag_customer.zuschlag_name, ${encryptionKey}) AS CHAR) AS name,
        CAST(AES_DECRYPT(zuschlag_customer.description, ${encryptionKey}) AS CHAR) AS description,
        CAST(AES_DECRYPT(zuschlag_customer.price, ${encryptionKey}) AS UNSIGNED) AS price,
        CAST(AES_DECRYPT(zuschlag_customer.tax, ${encryptionKey}) AS UNSIGNED) AS tax,
        Zuschlag_id
        FROM zuschlag_customer;`
    
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
        return res.render(path.join(process.cwd(), 'secure', 'services.ejs'), { data: result});
    });
}

// Get Services Page End

// Create Service Start

const addService = (req, res) => {

    const {
        ZuschlagName,
        Beschreibung,
        Steuer,
        Preis } = req.body;

    const sql = `INSERT INTO zuschlag_customer (zuschlag_customer.zuschlag_name, zuschlag_customer.description, zuschlag_customer.price, zuschlag_customer.tax) VALUES (
      AES_ENCRYPT('${ZuschlagName}', ${encryptionKey}),
      AES_ENCRYPT('${Beschreibung}', ${encryptionKey}),
      AES_ENCRYPT('${Preis}', ${encryptionKey}),
      AES_ENCRYPT('${Steuer}', ${encryptionKey})
    );`

    
    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return err;
        }
        console.log("====================================")
        console.log("Query result", result);
        console.log("====================================")
        console.log("Service Added!")
        console.log("====================================")
    });


    return res.status(200).json({ redirectUrl: '/services' })
}

// Create Service End

// Get Service Start

const fetchServicerById = (id, callback) => {
    const sql = `SELECT 
        CAST(AES_DECRYPT(zuschlag_customer.zuschlag_name, ${encryptionKey}) AS CHAR) AS name,
        CAST(AES_DECRYPT(zuschlag_customer.description, ${encryptionKey}) AS CHAR) AS description,
        CAST(AES_DECRYPT(zuschlag_customer.price, ${encryptionKey}) AS UNSIGNED) AS price,
        CAST(AES_DECRYPT(zuschlag_customer.tax, ${encryptionKey}) AS UNSIGNED) AS tax,
        Zuschlag_id
        FROM zuschlag_customer;`

    connection.query(sql, (err, result) => {
        if (err) return callback(err, null);
        callback(null, result[0]);
    });
};

const getAllServiceData = (req, res) => {

    const id = req.params.id;

    fetchServicerById(id, (err, service) => {
        if (err) {
            console.error("Error fetching service:", err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        res.status(200).json({ service });
    });
}

// Get Service End

// Edit Service Start

const editService = (req, res) => {

    const {
        NewZuschlagName,
        NewBeschreibung,
        NewSteuer,
        NewPreis,
        service_id,
        currentUrl } = req.body;

    const sql = `UPDATE zuschlag_customer SET
        zuschlag_name = AES_ENCRYPT('${NewZuschlagName}', ${encryptionKey}),
        description = AES_ENCRYPT('${NewBeschreibung}', ${encryptionKey}),
        price = AES_ENCRYPT('${NewPreis}', ${encryptionKey}),
        tax = AES_ENCRYPT('${NewSteuer}', ${encryptionKey})
        WHERE zuschlag_customer.Zuschlag_id = ${service_id};`;

    
    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return err;
        }
        console.log("====================================")
        console.log("Query result", result);
        console.log("====================================")
        console.log("Service Edited!")
        console.log("====================================")
    });


    return res.status(200).json({ redirectUrl: currentUrl })
}

// Edit Service End

// Delete Service Start

const deleteService = (req, res) => {

    const {service_id} = req.body;

    const sql = `DELETE FROM zuschlag_customer WHERE Zuschlag_id = ${service_id};`

    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return err;
        }
        console.log("====================================")
        console.log("Service Deleted!")
        console.log("====================================")
    });

    return res.status(200).json({ redirectUrl: '/services' })

}

// Delete Service End

module.exports={getServicesPage, getAllServiceData, addService, editService, deleteService}