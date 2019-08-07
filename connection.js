const mysql = require('mysql')
const keys = require("./keys.js")
require("dotenv").config()

function MysqlConnection() {
        const theConnection = mysql.createConnection({ 
            host: "localhost",

            // Your port; if not 3306
            port: 3306,

            // Your username
            user: "root",

            // Your password - hidden in the .env file
            password: keys.mysql.password,
            database: "bamazon"
        });
        return theConnection
    }

// const temp = new MysqlConnection()

// const connection = temp.    

// console.log(connection)

exports.module = MysqlConnection;