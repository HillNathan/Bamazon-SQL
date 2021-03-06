// Setting up the environment for the program, including the necessary npm packages:
const inquirer = require("inquirer")
const mysql = require('mysql')
require("dotenv").config()
const keys = require("./keys.js")
const common = require("./common.js")
const myConnection = require('./connection.js')

let loginAttempts = 0

// connect to the database
const connection = myConnection.getConnection('localhost', 3306, 'root', keys.mysql.password, 'bamazon')
// set up the choices array for the inquirer
const choiceArr = ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product', 'EXIT']

// initiate the database connection
connection.connect(function(err,res) {
    if (err) throw err
    // as long as there are no errors, start the app
    managerLogin()
})

const managerMenu = () => {
    // set up the initial prompt from the manager user
    inquirer.prompt ([
        {
            type: 'list',
            choices: choiceArr,
            name: 'myChoice'
        }
    ]).then (response => {
        // parsing the response, and calling appropriate functions to run the requested process
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
    // query all products, and call the display function passing in the array of returned items
    connection.query("SELECT * FROM products", 
    function(err,res) {
        if (err) throw err
        managerDisplay(res)
        managerMenu()
    })    
}

const viewLowInventory = () => {
    // query the database for any products with a quantity lower than 5
    connection.query("SELECT * FROM products WHERE quantity < 5",
    function(err,res) {
        if (err) throw err
        // if there are low inventory items, call the display function, passing in the array of returned items
        if(res.length > 0) managerDisplay(res)
        else {
            console.log('+--------------------------------------------------+')
            console.log('| THERE ARE NO PRODUCTS WITH INVENTORY LESS THAN 5 |')
            console.log('+--------------------------------------------------+')
        }
        managerMenu()
    }) 
}

const addInventory = () => {
    // query all products
    connection.query("SELECT * FROM products", 
    function(err,res) {
        if (err) throw err
        // call the display function passing in the array of returned items
        managerDisplay(res)
        console.log('TYPE ID="0" TO EXIT')
        // ask the user for information about the product where inventory will be added, and how much
        inquirer.prompt([
        {
            type: 'input',
            message: 'Please enter the product ID to add inventory:',
            name: 'inventoryID',
            validate: common.validateNum
        }]).then(response1 => {
            if (response1.inventoryID > 0) {
                inquirer.prompt([
                    {
                        type: 'input',
                        message: 'How much quantity are you adding? :',
                        name: 'newQuantity',
                        validate: common.validateNum    
                    }
                    // process the response from the user
                ]).then(response => {
                    // run a mySQL query to pull the record indicated by the user
                    connection.query("SELECT * FROM products WHERE ?",
                    {item_ID: response1.inventoryID}, function(err,record) {
                        if (err) throw err
                        let newQTY = parseInt(record[0].quantity) + parseInt(response.newQuantity)
                        // run an update query to reflect the new inventory number
                        connection.query ("UPDATE products SET ? WHERE ?",
                            [{quantity: newQTY},{item_ID: response1.inventoryID}],
                            function(err, invRes) {
                                if (err) throw err
                                // print a confirmation for the user
                                console.log(`Quantity of ${record[0].product_name} updated to ${newQTY}`)
                                console.log(invRes.affectedRows + " records updated.")
                                // throw back to the main menu of the application
                                managerMenu()
                            })
                        })
                    })   
            }
            else managerMenu()
        })     
    })
}

const addNewProduct = () => {
    // run a 4-step inquirer prompt chain to get new product information from the user
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
            name: 'price',
            validate: common.validateNum
        },
        {
            type: 'input',
            message: 'Enter Product Quantity',
            name: 'quantity',
            validate: common.validateNum
        }
    ]).then(newProd => {
        // print the information to the screen, and prompt the user to confirm
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
                // if the confirmation is given, run a mySQL query to insert the new info into the products 
                //    table. The response object is set up so that it can be inserted as is. The sales fields
                //    are set to NOT NULL so they will autofill with 0 as a value.
                if (confirm.confirmation) {
                    newProd = {
                        ...newProd,
                        num_sales: 0,
                        product_sales: 0 }
                    connection.query("INSERT INTO products SET ?",
                    newProd, function(err,res) {
                        if (err) throw err
                        console.log (res.affectedRows + " items added.")
                        // throw back to the main menu of the app
                        managerMenu()
                    })
                }
            })
    })
    
}

// my homemade function to display the data in the products table
const managerDisplay = (productArray) => {
    // table header
    console.log('+----+-------------------------+--------+----------+')
    console.log('| ID | PRODUCT NAME            | PRICE  | QUANTITY |')
    console.log('+----+-------------------------+--------+----------+')
    productArray.map(element => {
        let outputString = '|'
            // setting different outputs based on 1 or 2 digit IDs
            if (element.item_id < 10) outputString += ` ${element.item_id}  | `
            else outputString += ` ${element.item_id} | `
        outputString += (element.product_name)
        // running for loops basically to set column widths by inserting blank spaces to a specific length
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

const managerLogin = () => {
    console.log('+--------------------------------------------------+')
    console.log('|   Please log in to continue:                     |')
    console.log('+--------------------------------------------------+')

    inquirer.prompt([
        {
            type: 'input',
            message: 'Username:',
            name: 'username'
        },
        {
            type: 'password',
            message: 'Password:',
            name: 'password'
        }
    ]).then(login => {
        loginAttempts++
        connection.query("SELECT manager_login, manager_password FROM managers WHERE ?",
        {manager_login: login.username},
        function(err,res) {
            if (err) throw err
            if (res.length > 0) {
                if(res[0].manager_password === login.password) { 
                    console.log ('login successful')
                    if (login.username === 'bbanner') console.log('Welcome strongest Avenger.')
                    managerMenu()
                }
                else {
                    console.log('login failed.')
                    if (loginAttempts > 4) process.exit()
                    else managerLogin()
                }
            }
        })
    })
}