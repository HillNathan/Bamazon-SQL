// setting the environment
const inquirer = require("inquirer")
const mysql = require('mysql')
require("dotenv").config()
const keys = require("./keys.js")
const common = require("./common.js")
const Table = require('cli-table')

let loginAttempts = 0

const connection = mysql.createConnection({
    host: "localhost",
  
    // Your port; if not 3306   
    port: 3306,
  
    // Your username
    user: "root",
  
    // Your password - stored in .env file
    password: keys.mysql.password,
    database: "bamazon"
});

// array of choices for the inquirer menu, and for the associated switch case statement to parse that input
const choiceArr = [ 'View Product Sales','View Product Sales by Department', 'Update Overhead Costs', 
                    'Add New Department', 'Add a Manager', 'EXIT']

// check the database connection. 
connection.connect(function(err,res) {
    if (err) throw err
    // If we have a good connection, call the main menu function
    supervisorLogin()
})

// Main menu function. 
const supervisorMenu = () => {
    // main menu header
    console.log('+=========================+')
    console.log('|     SUPERVISOR MENU     |')
    console.log('+=========================+')
    // use the choice array to prompt from that list of options
    inquirer.prompt([
        {
            type: 'list',
            choices: choiceArr,
            message: 'Please Select an Option',
            name: 'choice'
        }
    ]).then(response => {
        // use the choices array to parse the response, using switch case and calling functions for each option
        switch (response.choice) {
            case choiceArr[0] :
                return viewProductSales()
            case choiceArr[1] :
                return displaySalesTable()
            case choiceArr[2] :
                return updateOverhead()
            case choiceArr[3] :
                return addDepartment()
            case choiceArr[4] :
                return addManager()
            case choiceArr[5] :
                console.log("Goodbye!!!")
                return process.exit()
            default:
                console.log("Ooooops...")
                return process.exit()
        }
    })
}

const displaySalesTable = () => {
    // setting up the cli-table object with headers and column widths
    var table = new Table({
        head: ['Department ID', 'Department Name', 'Overhead Costs', 'Product Sales', 'Total Profit' ],
        colWidths: [15, 18, 17, 17, 17]
    })
    // *THE* most complicated SQL query I have done so far. It joins the products and departments tables joining 
    //   and then grouping by department name. The product sales for all items in the deparment are compiled into 
    //   one value, and then a field is calculated to subtract the total income from the overhead costs to get a 
    //   total profit number by department. The table is sorted by department ID to make it easier to display
    let myQuery = "SELECT departments.department_ID, departments.department_name, departments.overhead_costs, "
                + "SUM(products.product_sales) AS total_sales, SUM(products.product_sales) - departments.overhead_costs "
                + "AS total_profits FROM departments JOIN products ON products.department = departments.department_name "
                + "GROUP BY departments.department_name ORDER BY departments.department_ID;"
    connection.query(myQuery, function(err, res) {
        if (err) throw err
        // push the column info to the table row in a map function
        let tableArray = []
        res.map(element => {
            tableArray.push(element.department_ID)
            tableArray.push(element.department_name)
            tableArray.push(element.overhead_costs)
            tableArray.push(element.total_sales)
            tableArray.push(element.total_profits)
            // send the info to the cli-table Object, then clear the array for the next row
            table.push(tableArray)
            tableArray =[]
        })
        // console log the table. 
        console.log(table.toString());
        // go back to the main menu
        supervisorMenu()
    })   
}

const updateOverhead = () => {
    // setting up the cli-table object with headers and column widths
    var table = new Table({
        head: ['Department ID', 'Department Name', 'Overhead Costs'],
        colWidths: [15, 18, 17]
    })
    // pull the full departments table
    connection.query("SELECT * FROM departments", function(err,res) {
        if (err) throw err
        // push the column info to the table row in a map function
        let tableArray = []
        res.map(element => {
            tableArray.push(element.department_id)
            tableArray.push(element.department_name)
            tableArray.push(element.overhead_costs)
            // send the info to the cli-table Object, then clear the array for the next row
            table.push(tableArray)
            tableArray = []
        })// console log the table.
        console.log(table.toString());
        console.log('TYPE ID="0" TO EXIT')
        // prompt the user for the department they would like to update, 0 to go back to the main menu
        inquirer.prompt([
            {
                type: 'input',
                message: 'Which Department do you want to update?',
                name: 'dept',
                validate: common.validateNum
            }]).then(update => {
                if (update.dept > 0) {
                inquirer.prompt([
                    {
                        type: 'input',
                        message: 'What are the new overhead costs?',
                        name: 'costs',
                        validate: common.validateNum
                    }]).then (update2 => {
                        // run mySQL query to update the appropriate record with the new costs
                            connection.query("UPDATE departments SET ? WHERE ?", 
                            [{overhead_costs: update2.costs},{department_id: update.dept}], 
                            function(err, results)  {
                                if (err) throw err
                                // console log a confirmation message for the user
                                console.log(`Deparment ID ${update.dept} with overhead costs ${update2.costs}.`)
                                // go back to the main menu
                                supervisorMenu()
                            } )
                    })
                } 
                else supervisorMenu()
        })
    })
}

