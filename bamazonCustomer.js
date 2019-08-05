// Setting up the environment for the program, including the necessary npm packages:
const inquirer = require("inquirer")
const mysql = require('mysql')
require("dotenv").config()
const keys = require("./keys.js")
const common = require("./common.js")
const Table = require('cli-table')

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

  // initiate the database connection
connection.connect(function(err,res) {
    if (err) throw err
    // as long as there are no errors, start the app
    else start()
})

const start = () => {
    // initial query simply selects all items from products
    connection.query("SELECT * FROM products", 
    function(err,res) {
        if (err) throw err   // error catch
        // call the display fucntion, passing the results from the mySQL query
        displayProductList(res)
        // Prompt the user for their initial input
        inquirer.prompt([
            {
                type: 'input',
                message: 'Please enter the Id of the product you want to buy:',
                name: 'purchaseID',
                validate: common.validateNum
            }]).then(firstResponse => {
                // as long as the input is not zero (exit command) proceed  with the next prompt
                if (parseInt(firstResponse.purchaseID) > 0) {
                    inquirer.prompt([
                    {
                        type: 'input',
                        message: 'How many of this item do you wish to buy?',
                        name: 'purchaseQty',
                        validate: common.validateNum
                    }
                    ]).then(response => {
                        // call the function to do the buy action passing the input from the user
                        buyProduct(parseInt(firstResponse.purchaseID), parseInt(response.purchaseQty))
                    }) 
                }
                // exit clause, exit the program.
                else process.exit()
            })
    })
}

const displayProductList = (productArray) => {
    // using the cli-table to display the product information
    let table = new Table({
        // set up the headers for the table
        head: ['ID', 'PRODUCT NAME', 'PRICE'],
        colWidths: [8,30,10]
    })
    // set an empty array to be pushed to the table object
    let tableRow = []
    // run a map function, pushing each item to print to screen to the row array
    productArray.map(element => {
        tableRow.push(element.item_id)
        tableRow.push(element.product_name)
        tableRow.push('$'+ element.price)
        // push the row array to the table object array to be dispayed, then reset it for the next row
        table.push(tableRow)
        tableRow =[]
    })
    // print the table to the screen
    console.log(table.toString());
    console.log('TYPE ID="0" TO EXIT')
}

// function for buying a product, takes in two arguments as integers. 
const buyProduct = (prod_ID, quantity) => {
    // make the query to the database to 
    connection.query("SELECT * FROM products WHERE ?", 
        {item_ID: prod_ID}, function(err, record) {
            if (err) throw err
            // check to make sure that there is sufficient quantity in the inventory 
            // as long as there is enough quantity, proces the sale
            if (record[0].quantity >= quantity) {
                let newQty = record[0].quantity - quantity
                let purchCost = quantity * record[0].price
                console.log(quantity)
                // update the database record to reflect the new quantity, and record the sale as 
                // a number and as total dollars
                connection.query("UPDATE products SET ? WHERE ?",
                    // update these columns with this data
                    [{quantity: newQty, product_sales: purchCost, num_sales: quantity },
                        // where you find this item_id
                     {item_ID: prod_ID}],
                     function(err,purchRes) {
                        if (err) throw err
                        console.log(`Your total for this purchase will be $${purchCost}.00.`)
                     })
            }
            else {
                // message if there is not sufficient quantity for the order
                console.log("Sorry, there is not enough inventory to fill that order.")
            }
            // ask the user if they would like to make another purchase:
            inquirer.prompt([
                {
                    type: 'confirm',
                    message: 'Would you like to make another purchase?',
                    name: 'confirm'
                }
            ]).then(anotherPurchase => {
                // if they answer yes, go back to the start of the program
                if (anotherPurchase.confirm) start()
                else {
                    // otherwise end the program
                    console.log('Goodbye!')
                    process.exit()
                }
            })
            
        
        })
}