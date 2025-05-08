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

const {pdfaConverter} = require("../helper/pdfconverter.js");
const {dbPushItemstoLiefer, getLieferscheinID, getAllLieferData, getAllItemsForLieferschein} = require("../helper/items2liefer.js");
const {getAllLiefCusZusIDs, getAllZuschlagData, getAllItemsForLieferscheinRechnung, getAllItemData, getAllitemIDs} = require("../helper/bigcustomerRechnung.js");

const encryptionKey = getKeyExpression();


// Get Customers Start

const GetCustomers = (req, res) => {

    let sql = `SELECT 
    CAST(AES_DECRYPT(big_customers.firstname, ${encryptionKey}) AS CHAR) AS firstname,
    CAST(AES_DECRYPT(big_customers.lastname, ${encryptionKey}) AS CHAR) AS lastname,
    CAST(AES_DECRYPT(big_customers.paused, ${encryptionKey}) AS UNSIGNED) AS paused,
    customer_id
    FROM big_customers;`

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
        return res.render(path.join(process.cwd(), 'secure', 'customers.ejs'), { data: result});
    });

};

// Get Customers End


// Add Customer Start

const addCustomer = (req, res) => {

    const {
        CustomerLastName,
        CustomerFirstName,
        CustomerEmail,
        CustomerPhone,
        CustomerAddress,
        CustomerZipcode,
        CustomerStadt,
        CustomerState,
        CustomerCountry,
        CustomerIBAN,
        CustomerBIC } = req.body;

    const sql = `INSERT INTO big_customers (big_customers.firstname, big_customers.lastname, big_customers.email, big_customers.address, big_customers.phonenumber, big_customers.zipcode, big_customers.country, big_customers.stadt, big_customers.state, big_customers.BIC, big_customers.IBAN, big_customers.paused) VALUES (
      AES_ENCRYPT('${CustomerFirstName}', ${encryptionKey}),
      AES_ENCRYPT('${CustomerLastName}', ${encryptionKey}),
      AES_ENCRYPT('${CustomerEmail}', ${encryptionKey}),
      AES_ENCRYPT('${CustomerAddress}', ${encryptionKey}),
      AES_ENCRYPT('${CustomerPhone}', ${encryptionKey}),
      AES_ENCRYPT('${CustomerZipcode}', ${encryptionKey}),
      AES_ENCRYPT('${CustomerCountry}', ${encryptionKey}),
      AES_ENCRYPT('${CustomerStadt}', ${encryptionKey}),
      AES_ENCRYPT('${CustomerState}', ${encryptionKey}),
      AES_ENCRYPT('${CustomerBIC}', ${encryptionKey}),
      AES_ENCRYPT('${CustomerIBAN}', ${encryptionKey}),
      AES_ENCRYPT(0, ${encryptionKey})
    );`

    
    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return err;
        }
        console.log("====================================")
        console.log("Query result", result);
        console.log("====================================")
        console.log("Customer Added!")
        console.log("====================================")
    });


    return res.status(200).json({ redirectUrl: '/customers' })
}

// Add Customer End

// Delete Customer Start

const deleteCustomer = (req, res) => {

    const {customer_id} = req.body;

    const sql = `DELETE FROM big_customers WHERE customer_id = ${customer_id};`

    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return err;
        }
        console.log("====================================")
        console.log("Customer Deleted!")
        console.log("====================================")
    });

    return res.status(200).json({ redirectUrl: '/customers' })

}

// Delete Customer End

// Pause Customer Start

const pauseCustomer = (req, res) => {

    const {customer_id, currentUrl} = req.body;

    const sql = `UPDATE big_customers SET paused = AES_ENCRYPT(${1}, ${encryptionKey}) WHERE big_customers.customer_id = ${customer_id};`

    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return err;
        }
        console.log("====================================")
        console.log("Customer Paused!")
        console.log("====================================")
    });

    return res.status(200).json({ redirectUrl: currentUrl })

}

// Pause Customer End

