const bodyParser = require('body-parser');
const puppeteer = require("puppeteer");
const ejs = require("ejs");
const fs = require("fs-extra");
require('dotenv').config();
const path = require('path');
const { connection } = require("../config/db_config.js");
const { getKeyExpression } = require('../config/keychecker.js');
const{ authenticateToken } = require('../helper/helper.js');
const jwt = require('jsonwebtoken');
const multer = require('multer');

const {pdfaConverter} = require("../helper/pdfconverter.js");
const {dbInvoicePush, dbCustomerZuschlagItemsPush, dbIDsearcher, dbTotalsearcher, saveInvoiceToDB} = require("../helper/dbpushinvoice.js");
const {pdfSender, readJsonFile} = require("../helper/pdfsender.js");
const {lieferGenerator} = require("../helper/liefersgenerator.js");

const encryptionKey = getKeyExpression();

const storage = multer.memoryStorage();


const upload = multer({ storage: storage }).single('pdfFile');

const PostUploadPDF = (req, res) => {
    


    upload(req, res, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error uploading file.');
        }

        console.log("Body Data:", req.body); 

        if (!req.file) {
            console.log("Nothing was uploaded??");
            return res.status(400).send('No file uploaded.');
        }

        const outputDir = 'output/read_invoices/';
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const invoiceName = req.body.invoiceName && req.body.invoiceName.trim()
            ? req.body.invoiceName.replace(/\s+/g, '_')
            : `invoice_${Date.now()}`;

        

        const ext = path.extname(req.file.originalname);
        const filePath = path.join(outputDir, `${invoiceName.replace(ext, '')}${ext}`);
        const fullFilePath = path.join(process.cwd(), 'output', 'read_invoices', `${invoiceName}`);

        fs.promises.writeFile(filePath, req.file.buffer)
            .then(async () => {
                console.log("Saved as:", filePath);

                await pdfSender(fullFilePath, 2, "");

                const pdfJSON = await readJsonFile(path.join(process.cwd(), 'output', 'Invoice_Json', `mydata.json`));

                await saveInvoiceToDB(invoiceName, pdfJSON)
            
                return res.status(200).json({ redirectUrl: '/invoice' })
        })
        .catch((writeErr) => {
            console.error("Error saving file:", writeErr);
            res.status(500).send('Error saving file.');
        });
    });
};
// Handle File Upload end




// Login Page start
const PostAdmin = (req, res) => {

    const { username, password } = req.body

    // const sql = `SELECT admins.username, admins.adminpassword FROM admins WHERE username = "${username}";`
    const sql = `SELECT CAST(AES_DECRYPT(username, ${encryptionKey}) AS CHAR) AS username, CAST(AES_DECRYPT(adminpassword, ${encryptionKey}) AS CHAR) AS password FROM admins WHERE username = AES_ENCRYPT('${username}', ${encryptionKey});`

    connection.query(sql, [username],(err, result, fields) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        console.log('====================================');
        console.log("Query result", result);
        console.log('====================================');

        if (result.length === 0) {

            return res.status(403).json({ message: 'Invalid username or password' });
        }
        
        const user = result[0].password
        if (user === password) {

            const token = jwt.sign({ username }, process.env.SECRET_KEY);
            res.cookie('jwt', token, { httpOnly: true, secure: true }); //change secure to true in production
            console.log('Cookies:', req.cookies)
            console.log('JWT Cookie:', req.cookies['jwt'])

            return res.status(200).json({ redirectUrl: '/invoice' })
            
            

            } else{
                return res.sendStatus(403);
            }
        })
    
};


const GetAdmin = (req, res) => {

    return res.sendFile(path.join(process.cwd(), 'views', 'login.html'));

};
// Login Page end

// Invoice start
const GetInvoice = (req, res) => {
    let sql = `SELECT 
CAST(AES_DECRYPT(invoices.invoiceNumber, ${encryptionKey}) AS SIGNED) AS invoiceNumber, 
CAST(AES_DECRYPT(invoices.dueDate, ${encryptionKey}) AS DATE) AS dueDate, 
CAST(AES_DECRYPT(customers.name, ${encryptionKey}) AS CHAR) AS customer_name, 
CAST(AES_DECRYPT(customers.email, ${encryptionKey}) AS CHAR) AS customer_email, 
CAST(AES_DECRYPT(invoices.Falligerbetrag, ${encryptionKey}) AS DECIMAL(20,2)) AS totalowned, 
CAST(AES_DECRYPT(invoices.comments, ${encryptionKey}) AS CHAR) AS comments, 
CAST(AES_DECRYPT(invoices.status, ${encryptionKey}) AS CHAR) AS status, 
CAST(AES_DECRYPT(invoices.delete_trigger, ${encryptionKey}) AS SIGNED) AS delete_trigger 
FROM invoices 
LEFT JOIN customers ON invoices.invoice_id = customers.Invoices_invoiceId 
WHERE CAST(AES_DECRYPT(invoices.readorwrite, ${encryptionKey}) AS SIGNED) = 1 ORDER BY invoices.invoice_id;`

    sql += `SELECT CAST(AES_DECRYPT(uploaded_invoices.invoice_name, ${encryptionKey}) AS CHAR) AS invoice_name, AES_DECRYPT(uploaded_invoices.invoice_data, ${encryptionKey}) AS invoice_data, CAST(AES_DECRYPT(uploaded_invoices.comment, ${encryptionKey}) AS CHAR) AS comment FROM uploaded_invoices;`
    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        const filteredUploadedInvoices = result[1].map(row => ({
            ...row,
            invoice_data: filterNulls(JSON.parse(row.invoice_data))
        }));
        console.log('====================================');
        console.log("DB => Website result: ", result[0]);
        console.log('====================================');
        if (result.length == 0 || result === undefined ){
            console.log("No data")
        }
        return res.render(path.join(process.cwd(), 'secure', 'invoice.ejs'), { data: result[0], uploadedInvoices: filteredUploadedInvoices});
    });

};

