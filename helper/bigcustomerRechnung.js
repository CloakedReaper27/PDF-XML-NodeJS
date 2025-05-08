const path = require('path')
const { connection } = require("../config/db_config.js");
const { getKeyExpression } = require('../config/keychecker.js');

const encryptionKey = getKeyExpression();

async function getAllLiefCusZusIDs(customer_id) {

    const sql = `
    SELECT 
        lieferschein_id, 
        CAST(AES_DECRYPT(lieferscheinNumber, ${encryptionKey}) AS UNSIGNED) AS lieferscheinNumber 
    FROM lieferschein 
    WHERE big_customers_customer_id = ?;

    SELECT 
    CAST(AES_DECRYPT(zuschlag_name, ${encryptionKey}) AS CHAR) AS zuschlag_name, 
    Zuschlag_id 
    FROM zuschlag_customer;`;

    return new Promise((resolve, reject) => {
        connection.query(sql, [customer_id], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                reject(err);
                return;
            }
            resolve(results);
        });
    });
}

async function getAllZuschlagData(zuschlagData) {

        let sql = ``

        zuschlagData.forEach((item, index) => {
            sql = `SELECT CAST(AES_DECRYPT(zuschlag_name, ${encryptionKey}) AS CHAR) AS zuschlag_name, 
            CAST(AES_DECRYPT(description, ${encryptionKey}) AS CHAR) AS description, 
            CAST(AES_DECRYPT(price, ${encryptionKey}) AS UNSIGNED) AS price, 
            CAST(AES_DECRYPT(tax , ${encryptionKey}) AS UNSIGNED) AS tax
            FROM zuschlag_customer 
            WHERE Zuschlag_id = ${zuschlagData[index]}`;
        });

        return new Promise((resolve, reject) => {
            connection.query(sql, (err, result) => {
                if (err) {
                    console.error('Database error:', err);
                    reject(err);
                    return;
                }
                
                console.log("====================================")
                console.log("Zuschlags fetched!")
                console.log("Result= ", result)
                console.log("====================================")

                if (!result || result.length === 0){
                    resolve();
                }
                resolve(result);
            });
        });
}


async function getAllitemIDs() {

    const sql = `SELECT 
    item_id,
    CAST(AES_DECRYPT(name, ${encryptionKey}) AS CHAR) AS name FROM items_customer;`;

    return new Promise((resolve, reject) => {
        connection.query(sql, (err, results) => {
            if (err) {
                console.error('Database error:', err);
                reject(err);
                return;
            }
            console.log('Items Fetched: ',results);
            console.log('===============================================')
            resolve(results);
        });
    });
}

async function getAllItemData(itemData) {

    let sql = ``

    itemData.forEach((item, index) => {
        sql = `SELECT CAST(AES_DECRYPT(name, ${encryptionKey}) AS CHAR) AS name, 
        CAST(AES_DECRYPT(description, ${encryptionKey}) AS CHAR) AS description, 
        CAST(AES_DECRYPT(price, ${encryptionKey}) AS CHAR) AS price, 
        CAST(AES_DECRYPT(tax , ${encryptionKey}) AS CHAR) AS tax
        FROM zuschlag_customer 
        WHERE item_id = ${itemData[index]}`;
    });

    return new Promise((resolve, reject) => {
        connection.query(sql, (err, result) => {
            if (err) {
                console.error('Database error:', err);
                reject(err);
                return;
            }
            
            console.log("====================================")
            console.log("Items fetched!")
            console.log("Result= ", result)
            console.log("====================================")

            if (!result || result.length === 0){
                resolve();
            }
            resolve(result);
        });
    });
}

function getAllItemsForLieferscheinRechnung (counterData) {

    return new Promise((resolve, reject) => {
        if (!counterData.length) return resolve([]);

        const itemIDs = counterData.map(item => item.items_customer_item_id);
        const placeholders = itemIDs.map(() => '?').join(',');

        const sql = `
            SELECT item_id,
                   CAST(AES_DECRYPT(name, ${encryptionKey}) AS CHAR) AS name,
                   CAST(AES_DECRYPT(description, ${encryptionKey}) AS CHAR) AS description,
                   CAST(AES_DECRYPT(price, ${encryptionKey}) AS UNSIGNED) AS price,
                   CAST(AES_DECRYPT(tax, ${encryptionKey}) AS UNSIGNED) AS tax
            FROM items_customer
            WHERE item_id IN (${placeholders});
        `;

        connection.query(sql, itemIDs, (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return reject(err);
            }
            console.log('==================================')
            console.log('Item fetching Result: ', result)
            console.log('==================================')
            resolve(result);
        });
    });
}
module.exports = {getAllLiefCusZusIDs, getAllZuschlagData, getAllItemsForLieferscheinRechnung, getAllItemData, getAllitemIDs}