// Unpause Customer Start

const unpauseCustomer = (req, res) => {

    const {customer_id, currentUrl} = req.body;

    const sql = `UPDATE big_customers SET paused = AES_ENCRYPT(${0}, ${encryptionKey}) WHERE big_customers.customer_id = ${customer_id};`

    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return err;
        }
        console.log("====================================")
        console.log("Customer Unpaused!")
        console.log("====================================")
    });

    return res.status(200).json({ redirectUrl: currentUrl })

}

// Unpause Customer End

// Get all Customer Data Start

const fetchCustomerById = (id, callback) => {
    const sql = `SELECT
        customer_id,
        CAST(AES_DECRYPT(firstname, ${encryptionKey}) AS CHAR) AS firstname,
        CAST(AES_DECRYPT(lastname, ${encryptionKey}) AS CHAR) AS lastname,
        CAST(AES_DECRYPT(email, ${encryptionKey}) AS CHAR) AS email,
        CAST(AES_DECRYPT(address, ${encryptionKey}) AS CHAR) AS address,
        CAST(AES_DECRYPT(phonenumber, ${encryptionKey}) AS CHAR) AS phonenumber,
        CAST(AES_DECRYPT(zipcode, ${encryptionKey}) AS UNSIGNED) AS zipcode,
        CAST(AES_DECRYPT(country, ${encryptionKey}) AS CHAR) AS country,
        CAST(AES_DECRYPT(stadt, ${encryptionKey}) AS CHAR) AS stadt,
        CAST(AES_DECRYPT(state, ${encryptionKey}) AS CHAR) AS state,
        CAST(AES_DECRYPT(BIC, ${encryptionKey}) AS CHAR) AS BIC,
        CAST(AES_DECRYPT(IBAN, ${encryptionKey}) AS CHAR) AS IBAN,
        CAST(AES_DECRYPT(big_customers.paused, ${encryptionKey}) AS UNSIGNED) AS paused
        FROM big_customers WHERE customer_id = ${id};`;

    connection.query(sql, (err, result) => {
        if (err) return callback(err, null);
        callback(null, result[0]);
    });
};

const getAllCustomerData = (req, res) => {

    const id = req.params.id;

    fetchCustomerById(id, (err, customer) => {
        if (err) {
            console.error("Error fetching customer:", err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        res.status(200).json({ customer });
    });
}


// Get all Customer Data End

// Edit Customer Start

const editCustomer = (req, res) => {

    const {
        NewCustomerLastName,
        NewCustomerFirstName,
        NewCustomerEmail,
        NewCustomerPhone,
        NewCustomerAddress,
        NewCustomerZipcode,
        NewCustomerStadt,
        NewCustomerState,
        NewCustomerCountry,
        NewCustomerIBAN,
        NewCustomerBIC,
        EditedCustomerID,
        currentUrl } = req.body;

    const sql = `UPDATE big_customers SET
        firstname = AES_ENCRYPT('${NewCustomerFirstName}', ${encryptionKey}),
        lastname = AES_ENCRYPT('${NewCustomerLastName}', ${encryptionKey}),
        email = AES_ENCRYPT('${NewCustomerEmail}', ${encryptionKey}),
        address = AES_ENCRYPT('${NewCustomerAddress}', ${encryptionKey}),
        phonenumber = AES_ENCRYPT('${NewCustomerPhone}', ${encryptionKey}),
        zipcode = AES_ENCRYPT('${NewCustomerZipcode}', ${encryptionKey}),
        country = AES_ENCRYPT('${NewCustomerCountry}', ${encryptionKey}),
        stadt = AES_ENCRYPT('${NewCustomerStadt}', ${encryptionKey}),
        state = AES_ENCRYPT('${NewCustomerState}', ${encryptionKey}),
        BIC = AES_ENCRYPT('${NewCustomerBIC}', ${encryptionKey}),
        IBAN = AES_ENCRYPT('${NewCustomerIBAN}', ${encryptionKey})
        WHERE big_customers.customer_id = ${EditedCustomerID};`;

    
    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return err;
        }
        console.log("====================================")
        console.log("Query result", result);
        console.log("====================================")
        console.log("Customer Edited!")
        console.log("====================================")
    });


    return res.status(200).json({ redirectUrl: currentUrl })
}