const addDepartment = () => {
    // set up a prompt for the user to enter information about the new department
    console.log("\nADD A DEPARTMENT")
    inquirer.prompt([
        {
            type: 'input',
            message: 'Enter New Department Name:',
            name: 'department_name'
        },
        {
            type: 'input',
            message: 'Enter Department Costs',
            name: 'overhead_costs'
        }]).then(newDept => {
            // display the collected information, and ask the user to confirm the info
            console.log('===============================================')
            console.log(` Department Name: ${newDept.department_name}`)
            console.log(` Department Costs: ${newDept.overhead_costs}`)
            console.log('===============================================')
            inquirer.prompt([
                {
                    type: 'confirm',
                    message: 'Is this information correct?',
                    default: 'Yes',
                    name: 'confirmation'
                }]).then(confirm => {
                    // if we get a positive 
                    if (confirm.confirmation) {
                        // run the mySQL query to add the new department to the departments table
                        connection.query("INSERT INTO departments SET ?",
                        newDept, function(err,res) {
                            if (err) throw err
                            // console log a confirmation message
                            console.log (res.affectedRows + " departments added.")
                        })
                    }
                    // go back to the main menu
                    supervisorMenu()
                })
        })
}

const viewProductSales = () => {
    // set up the cli-table to display the sales information
    let table = new Table({
        // set table headers and column widths
        head: ['Product Name', 'Department', 'Price', 'Num Sales', '$$ Sales'],
        colWidths: [25,18,10,12,12]
    })
    // pull the full products table from the database
    connection.query("SELECT * FROM products", function(err,res) {
        let tableRow = []
        // push the column info to the table row array in a map function
        res.map(element => {
            tableRow.push(element.product_name)
            tableRow.push(element.department)
            tableRow.push('$'+ element.price)
            tableRow.push(element.num_sales)
            tableRow.push('$'+ element.product_sales)
            // send the info to the cli-table Object, then clear the array for the next row
            table.push(tableRow)
            tableRow =[] 
        })
        // display the table
        console.log(table.toString());
        // go back to the main menu
        supervisorMenu()
    })
}

const supervisorLogin = () => {
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
        if (login.username === keys.supervisor.username && login.password === keys.supervisor.password) {
            console.log('Welcome, Director Fury')
            supervisorMenu()
        }
        else {
            console.log('Login failed. Please try again.')
            if (loginAttempts > 4) process.exit()
            else supervisorLogin()
        }
    })
}

const addManager = () => {
    console.log("\nADD A MANAGER")
    inquirer.prompt([
        {
            type: 'input',
            message: 'Enter New Manager Login:',
            name: 'manager_login'
        },
        {
            type: 'input',
            message: 'Enter an initial password',
            name: 'manager_password'
        }]).then(newUser => {
            // display the collected information, and ask the user to confirm the info
            console.log('===============================================')
            console.log(` New Login: ${newUser.manager_login}`)
            console.log(` Initial Password: ${newUser.manager_password}`)
            console.log('===============================================')
            inquirer.prompt([
                {
                    type: 'confirm',
                    message: 'Is this information correct?',
                    default: 'Yes',
                    name: 'confirmation'
                }]).then(confirm => {
                    // if we get a positive 
                    if (confirm.confirmation) {
                        connection.query("INSERT INTO managers SET ?",
                        newUser, function(err,res) {
                            if (err) throw err
                            // console log a confirmation message
                            console.log (res.affectedRows + " managers added.")
                            supervisorMenu()
                        })
                    }
                })
                
        })
}