const filterNulls = (obj) => {
    return Object.fromEntries(Object.entries(obj).filter(([_, value]) => value !== null && value !== ''));
};
// Invoice End




// PDF Generator start
const GeneratedPDF = async (req, res) => {
    try {
        const { RechnungNumber, RechnungDate, DeliveryDate, BillingPeriodStart, BillingPeriodEnd, DueDate, ContractNo, OrderNo, items, zusItems, CustomerName, CustomerEmail, CustomerAddress, CustomerPhone, CustomerZipcode, CustomerStadt, CustomerCountry, CustomerState } = req.body;

        let SumPosition = 0;
        let Extra = 0;

        const hasEmptyValues = (items) => {
            return items.some(item => 
              Object.values(item).some(value => value === '' || value === null || value === undefined)
            );
        };

        let template = 0;

        if (hasEmptyValues(zusItems)){
            console.log("Zuschlag contains empty values.\n Routing to Zuschlag free template");
            template = await fs.readFile(path.join(process.cwd(), 'secure', "template_nozuschlag.ejs"), "utf8");

        }else{
            console.log("Zuschlag contains values.\n Routing to normal template");
            template = await fs.readFile(path.join(process.cwd(), 'secure', "template.ejs"), "utf8");

            zusItems.forEach((item, index) => {
                Extra = Extra + parseInt(item.ZuschlagTotal);
            });
        }

        
        items.forEach((item, index) => {
            SumPosition = SumPosition + parseInt(item.total);
        });

        
       
        console.log("Sum = ",SumPosition);

        let renderedHtml = ejs.render(template, { 
            RechnungNumber, 
            RechnungDate, 
            DeliveryDate, 
            BillingPeriodStart, 
            BillingPeriodEnd, 
            DueDate, 
            ContractNo, 
            OrderNo, 
            items,
            zusItems,
            SumPosition,
            Extra,
            CustomerName, 
            CustomerEmail, 
            CustomerAddress, 
            CustomerPhone,
            CustomerZipcode,
            CustomerStadt,
            CustomerCountry,
            CustomerState
        });

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(renderedHtml, { waitUntil: "networkidle0" });

        // Generate PDF/A file
        const pdfPath = path.join(process.cwd(), 'uploads', `Rechnung_${RechnungNumber}.pdf`);
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

        pdfaConverter(`Rechnung_${RechnungNumber}.pdf`, req.body);
        const newPDFPath = `/output/pdfs/Rechnung_${RechnungNumber}.pdf`;

        await lieferGenerator(req.body);

        res.status(200).json({ message: "PDF created successfully", filePath: newPDFPath });

    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).json({ error: "Failed to generate PDF" });
    
    }

};


//Adds data to Database, i know crazy
const PushtoDB = async (req, res) => {

    try{
        let SumPosition = 0;
        let Extra = 0;
        let Checkzus = 0;

        console.log("====================================\nReading Data\n====================================");
        const {items, zusItems} = req.body;

        const hasEmptyValues = (items) => {
            return items.some(item => 
            Object.values(item).some(value => value === '' || value === null || value === undefined)
            );
        };

        if (hasEmptyValues(zusItems)){
            console.log("Zuschlag contains empty values.\n Routing to Zushclag free to DB");

        }else{
            console.log("Zuschlag contains values.\n Routing to normal DB");
            Checkzus = 1; //there is Zuschlag
            zusItems.forEach((item, index) => {
                Extra = Extra + parseInt(item.ZuschlagTotal);
            });
        }

        
        items.forEach((item, index) => {
            SumPosition = SumPosition + parseInt(item.total);
        });

        

        const invoiceResult = await dbInvoicePush(req.body, SumPosition, Extra);
        await dbCustomerZuschlagItemsPush(req.body, invoiceResult, Checkzus);
        console.log("====================================\nData Submitted to DB...\n Rerouting...\n====================================");
        return res.status(200).json({ redirectUrl: '/invoice' })

    } catch (error) {
        console.error("Error adding Data to DB:", error);
        res.status(500).json({ error: "Failed to add Data to DB" });
    
    }
};