// Edit Customer End

//Get Customer Page End

const getCustomerPage = async (req, res) => {

    const id = req.params.id;
    let data = 0;
    fetchCustomerById(id, (err, customer2) => {
        if (err) {
            console.error("Error fetching customer:", err);
            return res.status(500).send('Internal server error');
        }
        console.log(customer2)
        data = customer2;

    });
    lieferdata = await getAllLieferData(id);
    // Items = await getAllItemsForLieferschein(id, lieferdata)
    res.render('customerpage', { customer: data, lieferschein: lieferdata});
}

//Get Customer Page Start

// Generates Lieferschein PDF Start

const generateLieferscheinPDF = async (req, res) => {

    try {
        const { payload } = req.body;
        const { RechnungNumber, RechnungDate, DeliveryDate, DueDate, ContractNo, OrderNo, items, customer_id} = payload;

        let SumPosition = 0;
        let template = 0;
        let customerData = 0

        fetchCustomerById(customer_id, (err, customer) => {
            if (err) {
                console.error("Error fetching customer:", err);
                return res.status(500).send('Internal server error');
            }
            customerData = customer
        });

        items.forEach((item, index) => {
            SumPosition = SumPosition + parseInt(item.total);
        });

        
        console.log("Sum = ",SumPosition);

        template = await fs.readFile(path.join(process.cwd(), 'secure', "lieferschen.ejs"), "utf8");

        let renderedHtml = ejs.render(template, { 
            RechnungNumber, 
            RechnungDate, 
            DeliveryDate,  
            DueDate, 
            ContractNo, 
            OrderNo, 
            items,
            customer_id,
            SumPosition,
            customerData
        });

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(renderedHtml, { waitUntil: "networkidle0" });

        // Generate PDF/A file
        const pdfPath = path.join(process.cwd(), 'output', 'lieferfolder' ,`lieferschein_${RechnungNumber}.pdf`);
        await page.pdf({ path: pdfPath,
                format: "A4",
                printBackground: true,
                headerTemplate: "test",
                displayHeaderFooter: true,
            margin: {
                top: '20mm',
                bottom: '40mm',
                left: '10mm',
                right: '10mm'
            },
            footerTemplate: `
                <div style="width:100%; font-size:12px; padding:10px; box-sizing:border-box; border-top:1px solid #ccc; display:flex; justify-content:space-between;">
                    <div style="flex:1; padding-right:10px; padding-left:10px;">
                        <p style="margin:0; font-weight:bold;">Wäscherei Beck Inh. Majdi Amro</p>
                        <p style="margin:0;">ID: M. Amro<br>
                        USt-ID: DE309735791<br>
                        E-Mail: Info@WaeschereiBeck.de<br>
                        Web: www.WaeschereiBeck.de</p>
                    </div>
                    <div style="flex:1; padding-right:10px; padding-left:10px;">
                        <p style="margin:0; font-weight:bold;">Zahlungsdetails:</p>
                        <p style="margin:0;">Sparkasse Blabla<br>
                        Majdi Amro<br>
                        IBAN: DE38 5085 0150 0000 7733 28<br>
                        BIC: HELADEF1DAS</p>
                    </div>
                    <div style="flex:1;  padding-right:10px padding-left:10px;">
                        <p style="margin:0; font-weight:bold;">Kontakt:</p>
                        <p style="margin:0;">Wäscherei Beck<br>
                        E-Mail: Info@WaeschereiBeck.de<br>
                        Tel: 06151 4 66 17<br>
                        Fax: 06151 42 93 58</p>
                        
                    </div>
                </div>
            ` });

        await browser.close();


        // await pdfaConverter(`invoice_${RechnungNumber}.pdf`);
        const newPDFPath = `/output/lieferfolder/lieferschein_${RechnungNumber}.pdf`;

        res.status(200).json({ message: "PDF created successfully", filePath: newPDFPath });

    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).json({ error: "Failed to generate PDF" });
    
    }

}
// Generates Lieferschein PDF End

