const path = require('path')
const { connection } = require("../config/db_config.js");
const { getKeyExpression } = require('../config/keychecker.js');
const { Console } = require('console');

const encryptionKey = getKeyExpression();

function dbPushItemstoLiefer(ItemData, customer_id, lieferID) {
    
    return new Promise((resolve, reject) => {

        let sql = ``
        ItemData.forEach((item) => {
            sql += `INSERT INTO items_counter (quantity, total, items_customer_item_id, lieferschein_lieferschein_id, lieferschein_big_customers_customer_id) VALUES (
            AES_ENCRYPT(${item.quantity}, ${encryptionKey}), 
            AES_ENCRYPT(${item.total}, ${encryptionKey}), 
            ${item.item_id},
            ${lieferID}, 
            ${customer_id});`;
        });

        connection.query(sql, (err, result) => {
            if (err) {
                console.error('Database error:', err);
                reject(err);
                return;
            }
            console.log("Query result", result);
            console.log("Items Added!")
            console.log("====================================")
            resolve();
        });
    });
    
};


function getLieferscheinID (lieferscheinNumber){

    return new Promise((resolve, reject) => {
        const sql = `SELECT lieferschein_id FROM lieferschein WHERE AES_ENCRYPT('${lieferscheinNumber}', ${encryptionKey}) = lieferschein.lieferscheinNumber;`
    
        connection.query(sql, (err, result) => {
            if (err) {
                console.error('Database error:', err);
                reject(err);
                return;
            }
            console.log("Query result", result);
            console.log("====================================")
            resolve(result);
        });
    });
}

function getAllLieferData (customer_id) {

    return new Promise((resolve, reject) => {
        const sql = `SELECT lieferschein_id,
        CAST(AES_DECRYPT(lieferscheinNumber, ${encryptionKey}) AS UNSIGNED) AS lieferscheinNumber,
        CAST(AES_DECRYPT(lieferscheinDate, ${encryptionKey}) AS DATE) AS lieferscheinDate,
        CAST(AES_DECRYPT(DeliveryDate, ${encryptionKey}) AS DATE) AS DeliveryDate,
        CAST(AES_DECRYPT(dueDate, ${encryptionKey}) AS DATE) AS dueDate,
        CAST(AES_DECRYPT(contractNo, ${encryptionKey}) AS UNSIGNED) AS contractNo,
        CAST(AES_DECRYPT(orderNo, ${encryptionKey}) AS UNSIGNED) AS orderNo,
        CAST(AES_DECRYPT(comments, ${encryptionKey}) AS CHAR) AS comments
        FROM lieferschein WHERE ${customer_id} = lieferschein.big_customers_customer_id;`
    
        connection.query(sql, (err, result) => {
            if (err) {
                console.error('Database error:', err);
                reject(err);
                return;
            }
            console.log("Query result", result);
            console.log("====================================")
            resolve(result);
        });
    });
}

function getAllItemsForLieferschein (counterData) {

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


module.exports = {dbPushItemstoLiefer, getLieferscheinID, getAllLieferData, getAllItemsForLieferschein}