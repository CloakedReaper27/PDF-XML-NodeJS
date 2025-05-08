const express = require("express");
const multer = require('multer');
const server = express();
const cors = require('cors');
const app_route = require('./routers/app_route');
const path = require('path');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const ejs = require('ejs');
const cookieParser = require('cookie-parser');
const puppeteer = require("puppeteer");
const fs = require("fs-extra");
// requires end

// cors start

const corsOptions = {
    origin: 'http://localhost:5000', // Allow this origin
    credentials: true,  // Allow sending cookies (important for authentication)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // Which Methods are allowed
}
server.use(cors(corsOptions));
server.options('*', cors(corsOptions));

// cors end

server.use(express.json());
server.use(cookieParser());
server.use(express.urlencoded({ extended: true }));

server.use(bodyParser.json());
server.use(app_route);
server.set('view engine', 'ejs');
server.set('views', path.join(__dirname, 'secure'));

require('dotenv').config();

// server.set('view engine', 'ejs');


server.use(express.static(path.join(__dirname, '/public')));
server.use(express.static(path.join(__dirname, 'uploads')));
server.use('/output', express.static(path.join(process.cwd(), 'output')));


server.listen(process.env.PORT, () => {
    console.log('====================================');
    console.log(`Server start and listen on Port ${process.env.PORT}`);
    console.log('====================================');
});

