const inquirer = require("inquirer")
const mysql = require('mysql')
require("dotenv").config()
const keys = require("./keys.js")
const common = require("./common.js")
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
        displayProductList(res)
        inquirer.prompt([
            {
                type: 'input',
                message: 'Please enter the Id of the product you want to buy:',
                name: 'purchaseID',
                validate: common.validateNum
            }]).then(firstResponse => {
                if (parseInt(firstResponse.purchaseID) > 0) {
                    inquirer.prompt([
                    {
                        type: 'input',
                        message: 'How many of this item do you wish to buy?',
                        name: 'purchaseQty',
                        validate: common.validateNum
                    }
                    ]).then(response => {
                        buyProduct(parseInt(firstResponse.purchaseID), parseInt(response.purchaseQty))
                    }) 
                }
                else connection.end()
            })
    })
}

const displayProductList = (productArray) => {
    console.log('+----+-------------------------+--------+')
    console.log('| ID | PRODUCT NAME            | PRICE  |')
    console.log('+----+-------------------------+--------+')
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
        outputString += '|'
        console.log(outputString)
        console.log('+----+-------------------------+--------+')
        
    })
    console.log('TYPE ID="0" TO EXIT')
}


const buyProduct = (prod_ID, quantity) => {
    connection.query("SELECT * FROM products WHERE ?", 
        {item_ID: prod_ID}, function(err, record) {
            if (err) throw err
            if (record[0].quantity >= quantity) {
                // update the record to reflect the new quantity
                let newQty = record[0].quantity - quantity
                let purchCost = quantity * record[0].price
                connection.query("UPDATE products SET ? WHERE ?",
                    [{quantity: newQty, product_sales: purchCost },{item_ID: prod_ID}],
                     function(err,purchRes) {
                        if (err) throw err
                        console.log(`Your total for this purchase will be $${purchCost}.00.`)
                     })
            }
            else {
                console.log("Sorry, there is not enough inventory to fill that order.")
            }
        start()
        })
}