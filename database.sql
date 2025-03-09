-- 创建数据库
-- DROP DATABASE root;
-- DROP DATABASE my_database;
-- CREATE DATABASE my_database;

-- 选择数据库
USE Estima;

-- 创建表
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  email VARCHAR(100)
);

-- 插入数据
INSERT INTO users (name, email) VALUES
('Name A', 'Name.A@example.com'),
('Name B', 'Name.B@example.com');

-- 查询数据
SELECT * FROM users;

