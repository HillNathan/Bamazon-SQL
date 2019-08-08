const mysql = require('mysql')
require("dotenv").config()

exports.getConnection = (host, port, user, password, database) => {
    return mysql.createConnection({
        host, port, user, password, database
    })
};