// Get Lieferschein Latest Number Start

const getLieferscheinNumber = async (req, res) => {

    const {customer_id} = req.body;

    try {
        const itemsData = await getAllitemIDs();
        const sql = `SELECT CAST(AES_DECRYPT(lieferscheinNumber, ${encryptionKey}) AS UNSIGNED) AS Number
                    FROM lieferschein
                    ORDER BY Number DESC
                    LIMIT 1;`

        connection.query(sql ,(err, result) => {
            if (err) {
                console.error('Database error:', err);
                return err;
            }
            console.log("====================================")
            console.log("Lieferschein Number fetched!")
            console.log("Result", result)
            console.log("====================================")
            if (result.length === 0){
                let result = [{number: 0}];
                res.status(200).json({ result, itemsData });
            }else {
                res.status(200).json({ result, itemsData });
            }
            
        });

    }catch(err){
        console.error("Error fetching Item data:", err);
        res.status(500).json({ error: "Something went wrong" });
    }
   

}

// Get Lieferschein Latest Number End

// Add Lieferschein Start

const createLieferschein = async (req, res) => {

    const {payload} = req.body;
    const {lieferscheinNumber, lieferscheinDate, lieferscheinDeliveryDate, lieferscheinDueDate, lieferscheinContractNo, lieferscheinOrderNo, ItemData, customer_id} = payload;

    const sql = `INSERT INTO lieferschein (lieferschein.lieferscheinNumber, lieferschein.lieferscheinDate, lieferschein.DeliveryDate, lieferschein.dueDate, lieferschein.contractNo, lieferschein.orderNo, lieferschein.comments, lieferschein.big_customers_customer_id) VALUES (
      AES_ENCRYPT('${lieferscheinNumber}', ${encryptionKey}),
      AES_ENCRYPT('${lieferscheinDate}', ${encryptionKey}),
      AES_ENCRYPT('${lieferscheinDeliveryDate}', ${encryptionKey}),
      AES_ENCRYPT('${lieferscheinDueDate}', ${encryptionKey}),
      AES_ENCRYPT('${lieferscheinContractNo}', ${encryptionKey}),
      AES_ENCRYPT('${lieferscheinOrderNo}', ${encryptionKey}),
      AES_ENCRYPT('${0}', ${encryptionKey}),
      ${customer_id});`

    
    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return err;
        }
        console.log("====================================")
        console.log("Query result", result);
        console.log("====================================")
        console.log("Lieferschein Added!")
        console.log("====================================")
    });

    const lieferID = await getLieferscheinID(lieferscheinNumber);
    // console.log("liefer ID = ",lieferID[0].lieferschein_id);
    await dbPushItemstoLiefer(ItemData, customer_id, lieferID[0].lieferschein_id);
    
    return res.status(200).json({ message: "Lieferschein created" });

}

// Add Lieferschein End

// Get Rechnung Last Number Start

const getRechnungNumber = async (req, res) => {

    const customer_id = req.body.customer_id;

    try {
        const lieferANDZusData =  await getAllLiefCusZusIDs(customer_id)
        const sql = `SELECT CAST(AES_DECRYPT(invoiceNumber, ${encryptionKey}) AS UNSIGNED) AS Number
        FROM invoices_customer
        ORDER BY Number DESC
        LIMIT 1;`
        
        console.log("Data from Liefer+Zus =", lieferANDZusData)
        connection.query(sql ,(err, result) => {
            if (err) {
                console.error('Database error:', err);
                return err;
            }
            console.log("====================================")
            console.log("Rechnung Number fetched!")
            console.log("====================================")

            if (!result || result.length === 0) {

                let result = [{number: 0}];
                res.status(200).json({ result, lieferANDZusData });
            }

        });

    }catch(err){
        console.error("Error fetching Lief/Zusch data:", err);
        res.status(500).json({ error: "Something went wrong" });
    }

}

