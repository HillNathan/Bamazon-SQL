const inquirer = require("inquirer")
const mysql = require('mysql')
require("dotenv").config()
const keys = require("./keys.js")
const common = require("./common.js")

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

const choiceArr = ['View Product Sales by Department', 'Add New Department', 'EXIT']

connection.connect(function(err,res) {
    if (err) throw err
    else supervisorMenu()
})

const supervisorMenu = () => {
    console.log('+=========================+')
    console.log('|     SUPERVISOR MENU     |')
    console.log('+=========================+')
    inquirer.prompt([
        {
            type: 'list',
            choices: choiceArr,
            message: 'Please Select an Option',
            name: 'choice'
        }
    ]).then(response => {
        switch (response.choice) {
            case choiceArr[0] :
                return displaySalesTable()
            case choiceArr[1] :
                return addDepartment()
            case choiceArr[2] :
                console.log("Goodbye!!!")
                return process.send()
            default:
                console.log("Ooooops...")
                return process.end()
        }
    })
}

const displaySalesTable = () => {
    console.log("SALES TABLE")
    supervisorMenu()
}

const addDepartment = () => {
    console.log("ADD A DEPARTMENT")
    supervisorMenu()
}