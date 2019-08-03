const inquirer = require("inquirer")
const mysql = require('mysql')
require("dotenv").config()
const keys = require("./keys.js")
// include cli-table

const connection = mysql.createConnection({
    host: "localhost",
  
    // Your port; if not 3306
    port: 3306,
  
    // Your username
    user: "root",
  
    // Your password
    password: keys.mysql.password,
    database: "bamazon"
  });

connection.connect(function(err,res) {
    if (err) throw err
    else start()
})

const start = () => {
    connection.query("SELECT * FROM products", 
    function(err,res) {
        if (err) throw err
        console.log(res)
        connection.end()
    })
}
