// Setting up the environment for the program, including the necessary npm packages:
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
  
    // Your password - hidden in the .env file
    password: keys.mysql.password,
    database: "bamazon"
});
// set up the choices array for the inquirer
const choiceArr = ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product', 'EXIT']

// initiate the database connection
connection.connect(function(err,res) {
    if (err) throw err
    // as long as there are no errors, start the app
    managerMenu()
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
        }]).then(response => {
            if (response.inventoryID > 0) {
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
                    {item_ID: response.inventoryID}, function(err,record) {
                        if (err) throw err
                        let newQTY = parseInt(record[0].quantity) + parseInt(response.newQuantity)
                        // run an update query to reflect the new inventory number
                        connection.query ("UPDATE products SET ? WHERE ?",
                            [{quantity: newQTY},{item_ID: response.inventoryID}],
                            function(err, invRes) {
                                if (err) throw err
                                // print a confirmation for the user
                                console.log(`Quantity of ${record[0].product_name} updated to ${newQTY}`)
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

