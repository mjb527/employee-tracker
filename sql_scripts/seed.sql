USE employees;

INSERT INTO department(name)
  VALUES ('Information Technology'),
  ('Marketing'),
  ('Accounting'),
  ('Board');

INSERT INTO role(title, salary, department_id)
  VALUES
    ('CEO', 1000000, 4),
    ('Developer', 60000, 1),
    ('Help Desk', 35000, 1),
    ('Project Manager', 65000, 1),
    ('Graphic Designer', 45000, 2),
    ('Data Analyst', 70000, 2),
    ('Junior Accountant', 40000, 3),
    ('Senior Accountant', 60000, 3);

INSERT INTO employee(first_name, last_name, role_id, manager_id)
  VALUES
    ('Tony', 'Stark', 1, null),
    ('Thor', 'Odinson', 4, 1),
    ('Peter', 'Parker', 2, 2),
    ('Natasha', 'Romanov', 5, 1),
    ('Bruce', 'Banner', 6, 1);
