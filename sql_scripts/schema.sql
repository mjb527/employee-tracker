DROP DATABASE IF EXISTS employees;
CREATE DATABASE employees;

USE employees;

CREATE TABLE department(
  id int AUTO_INCREMENT PRIMARY KEY,
  name varchar(30) NOT NULL UNIQUE
);

CREATE TABLE role(
  id int AUTO_INCREMENT PRIMARY KEY,
  title varchar(30) NOT NULL UNIQUE,
  salary decimal NOT NULL,
  department_id int,
  FOREIGN KEY (department_id) REFERENCES department(id)
);

CREATE TABLE employee(
  id int AUTO_INCREMENT PRIMARY KEY,
  first_name varchar(30) NOT NULL,
  last_name varchar(30) NOT NULL,
  role_id int NOT NULL,
  manager_id int,
  FOREIGN KEY (role_id) REFERENCES role(id),
  FOREIGN KEY (manager_id) REFERENCES employee(id)
);
