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

const choiceArr = ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product', 'EXIT']

connection.connect(function(err,res) {
    if (err) throw err
    else managerMenu()
})

const managerMenu = () => {
    inquirer.prompt ([
        {
            type: 'list',
            choices: choiceArr,
            name: 'myChoice'
        }
    ]).then (response => {
        switch (response.myChoice) {
            case choiceArr[0]: 
                return viewProducts()
            case choiceArr[1]:
                return viewLowInventory()
            case choiceArr[2]:
                return addInventory()
            case choiceArr[3]:
                return addNewProduct()
            case choiceArr[4]:
                console.log("Goodbye!")
                return process.exit()
            default: 
                console.log("Ooops.")
                return process.exit()
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
    connection.query("SELECT * FROM products", 
    function(err,res) {
        if (err) throw err
        managerDisplay(res)
        inquirer.prompt([
        {
            type: 'input',
            message: 'Please enter the product ID to add inventory:',
            name: 'inventoryID',
            validate: common.validateNum
        },
        {
            type: 'input',
            message: 'How much quantity are you adding? :',
            name: 'newQuantity',
            validate: common.validateNum
        }
    ]).then(response => {
        connection.query("SELECT * FROM products WHERE ?",
        {item_ID: response.inventoryID}, function(err,record) {
            if (err) throw err
            let newQTY = parseInt(record[0].quantity) + parseInt(response.newQuantity)
            console.log('new quantity = ' + newQTY)
            connection.query ("UPDATE products SET ? WHERE ?",
                [{quantity: newQTY},{item_ID: response.inventoryID}],
                function(err, invRes) {
                    if (err) throw err
                    console.log(`Quantity of ${record[0].product_name} updated to ${newQTY}`)
                    managerMenu()
                })
            })
        })   
    })
}


const addNewProduct = () => {
    inquirer.prompt([
        {
            type: 'input',
            message: 'Enter Product Name',
            name: 'product_name'
        },
        {
            type: 'input',
            message: 'Enter Product Department',
            name: 'department'
        },
        {
            type: 'input',
            message: 'Enter Product Price',
            name: 'price'
        },
        {
            type: 'input',
            message: 'Enter Product Quantity',
            name: 'quantity'
        }
    ]).then(newProd => {
        console.log('=====================================')
        console.log(`Product Name: ${newProd.product_name}`)
        console.log(`Product Department: ${newProd.department}`)
        console.log(`Product Price: ${newProd.price}`)
        console.log(`Product Quantity: ${newProd.quantity}`)
        console.log('=====================================')
        inquirer.prompt([
            {
                type: 'confirm',
                message: 'Is this information correct?',
                default: 'Yes',
                name: 'confirmation'
            }]).then(confirm => {
                if (confirm.confirmation) {
                    connection.query("INSERT INTO products SET ?",
                    newProd, function(err,res) {
                        if (err) throw err
                        console.log (res.affectedRows + " items added.")
                    })
                managerMenu()
                }
            })
    })
    
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

