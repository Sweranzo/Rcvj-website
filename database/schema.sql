CREATE DATABASE IF NOT EXISTS rcvj_company;
USE rcvj_company;

-- Admin users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'super_admin') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Jobs table
CREATE TABLE jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    company VARCHAR(200) NOT NULL,
    location VARCHAR(100) NOT NULL,
    salary_range VARCHAR(100),
    job_type ENUM('full-time', 'part-time', 'contract', 'temporary') DEFAULT 'full-time',
    description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    responsibilities TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Default admin user (password: admin123)
INSERT INTO users (username, email, password, role) VALUES 
('admin', 'admin@rcvjcompany.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin');

-- Sample jobs
INSERT INTO jobs (title, company, location, salary_range, job_type, description, requirements, responsibilities, created_by) VALUES
('Senior Web Developer', 'Tech Solutions Inc.', 'Makati, Manila', '₱60,000 - ₱80,000', 'full-time', 'We are looking for an experienced Senior Web Developer...', '5+ years experience in web development...', 'Develop and maintain web applications...', 1),
('Registered Nurse', 'Metro Medical Center', 'Quezon City', '₱35,000 - ₱45,000', 'full-time', 'Join our healthcare team as a Registered Nurse...', 'Valid nursing license...', 'Provide quality patient care...', 1);