const inquirer = require("inquirer")
const mysql = require('mysql')
require("dotenv").config()
const keys = require("./keys.js")

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
    else managerMenu()
})

const managerMenu = () => {
    inquirer.prompt ([
        {
            type: 'list',
            choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product', 'EXIT'],
            name: 'myChoice'
        }
    ]).then (response => {
        switch (response.myChoice) {
            case 'View Products for Sale': 
                viewProducts()
                break
            case 'View Low Inventory':
                viewLowInventory()
                break
            case 'Add to Inventory':
                addInventory()
                break
            case 'Add New Product':
                addNewProduct()
                break
            case 'EXIT':
                console.log("Goodbye!")
                connection.end()
                break
            default: 
                console.log("Ooops.")
        }
    }).catch(err => {
        throw err
    })
}

const viewProducts = () => {
    console.log('View Products code')
    managerMenu()
}

const viewLowInventory = () => {
    console.log('View Low Inventory')
    managerMenu()
}

const addInventory = () => {
    console.log('Add to Inventory')
    managerMenu()
}

const addNewProduct = () => {
    console.log('Add New Product')
    managerMenu()
}