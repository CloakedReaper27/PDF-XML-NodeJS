const { exec } = require('child_process');
const path = require('path');

const {pdfSender} = require("../helper/pdfsender.js");



async function pdfaConverter(filename, pdfdata) {

    const inputPDF = path.join(process.cwd(), 'uploads', filename);
    const outputPDF = path.join(process.cwd(), 'output', 'pdfs' , filename);
    
    const convertPdfToPdfA = () => {
        return new Promise((resolve, reject) => {
            const cmd = `start /B gswin64c -dPDFA=3 -dBATCH -dNOPAUSE -sDEVICE=pdfwrite -sOutputFile=${outputPDF} ${inputPDF}`;

            exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error: ${error.message}`);
                    reject(error);
                    return;
                }
                if (stderr) {
                    console.error(`stderr: ${stderr}`);
                    reject(stderr);
                    return;
                }
                console.log(`Successfully converted to PDF/A-3U: ${outputPDF}`);
                resolve();
            });
        });
    };

    // Await the conversion to finish first
    await convertPdfToPdfA();

    await pdfSender(path.join(process.cwd(), 'output', 'pdfs' , filename), 3, pdfdata);
    return;
}

module.exports = {pdfaConverter};