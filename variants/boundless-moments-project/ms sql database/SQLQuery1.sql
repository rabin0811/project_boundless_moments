-- MSSQL TABLE SCHEMA
create database boundless_db;

use boundless_db;
-- Table for Admin Users (M5 - Security)
CREATE TABLE admin_users (
    id INT PRIMARY KEY IDENTITY(1,1),
    username NVARCHAR(50) UNIQUE NOT NULL,
    password_hash NVARCHAR(255) NOT NULL -- Store Hashed password
);

-- Table for Portfolio Items (P6 - Content Management)
CREATE TABLE portfolio_items (
    id INT PRIMARY KEY IDENTITY(1,1),
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    category NVARCHAR(50),
    image_url NVARCHAR(255) NOT NULL,
    date_created DATETIME DEFAULT GETDATE()
);

-- Table for Client Messages (P6 - Contact Form)
CREATE TABLE client_messages (
    id INT PRIMARY KEY IDENTITY(1,1),
    sender_name NVARCHAR(100) NOT NULL,
    sender_email NVARCHAR(100) NOT NULL,
    subject NVARCHAR(255),
    message NVARCHAR(MAX) NOT NULL,
    received_at DATETIME DEFAULT GETDATE()
);

-- INSERT initial admin user (MUST USE A HASHED PASSWORD)
INSERT INTO admin_users (username, password_hash)
VALUES ('admin', 'admin');


