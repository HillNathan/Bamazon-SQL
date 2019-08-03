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
    connection.query("SELECT * FROM products", 
    function(err,res) {
        if (err) throw err
        managerDisplay(res)
        managerMenu()
    })    
}

const viewLowInventory = () => {
    connection.query("SELECT * FROM products WHERE quantity < 5",
    function(err,res) {
        if (err) throw err
        managerDisplay(res)
        managerMenu()
    }) 
}

const addInventory = () => {
    console.log('Add to Inventory')
    managerMenu()
}

const addNewProduct = () => {
    console.log('Add New Product')
    managerMenu()
}

const managerDisplay = (productArray) => {
    console.log('+----+-------------------------+--------+----------+')
    console.log('| ID | PRODUCT NAME            | PRICE  | QUANTITY |')
    console.log('+----+-------------------------+--------+----------+')
    productArray.map(element => {
        let outputString = '|'
            if (element.item_id < 10) outputString += ` ${element.item_id}  | `
            else outputString += ` ${element.item_id} | `
        outputString += (element.product_name)
        for (let i = outputString.length; i < 31; i++){
            outputString += ' '
        }
        outputString += "| "
        outputString += `$${element.price}`
        for (let i = outputString.length; i < 40; i++){
            outputString += ' '
        }
        outputString += '| '
        outputString += `${element.quantity}`
        for (let i = outputString.length; i < 51; i++){
            outputString += ' '
        }
        outputString += '|'
        console.log(outputString)
    })
    console.log('+----+-------------------------+--------+----------+')
}