// Function to Add a comment
 const addComment = async (req, res) => {

    try{
        const {invoiceNumber, comment} = req.body;

        const IDnumber = await dbIDsearcher(invoiceNumber);

        const sql = `UPDATE invoices SET invoices.comments = AES_ENCRYPT('${comment}', ${encryptionKey})  WHERE invoices.invoice_id = ${IDnumber};`

        connection.query(sql, (err, result) => {
            if (err) {
                console.error('Database error:', err);
                reject(err);
                return;
            }

            console.log("Query result", result);
        });

        
        return res.status(200).json({ redirectUrl: '/invoice' })
    }catch (error){
        console.error("Error adding Data to DB:", error);
        res.status(500).json({ error: "Failed to add Data to DB" });
    }
    
};

// Set Cancelled status to invoices
const cancelInvoiceOption = async (req, res) => {

    try{

        const {invoiceNumber, cancelOption} = req.body;

        const IDnumber = await dbIDsearcher(invoiceNumber);

        const sql = `UPDATE invoices SET invoices.status = AES_ENCRYPT('${cancelOption}', ${encryptionKey})  WHERE invoices.invoice_id = ${IDnumber};`
        
        connection.query(sql, (err, result) => {
            if (err) {
                console.error('Database error:', err);
                reject(err);
                return;
            }

            console.log("Query result", result);
        });

        
        return res.status(200).json({ redirectUrl: '/invoice' })

    }catch (error){
        console.error("Error adding Data to DB:", error);
        res.status(500).json({ error: "Failed to add Data to DB" });
    }

}

// Function to Add payment
const addPayment = async (req, res) => {

    try{
        const {invoiceNumber, payment, totalamount} = req.body;
        let total = totalamount - payment;

        
        console.log("supposed to be the number = ",invoiceNumber)
        const IDnumber = await dbIDsearcher(invoiceNumber);
        const invoicetotal = await dbTotalsearcher(IDnumber);
        
        let sql = `UPDATE invoices SET invoices.Falligerbetrag = AES_ENCRYPT('${invoicetotal - payment}', ${encryptionKey}) WHERE invoices.invoice_id = ${IDnumber};`

        if (total === 0){
            sql += `UPDATE invoices SET invoices.status = AES_ENCRYPT('Paid', ${encryptionKey})  WHERE invoices.invoice_id = ${IDnumber};`
            sql += `UPDATE invoices SET invoices.delete_trigger = AES_ENCRYPT(${1}, ${encryptionKey}) WHERE invoices.invoice_id = ${IDnumber};`
        }
         

        connection.query(sql, (err, result) => {
            if (err) {
                console.error('Database error:', err);
                reject(err);
                return;
            }

            console.log("Query result", result);
        });

        
        return res.status(200).json({ redirectUrl: '/invoice' })

    }catch (error){
        console.error("Error adding Data to DB:", error);
        res.status(500).json({ error: "Failed to add Data to DB" });
    }


}

// Function to Sort the table
const sortingFunction = (req, res) => {
    try{
        const sql = `SELECT 
        CAST(AES_DECRYPT(invoices.invoiceNumber, ${encryptionKey}) AS SIGNED) AS invoiceNumber, 
        CAST(AES_DECRYPT(invoices.dueDate, ${encryptionKey}) AS DATE) AS dueDate, 
        CAST(AES_DECRYPT(customers.name, ${encryptionKey}) AS CHAR) AS customer_name, 
        CAST(AES_DECRYPT(customers.email, ${encryptionKey}) AS CHAR) AS customer_email, 
        CAST(AES_DECRYPT(invoices.Falligerbetrag, ${encryptionKey}) AS DECIMAL(20,2)) AS totalowned, 
        CAST(AES_DECRYPT(invoices.comments, ${encryptionKey}) AS CHAR) AS comments, 
        CAST(AES_DECRYPT(invoices.status, ${encryptionKey}) AS CHAR) AS status, 
        CAST(AES_DECRYPT(invoices.delete_trigger, ${encryptionKey}) AS SIGNED) AS delete_trigger 
        FROM invoices 
        LEFT JOIN customers ON invoices.invoice_id = customers.Invoices_invoiceId 
        WHERE CAST(AES_DECRYPT(invoices.readorwrite, ${encryptionKey}) AS SIGNED) = 1 ORDER BY invoices.invoice_id;`
         
        connection.query(sql, (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Database error' });
            }

            console.log('====================================');
            console.log("DB => Sort result: ", result);
            console.log('====================================');
            if (result.length == 0 || result === undefined ){
                console.log("No data")
            }

            const { sort, order } = req.query;
            if (sort) {
                result.sort((a, b) => {
                    let valA = a[sort];
                    let valB = b[sort];

                    if (!isNaN(valA) && !isNaN(valB)) {
                        return order === "desc" ? valB - valA : valA - valB;
                    } else {
                        return order === "desc" ? valB.localeCompare(valA) : valA.localeCompare(valB);
                    }
                });
            }

            res.json(result);
        });

    }catch (error){
        console.error("Error adding Data to DB:", error);
        res.status(500).json({ error: "Failed to add Data to DB" });
    }

    
};
module.exports={GetAdmin, PostAdmin, GetInvoice, PostUploadPDF, GeneratedPDF, PushtoDB, addComment, cancelInvoiceOption, addPayment, sortingFunction}