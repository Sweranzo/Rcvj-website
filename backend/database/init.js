const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const initSQL = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    company VARCHAR(200) NOT NULL,
    location VARCHAR(100) NOT NULL,
    salary_range VARCHAR(100),
    job_type VARCHAR(20) DEFAULT 'full-time',
    description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    responsibilities TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Default admin user (password: admin123)
INSERT INTO users (username, email, password, role) VALUES 
('admin', 'admin@rcvjcompany.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin')
ON CONFLICT (username) DO NOTHING;
`;

async function initializeDatabase() {
  try {
    await pool.query(initSQL);
    console.log('✅ Database tables created successfully!');
    
    // Test data
    const jobsSQL = `
    INSERT INTO jobs (title, company, location, salary_range, job_type, description, requirements, responsibilities, created_by) VALUES
    ('Senior Web Developer', 'Tech Solutions Inc.', 'Makati, Manila', '₱60,000 - ₱80,000', 'full-time', 'We are looking for an experienced Senior Web Developer...', '5+ years experience in web development...', 'Develop and maintain web applications...', 1),
    ('Registered Nurse', 'Metro Medical Center', 'Quezon City', '₱35,000 - ₱45,000', 'full-time', 'Join our healthcare team as a Registered Nurse...', 'Valid nursing license...', 'Provide quality patient care...', 1)
    ON CONFLICT DO NOTHING;
    `;
    
    await pool.query(jobsSQL);
    console.log('✅ Sample jobs added!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  } finally {
    await pool.end();
  }
}

initializeDatabase();