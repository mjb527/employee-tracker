const inquirer = require('inquirer');
const mysql = require('mysql');

// create connection
const connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "rootpass",
  database: "employees"
});

// query the database and return the data
// simply communicates with db, queryText is the query passed to function
const query = queryText => {
  return new Promise( (resolve, reject) => {
    connection.query(queryText, (error, data) => {
      if(error) reject(error);
      resolve(data);
    });
  });
}

// get the criteria on start
const getCriteria = async () => {
  departments.push({"name" : "All"});
  let result = await query('SELECT * FROM department ORDER BY id;');
  for( let i = 0; i < result.length; i++ )
  departments.push(result[i]);

  roles.push({"title" : "All"});
  result = await query('SELECT * FROM role ORDER BY id;');
  for( let i = 0; i < result.length; i++ )
  roles.push(result[i]);

  employees.push({"id" : "", "first_name" : "All", "last_name" : ""});
  result = await query('SELECT * FROM employee ORDER BY id;');
  for( let i = 0; i < result.length; i++ )
  employees.push(result[i]);
}

/* get more details depending on what the selection was
* questions are in one of several predefined arrays depending
* on what they chose */
const buildQuery = async selection => {
  return new Promise( async (resolve, reject) => {
    // select the correct questions based on the selection
    switch (selection) {
      case 'View Departments':
        inquirer.prompt([
          {
            type: 'list',
            message: 'Search for department info',
            name: 'department',
            choices: departments.map( d => { return d.name } )
          }
        ])
        .then( async res => {
          if(res.department === "All")
            resolve(await query(`SELECT * FROM department`));
          else resolve(await query(`SELECT * FROM department WHERE name = '${res.department}'`));
        });
        break;

      case 'View Roles':
        inquirer.prompt([
          {
            type: 'list',
            message: 'Search for role info',
            name: 'role',
            choices: roles.map( d => { return d.title } )
          }
        ])
        .then( async res => {
          if(res.role === "All")
            resolve(await query(`SELECT * FROM role`));
          else resolve(await query(`SELECT * FROM role WHERE title = '${res.role}'`));
        });
        break;

      case 'View Employees':
        inquirer.prompt([
          {
            type: 'list',
            message: 'Search for role info',
            name: 'emp',
            choices: employees.map( e => { return e.id + " " + e.first_name + " " + e.last_name } )
          }
        ])
        .then( async res => {
          if(res.emp === " All ") {
            console.log('got to here');
            resolve(await query(`SELECT * FROM employee`));
          }

          else {
            const id = res.emp.charAt(0);
            resolve(await query(`SELECT * FROM employee WHERE id = '${id}'`));
          }
        });
        break;

      case 'Add Department':
      inquirer.prompt([
        {
          type: 'input',
          message: 'What is the new department\'s name?',
          name: 'name',
          validate : function(name) {
            const temp = departments.map( d => { return d.name.toLowerCase() });
            if(temp.indexOf(name.toLowerCase()) === -1) return true;
            else {
              console.log('\nDepartment Exists Already');
              return false;
            }
          }
        }
      ])
      .then( async res => {
        process.stdout.write("Processing...");
        let name = res.name.trim();
        name = name.toLowerCase();
        name = name.charAt(0).toUpperCase() + name.slice(1);
        // insert into db
        await query(`INSERT INTO department (name) VALUES ('${name}');`);
        const result = await query(`SELECT * FROM department ORDER BY id DESC LIMIT 1;`);
        departments.push(result[0]);

        process.stdout.clearLine();  // clear current text
        process.stdout.cursorTo(0);  // move cursor to beginning of line

        console.log("New department created: ");
        resolve(result);
      })
      .catch(err => {
        reject(err)
      });
        break;

      case 'Add Role':
        inquirer.prompt([
        {
          type: 'input',
          message: 'What is the new role\'s name?',
          name: 'name',
          validate : function(name) {
            const temp = roles.map( r => { return r.title.toLowerCase() });
            if(temp.indexOf(name.toLowerCase()) === -1) return true;
            else {
              console.log('\nRole Exists Already');
              return false;
            }
          }
        },
        {
          type: 'input',
          name: 'salary',
          message: 'What is the salary for this role?  $',
          validate: function(salary) {
            if(/^[0-9\.\,]+$/.test(salary)) return true;
            else {
              console.log("\nPlease use the proper format");
              return false;
            }
          }
        },
        {
          type: 'list',
          name: 'department',
          message: 'Select the department this role belongs to:',
          choices: departments.slice(1).map( d => { return d.id + ": " + d.name })
        }
      ])
      .then( async res => {
        process.stdout.write("Processing...");
        let name = res.name.trim();
        name = name.toLowerCase();
        name = name.charAt(0).toUpperCase() + name.slice(1);

        // get salary as variable and remove all commas
        let salary = res.salary;
        salary = salary.replace(',', '');
        console.log(salary);

        // get the id from the selected department
        let dept_id = res.department.charAt(0);

        // insert into db
        await query(`INSERT INTO role (title, salary, department_id) VALUES ('${name}', ${salary}, ${dept_id});`);
        const result = await query(`SELECT * FROM role ORDER BY id DESC LIMIT 1;`);
        departments.push(result[0]);

        process.stdout.clearLine();  // clear current text
        process.stdout.cursorTo(0);  // move cursor to beginning of line

        console.log("New role created: ");
        resolve(result);
      })
      .catch(err => {
        reject(err)
      });
        break;

      case 'Add Employee':
      inquirer.prompt([
        {
          type: 'input',
          message: 'What is the new employees\'s first name?',
          name: 'firstName',
          validate : function(firstName) {
            if( /^[a-zA-Z]+$/.test(firstName.trim()) === false ) {
              console.log("\nOnly uppercase and lowercase letters allowed");
              return false;
            }
            return true;
          }
        },
        {
          type: 'input',
          message: 'What is the new employees\'s last name?',
          name: 'lastName',
          validate : function(lastName) {
            if( /^[a-zA-Z]+$/.test(lastName.trim() ) === false) {
              console.log("\nOnly uppercase and lowercase letters allowed");
              return false;
            }
            return true;
          }
        },
        {
          type: 'list',
          name: 'role_id',
          message: 'Select the new employee\'s role:',
          choices: roles.slice(1).map( r => { return r.id + ": " + r.title })
        },
        {
          type: 'list',
          name: 'manager_id',
          message: 'Select the employee\'s manager:',
          choices: employees.slice(1).map( e => { return e.id + ": " + e.first_name + " " + e.last_name })
        }
      ])
      .then( async res => {
        process.stdout.write("Processing...");
        let {firstName, lastName, role_id, manager_id } = res;

        firstName = firstName.trim().toLowerCase();
        firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

        lastName = firstName.trim().toLowerCase();
        lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);

        role_id = manager_id.charAt(0);

        manager_id = manager_id.charAt(0);

        // insert into db
        await query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('${firstName}', '${lastName}', ${role_id}, ${manager_id});`);
        const result = await query(`SELECT * FROM role ORDER BY id DESC LIMIT 1;`);
        departments.push(result[0]);

        process.stdout.clearLine();  // clear current text
        process.stdout.cursorTo(0);  // move cursor to beginning of line

        console.log("New role created: ");
        resolve(result);
      })
      .catch(err => {
        reject(err)
      });
        break;

      case 'Update Employee':
      resolve('update an employee');
      break;
      default:
      reject('Something went wrong :(');
      break;

    }

  });
}

// prompt the user for what they would like to do
const init = async () => {
  // set the arrays of roles, employees, and departments for easier selection
  await getCriteria();

  inquirer.prompt([
    {
      type: 'list',
      message: 'What would you like to do?',
      name: 'selection',
      choices: [
        'Exit',
        'View Departments',
        'View Roles',
        'View Employees',
        'Add Department',
        'Add Role',
        'Add Employee',
        'Update Employee'
      ]
    }
  ])
  .then( async res => {
    if(res.selection === 'Exit') {
      console.log('Goodbye');
      process.exit();
    }
    else console.log(await buildQuery(res.selection));

    init();
  })
  .catch( err => {
    console.log(err);
  });

}

let employees = [];
let roles = [];
let departments = [];


init();
