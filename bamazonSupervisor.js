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
  
    // Your password
    password: keys.mysql.password,
    database: "bamazon"
});

const choiceArr = ['View Product Sales by Department', 'Update Overhead Costs', 'Add New Department', 'EXIT']

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
                return updateOverhead()
            case choiceArr[2] :
                return addDepartment()
            case choiceArr[3] :
                console.log("Goodbye!!!")
                return process.exit()
            default:
                console.log("Ooooops...")
                return process.exit()
        }
    })
}

const displaySalesTable = () => {
    var table = new Table({
        head: ['Department ID', 'Department Name', 'Overhead Costs', 'Product Sales', 'Total Profit' ],
        colWidths: [15, 18, 17, 17, 17]
    })
    let myQuery = "SELECT departments.department_ID, departments.department_name, departments.overhead_costs, "
                + "SUM(products.product_sales) AS total_sales, SUM(products.product_sales) - departments.overhead_costs AS total_profits "
                + "FROM departments JOIN products ON products.department = departments.department_name "
                + "GROUP BY departments.department_name ORDER BY departments.department_ID;"
    connection.query(myQuery, function(err, res) {
        if (err) throw err
        let tableArray = []
        res.map(element => {
            tableArray.push(element.department_ID)
            tableArray.push(element.department_name)
            tableArray.push(element.overhead_costs)
            tableArray.push(element.total_sales)
            tableArray.push(element.total_profits)
            table.push(tableArray)
            tableArray =[]
        })
        console.log(table.toString());
        supervisorMenu()
    })   
}

const updateOverhead = () => {
    var table = new Table({
        head: ['Department ID', 'Department Name', 'Overhead Costs'],
        colWidths: [15, 18, 17]
    })
    connection.query("SELECT * FROM departments", function(err,res) {
        if (err) throw err
        let tableArray = []
        res.map(element => {
            tableArray.push(element.department_id)
            tableArray.push(element.department_name)
            tableArray.push(element.overhead_costs)
            table.push(tableArray)
            tableArray = []
        })
        console.log(table.toString());
        inquirer.prompt([
            {
                type: 'input',
                message: 'Which Department do you want to update?',
                name: 'dept',
                validate: common.validateNum
            },
            {
                type: 'input',
                message: 'What are the new overhead costs?',
                name: 'costs',
                validate: common.validateNum
            }]).then (update => {
                connection.query("UPDATE departments SET ? WHERE ?", 
                [{overhead_costs: update.costs},{department_id: update.dept}], 
                function(err, results)  {
                    if (err) throw err
                    console.log(`Deparment ID ${update.dept} with overhead costs ${update.costs}.`)
                    supervisorMenu()
                } )
            })
    })
}

const addDepartment = () => {
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
                    if (confirm.confirmation) {
                        connection.query("INSERT INTO departments SET ?",
                        newDept, function(err,res) {
                            if (err) throw err
                            console.log (res.affectedRows + " departments added.")
                            supervisorMenu()
                        })
                    }
                })
        })
}