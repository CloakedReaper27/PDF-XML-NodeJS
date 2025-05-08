var net = require('net');
const fs = require('fs');
const path = require('path');

async function pdfSender (path, choice, pdfdata){
    if (choice === 3){
        return new Promise((resolve, reject) => {
            var client = net.connect(1010, 'localhost', function() {

                const jsonMessage = JSON.stringify({
                    filePath: path,
                    number: choice,
                    pdfdata: pdfdata
                });

                client.write(jsonMessage);
                client.end();

            });

            client.on('end', function() {
                console.log('Java has closed the connection.');
                resolve('Java closed the connection.');
            });

            client.on('error', function(err) {
                reject(new Error('Connection failed: ' + err.message));
            });
        });

    }else if (choice === 2){
        return new Promise((resolve, reject) => {
            var client = net.connect(1010, 'localhost', function() {

                const jsonMessage = JSON.stringify({
                    filePath: path,
                    number: choice
                });

                client.write(jsonMessage);
                client.end();

            });

            client.on('end', function() {
                console.log('Java has closed the connection.');
                resolve('Java closed the connection.');
            });

            client.on('error', function(err) {
                reject(new Error('Connection failed: ' + err.message));
            });
        });

    }
    return;
}


function readJsonFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                try {
                    const jsonData = JSON.parse(data);
                    resolve(jsonData);
                } catch (parseError) {
                    reject(parseError);
                }
            }
        });
    });
}
module.exports = {pdfSender, readJsonFile};