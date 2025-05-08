const express = require('express');
const jwt = require('jsonwebtoken');

// function authenticateToken (req, res, next) {
//     const authHeader = req.headers['authorization']
//     const Token = authHeader && authHeader.split(' ')[1]
//     if (Token == null) return res.sendStatus(401)

//     jwt.verify(Token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
//         if (err) return res.sendStatus(403)
//         req.user = user
//         next()
//     })
// }

function generateAccessToken (user){
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15s'})
}

function authenticateToken(req, res, next) {
    // const authHeader = req.headers['authorization'];
    // const token = authHeader && authHeader.split(' ')[1];

    const token = req.cookies.jwt;
    console.log("token", token)
    if (!token) {
        return res.redirect("/login");
    }
  
    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
      if (err) {
        return res.redirect("/login");
      }
  
      // You can perform additional checks here, e.g., verify the user in the database
  
      req.user = user;
      console.log(req.user)

      next();
    });
  }


module.exports = {authenticateToken,generateAccessToken};