const path = require('path')
const { connection } = require("../config/db_config.js");
const { getKeyExpression } = require('../config/keychecker.js');

const encryptionKey = getKeyExpression();

async function dbInvoicePush(invoiceData, sumPosition, extra) {
    

    console.log("Date = ", invoiceData.RechnungDate);


    let sql = `INSERT INTO invoices (invoices.invoiceNumber, invoices.invoiceDate, invoices.deliveryDate, invoices.billingPeriodStart, invoices.billingPeriodEnd, invoices.dueDate, invoices.contractNo, invoices.orderNo, invoices.sumPositionN, invoices.zuschlagN, invoices.gesamtN, invoices.steue19S, invoices.gesamtB, invoices.Falligerbetrag, invoices.readorwrite, invoices.status) VALUES (
    AES_ENCRYPT(${invoiceData.RechnungNumber}, ${encryptionKey}), 
    AES_ENCRYPT('${invoiceData.RechnungDate}', ${encryptionKey}), 
    AES_ENCRYPT('${invoiceData.DeliveryDate}', ${encryptionKey}), 
    AES_ENCRYPT('${invoiceData.BillingPeriodStart}', ${encryptionKey}), 
    AES_ENCRYPT('${invoiceData.BillingPeriodEnd}', ${encryptionKey}), 
    AES_ENCRYPT('${invoiceData.DueDate}', ${encryptionKey}), 
    AES_ENCRYPT(${invoiceData.ContractNo}, ${encryptionKey}), 
    AES_ENCRYPT(${invoiceData.OrderNo}, ${encryptionKey}), 
    AES_ENCRYPT(${sumPosition}, ${encryptionKey}), 
    AES_ENCRYPT(${extra}, ${encryptionKey}), 
    AES_ENCRYPT(${(sumPosition + extra)}, ${encryptionKey}), 
    AES_ENCRYPT(${((sumPosition + extra)*(19/100))}, ${encryptionKey}), 
    AES_ENCRYPT(${((sumPosition + extra) + ((sumPosition + extra)*(19/100)))}, ${encryptionKey}), 
    AES_ENCRYPT(${((sumPosition + extra) + ((sumPosition + extra)*(19/100)))}, ${encryptionKey}), 
    AES_ENCRYPT(1, ${encryptionKey}), 
    AES_ENCRYPT('Pending', ${encryptionKey}));`

    sql += `SELECT invoices.invoice_id FROM invoices WHERE AES_DECRYPT(invoices.invoiceNumber, ${encryptionKey}) = ${invoiceData.RechnungNumber};`;

    return new Promise((resolve, reject) => {
        connection.query(sql, (err, result) => {
            if (err) {
                console.error('Database error:', err);
                reject(err);
                return;
            }

            console.log("Query result", result);
            if (result.length > 1 && result[1].length > 0) {
                const invoiceId = result[1][0].invoice_id;
                console.log("ID = ", invoiceId);
                resolve(invoiceId);
            } else {
                reject(new Error("Invoice ID not found"));
            }
        });
    });
    
};


