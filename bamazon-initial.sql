DROP DATABASE IF EXISTS bamazon;
CREATE DATABASE bamazon;
USE bamazon;
CREATE TABLE products (
	item_id INT NOT NULL auto_increment,
    product_name VARCHAR(50),
    department VARCHAR(20),
    price DECIMAL(10,2),
    quantity INT,
    PRIMARY KEY (item_id)
);

INSERT INTO products (product_name, department, price, quantity)
VALUES
('Headphones', 'Electronics', 15, 20),
('Backpack', 'Travel', 40, 15),
('Pandemic', 'Games', 35, 25),
('Boogie Board', 'Electronics', 20, 17),
('Paper Clips (Box of 50)', 'Office', 4, 43),
('Coffee Mug', 'Home', 10, 37),
('HP Laptop', 'Electronics', 499, 10),
('Suitcase', 'Travel', 150, 13),
('Pens (Box of 10)', 'Office', 3, 85),
('Connect 4', 'Games', 20, 14),
('File Cabinet', 'Office', 85, 7),
('Wall Decoration', 'Home', 50, 2),
('How to Code', 'Books', 29, 19),
('Tips for Clean Code', 'Books', 24, 26),
('XBox One', 'Electronics', 300, 9);
    
select * from products WHERE quantity < 5