// Get Rechnung Last Number End

// Get Lieferschein's items Start

const getLieferscheinItems = async (req, res) => {
    const { customer_id, lieferschein_id } = req.body;

    if (!customer_id || !lieferschein_id) {
        return res.status(400).json({ error: 'Missing customer_id or lieferschein_id' });
    }
    try {
        const itemsCounter = await new Promise((resolve, reject) => {
            const sql = `
                SELECT items_customer_item_id,
                       CAST(AES_DECRYPT(quantity, ${encryptionKey}) AS UNSIGNED) AS quantity,
                       CAST(AES_DECRYPT(total, ${encryptionKey}) AS UNSIGNED) AS total
                FROM items_counter
                WHERE lieferschein_big_customers_customer_id = ? AND lieferschein_lieferschein_id = ?;
            `;
            connection.query(sql, [customer_id, lieferschein_id], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });


        const detailedItems = await getAllItemsForLieferschein(itemsCounter);

        const mergedItems = itemsCounter.map(counterItem => {
            const matchingDetails = detailedItems.find(detail => detail.item_id === counterItem.items_customer_item_id);
            return {
                name: matchingDetails?.name || 'Unknown',
                quantity: counterItem.quantity,
                total: counterItem.total,
                description: matchingDetails?.description || '',
                price: matchingDetails?.price || 0,
                tax: matchingDetails?.tax || 0,
            };
        });

        return res.status(200).json({ items: mergedItems });

    } catch (err) {
        console.error('Error fetching lieferschein items:', err);
        return res.status(500).json({ error: 'Server error' });
    }
}

// Get Lieferschein's items End

// Get Zuschlag Details Start

const getZuschlags = (req, res) => {

    const { zuschlag_id } = req.body;
    const sql = `SELECT CAST(AES_DECRYPT(zuschlag_name, ${encryptionKey}) AS CHAR) AS zuschlag_name, 
    CAST(AES_DECRYPT(description, ${encryptionKey}) AS CHAR) AS description, 
    CAST(AES_DECRYPT(price, ${encryptionKey}) AS CHAR) AS price, 
    CAST(AES_DECRYPT(tax , ${encryptionKey}) AS CHAR) AS tax
    FROM zuschlag_customer 
    WHERE Zuschlag_id = ?`;
  
    connection.query(sql, [zuschlag_id], (err, result) => {
      if (err) {
        console.error("Zuschlag fetch error:", err);
        return res.status(500).json({ error: 'Database error' });
      }
      console.log("====================================")
      console.log("Zuschlags fetched!")
      console.log("Result= ", result)
      console.log("====================================")
      res.status(200).json({ data: result });
    });

}

// Get Zuschlag Details End

// Get Item Details Start

const getItems = (req, res) => {

    const { item_id } = req.body;
    const sql = `SELECT CAST(AES_DECRYPT(name, ${encryptionKey}) AS CHAR) AS name, 
    CAST(AES_DECRYPT(description, ${encryptionKey}) AS CHAR) AS description, 
    CAST(AES_DECRYPT(price, ${encryptionKey}) AS CHAR) AS price, 
    CAST(AES_DECRYPT(tax , ${encryptionKey}) AS CHAR) AS tax
    FROM items_customer 
    WHERE item_id = ?`;
  
    connection.query(sql, [item_id], (err, result) => {
      if (err) {
        console.error("Zuschlag fetch error:", err);
        return res.status(500).json({ error: 'Database error' });
      }
      console.log("====================================")
      console.log("Zuschlags fetched!")
      console.log("Result= ", result)
      console.log("====================================")
      res.status(200).json({ data: result });
    });

}

// Get Item Details End

// Generate Rechnung PDF Start

function getGermanDate() {
    const now = new Date();
    return now.toISOString().split('T')[0];
}

function getFirstAndLastDateOfMonth() {
    const now = new Date();

    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const format = (date) => date.toISOString().split('T')[0];

    return {
        BillingPeriodStart: format(firstDay),
        BillingPeriodEnd: format(lastDay)
    };
}


const fetchCustomerByIdAsync = (id) => {

    return new Promise((resolve, reject) => {
        const sql = `SELECT
            customer_id,
            CAST(AES_DECRYPT(firstname, ${encryptionKey}) AS CHAR) AS firstname,
            CAST(AES_DECRYPT(lastname, ${encryptionKey}) AS CHAR) AS lastname,
            CAST(AES_DECRYPT(email, ${encryptionKey}) AS CHAR) AS email,
            CAST(AES_DECRYPT(address, ${encryptionKey}) AS CHAR) AS address,
            CAST(AES_DECRYPT(phonenumber, ${encryptionKey}) AS CHAR) AS phonenumber,
            CAST(AES_DECRYPT(zipcode, ${encryptionKey}) AS CHAR) AS zipcode,
            CAST(AES_DECRYPT(country, ${encryptionKey}) AS CHAR) AS country,
            CAST(AES_DECRYPT(stadt, ${encryptionKey}) AS CHAR) AS stadt,
            CAST(AES_DECRYPT(state, ${encryptionKey}) AS CHAR) AS state,
            CAST(AES_DECRYPT(BIC, ${encryptionKey}) AS CHAR) AS BIC,
            CAST(AES_DECRYPT(IBAN, ${encryptionKey}) AS CHAR) AS IBAN,
            CAST(AES_DECRYPT(big_customers.paused, ${encryptionKey}) AS UNSIGNED) AS paused
            FROM big_customers WHERE customer_id = ${id};`;

        connection.query(sql, (err, result) => {
            if (err) return reject(err);
            resolve(result[0]);
        });
    });
};


const generateRechnungPDF = async (req, res) => {
    try {
        const { RealRechnungNumber, RechnungDeliveryDate, RechnungDueDate, RechnungContractNo, RechnungOrderNo, lieferschein_id, zuschlag_id, customer_id } = req.body;
        const { BillingPeriodStart, BillingPeriodEnd } = getFirstAndLastDateOfMonth();

        
        let zusItems = [];
        let SumPosition = 0;
        let Extra = 0;
        let ZuschlagData = [];
        let template = 0;

        const itemsCounter = await new Promise((resolve, reject) => {
            const sql = `
                SELECT items_customer_item_id,
                        CAST(AES_DECRYPT(quantity, ${encryptionKey}) AS UNSIGNED) AS quantity,
                        CAST(AES_DECRYPT(total, ${encryptionKey}) AS UNSIGNED) AS total
                FROM items_counter
                WHERE lieferschein_big_customers_customer_id = ? AND lieferschein_lieferschein_id = ?;
            `;
            connection.query(sql, [customer_id, lieferschein_id], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });


        const detailedItems = await getAllItemsForLieferscheinRechnung(itemsCounter);

        const LieferscheinItems = itemsCounter.map(counterItem => {
            const matchingDetails = detailedItems.find(detail => detail.item_id === counterItem.items_customer_item_id);
            return {
                name: matchingDetails?.name || 'Unknown',
                quantity: counterItem.quantity,
                total: counterItem.total,
                description: matchingDetails?.description || '',
                price: matchingDetails?.price || 0,
                tax: matchingDetails?.tax || 0,
            };
        });


        const customer = await fetchCustomerByIdAsync(customer_id);

        const CustomerData = {
            CustomerName: `${customer.firstname} ${customer.lastname}`,
            CustomerAddress: customer.address,
            CustomerZipcode: customer.zipcode,
            CustomerStadt: customer.stadt,
            CustomerState: customer.state,
            CustomerCountry: customer.country,
            CustomerEmail: customer.email,
            CustomerPhone: customer.phonenumber,
        };

        const hasEmptyValues = (arr) => {
            return !Array.isArray(arr) || arr.length === 0 || arr.some(val => typeof val !== 'number' || isNaN(val));
        };

        if (hasEmptyValues(zuschlag_id)){
            console.log("Zuschlag contains empty values.\n Routing to Zuschlag free template");
            template = await fs.readFile(path.join(process.cwd(), 'secure', "bigcustomerRechnung_nozus.ejs"), "utf8");

        }else{

            const ZuschlagData = await getAllZuschlagData(zuschlag_id);

            zusItems = ZuschlagData.map(zus => ({
                ZuschlagDescription: `${zus.zuschlag_name} | ${zus.description}`,
                ZuschlagTotal: Number(zus.price),
                ZuschlagTax: parseInt(zus.tax, 10)
            }));

            console.log("Zuschlag contains values.\n Routing to normal template");
            template = await fs.readFile(path.join(process.cwd(), 'secure', "bigcustomerRechnung.ejs"), "utf8");

            ZuschlagData.forEach((item, index) => {
                Extra = Extra + parseInt(item.price);
            });
        }

        
        LieferscheinItems.forEach((item, index) => {
            SumPosition = SumPosition + parseInt(item.total);
        });

        // get current Date
        const RealRechnungDate = getGermanDate();

        console.log("Sum = ",SumPosition);

        let renderedHtml = ejs.render(template, { 
            RealRechnungNumber, 
            RealRechnungDate, 
            RechnungDeliveryDate, 
            BillingPeriodStart, 
            BillingPeriodEnd, 
            RechnungDueDate, 
            RechnungContractNo, 
            RechnungOrderNo, 
            LieferscheinItems,
            ZuschlagData,
            SumPosition,
            Extra,
            CustomerData
        });

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(renderedHtml, { waitUntil: "networkidle0" });

        // Generate PDF/A file
        const pdfPath = path.join(process.cwd(), 'uploads', `Rechnung_${RealRechnungNumber}.pdf`);
        await page.pdf({ path: pdfPath,
             format: "A4",
              printBackground: true,
              headerTemplate: "test",
              displayHeaderFooter: true,
            margin: {
                top: '20mm',
                bottom: '40mm',
                left: '10mm',
                right: '10mm'
            },
            footerTemplate: `
            ` });

        await browser.close();

        const packagedData = {
            RechnungNumber: RealRechnungNumber,
            RechnungDate: RealRechnungDate,
            DeliveryDate: RechnungDeliveryDate, 
            BillingPeriodStart: BillingPeriodStart, 
            BillingPeriodEnd: BillingPeriodEnd, 
            DueDate: RechnungDueDate, 
            ContractNo: RechnungContractNo, 
            OrderNo: RechnungOrderNo, 
            items: LieferscheinItems,
            zusItems,
            SumPosition,
            Extra,
            CustomerName: `${customer.firstname} ${customer.lastname}`,
            CustomerAddress: customer.address,
            CustomerZipcode: customer.zipcode,
            CustomerStadt: customer.stadt,
            CustomerState: customer.state,
            CustomerCountry: customer.country,
            CustomerEmail: customer.email,
            CustomerPhone: customer.phonenumber,
        }

        // await pdfaConverter(`invoice_${RechnungNumber}.pdf`);
        pdfaConverter(`Rechnung_${RealRechnungNumber}.pdf`, packagedData);
        const newPDFPath = `/output/pdfs/Rechnung_${RealRechnungNumber}.pdf`;

        res.status(200).json({ message: "PDF created successfully", filePath: newPDFPath });

    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).json({ error: "Failed to generate PDF" });
    
    }
}

// Generate Rechnung PDF End

module.exports={GetCustomers, addCustomer, deleteCustomer, pauseCustomer, unpauseCustomer, getAllCustomerData, editCustomer, getCustomerPage, generateLieferscheinPDF, getLieferscheinNumber, createLieferschein, getRechnungNumber, getLieferscheinItems, getZuschlags, getItems, generateRechnungPDF}