async function dbCustomerZuschlagItemsPush (invoiceData, invoiceID, Checkzus) {



    return new Promise((resolve, reject) => {
        let sql = "";
        console.log("Invoice ID === ", invoiceID);
        console.log("test name =", invoiceData.CustomerName);
        console.log("testing zipcode", invoiceData.CustomerZipcode)

        invoiceData.items.forEach((item) => {
            sql += `INSERT INTO items (items.name, items.description, items.quantity, items.price, items.tax, items.total, items.Invoices_invoiceId) VALUES (AES_ENCRYPT('${item.name}', ${encryptionKey}), AES_ENCRYPT('${item.description}', ${encryptionKey}), AES_ENCRYPT(${item.quantity}, ${encryptionKey}), AES_ENCRYPT(${item.price}, ${encryptionKey}), AES_ENCRYPT(${item.tax}, ${encryptionKey}), AES_ENCRYPT(${item.total}, ${encryptionKey}), ${invoiceID});`;
        });

        if (Checkzus == 1){

            invoiceData.zusItems.forEach((item) => {
                sql += `INSERT INTO zuschlag 
                (zuschlag.description, zuschlag.tax, zuschlag.total, zuschlag.Invoices_invoiceId) VALUES (AES_ENCRYPT('${item.ZuschlagDescription}', ${encryptionKey}), AES_ENCRYPT(${item.ZuschlagTax}, ${encryptionKey}), AES_ENCRYPT(${item.ZuschlagTotal}, ${encryptionKey}), ${invoiceID});`;
            });
            
        }

        sql += `INSERT INTO customers (customers.name ,customers.email ,customers.address ,customers.phonenumber, customers.Invoices_invoiceId, customers.zipcode, customers.stadt, customers.country, customer.state) VALUES (AES_ENCRYPT('${invoiceData.CustomerName}', ${encryptionKey}), AES_ENCRYPT('${invoiceData.CustomerEmail}', ${encryptionKey}), AES_ENCRYPT('${invoiceData.CustomerAddress}', ${encryptionKey}), AES_ENCRYPT(${invoiceData.CustomerPhone},${encryptionKey}), ${invoiceID}, AES_ENCRYPT(${invoiceData.CustomerZipcode}, ${encryptionKey}), AES_ENCRYPT('${invoiceData.CustomerStadt}', ${encryptionKey}), AES_ENCRYPT('${invoiceData.CustomerCountry}', ${encryptionKey}), AES_ENCRYPT('${invoiceData.CustomerState}', ${encryptionKey}));`
        connection.query(sql, (err, result) => {
            if (err) {
                console.error('Database error:', err);
                reject(err);
                return;
            }
            console.log("Query result", result);
            resolve(result);
        });
    });

};

async function dbIDsearcher(invoiceNumber) {
    


    const sql = `SELECT invoices.invoice_id FROM invoices WHERE AES_DECRYPT(invoices.invoiceNumber, ${encryptionKey}) = ${invoiceNumber};`


    return new Promise((resolve, reject) => {
        connection.query(sql, (err, result) => {
            if (err) {
                console.error('Database error:', err);
                reject(err);
                return;
            }

            console.log("Query result", result, "\n result length =", result.length);
            if (result.length > 0) {
                const invoiceId = result[0].invoice_id;
                console.log("ID = ", invoiceId);
                resolve(invoiceId);
            } else {
                reject(new Error("Invoice ID not found"));
            }
        });
    });
    
};


async function dbTotalsearcher(invoiceID){

    const sql = `SELECT CAST(AES_DECRYPT(invoices.Falligerbetrag, ${encryptionKey}) AS DECIMAL(20,2)) AS Falligerbetrag FROM invoices WHERE invoices.invoice_id = ${invoiceID};`


    return new Promise((resolve, reject) => {
        connection.query(sql, (err, result) => {
            if (err) {
                console.error('Database error:', err);
                reject(err);
                return;
            }

            console.log("Query result", result, "\n result length =", result.length);
            if (result.length > 0) {
                const total = result[0].Falligerbetrag;
                console.log("ID = ", total);
                resolve(total);
            } else {
                reject(new Error("Invoice ID not found"));
            }
        });
    });
}

const saveInvoiceToDB = async (invoiceName, invoiceJSON) => {


    invoiceName = invoiceName.substring(0, invoiceName.indexOf('.'));

    console.log("uploaded invoice name = ", invoiceName)

    const sql = `INSERT INTO uploaded_invoices (invoice_name, invoice_data) VALUES (AES_ENCRYPT('${invoiceName}', ${encryptionKey}), AES_ENCRYPT('${JSON.stringify(invoiceJSON)}', ${encryptionKey}))`;  
    

    return new Promise((resolve, reject) => {
        connection.query(sql, (err, result) => {
            if (err) {
                console.error('Database error:', err);
                reject(err);
                return;
            }
    
            console.log("Query result", result);
            if (result.affectedRows > 0) { 
                resolve(1);
            } else {
                reject(new Error("Failed to insert invoice"));
            }
        });
    });
};

    

module.exports = {dbInvoicePush, dbCustomerZuschlagItemsPush, dbIDsearcher, dbTotalsearcher, saveInvoiceToDB};