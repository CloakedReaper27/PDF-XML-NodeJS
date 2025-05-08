const puppeteer = require("puppeteer");
const ejs = require("ejs");
const fs = require("fs-extra");
const path = require('path');


async function lieferGenerator (body){


    const { RechnungNumber, RechnungDate, DeliveryDate, DueDate, ContractNo, OrderNo, items, CustomerName, CustomerEmail, CustomerAddress, CustomerPhone, CustomerZipcode, CustomerStadt, CustomerCountry, CustomerState } = body;


    template = await fs.readFile(path.join(process.cwd(), 'secure', "lieferschen.ejs"), "utf8");
    
    let renderedHtml = ejs.render(template, { 
        RechnungNumber, 
        RechnungDate, 
        DeliveryDate, 
        DueDate, 
        ContractNo, 
        OrderNo, 
        CustomerName, 
        CustomerEmail, 
        CustomerAddress, 
        CustomerPhone,
        CustomerZipcode,
        CustomerStadt,
        CustomerCountry,
        items,
        CustomerState
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
        ` });

    await browser.close();

}

module.exports = {lieferGenerator};