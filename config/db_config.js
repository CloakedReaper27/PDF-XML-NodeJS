const mysql = require('mysql2');
console.log('====================================');
console.log('server connected to db');
console.log('====================================');

let connection = mysql.createConnection({
    host:'localhost',
    user:'',
    password:'',
    database:'',
    multipleStatements: true
}); 
module.exports= {connection};
