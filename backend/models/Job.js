const db = require('../config/database');

class Job {
    // Get all active jobs
    static async findAll() {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM jobs WHERE is_active = TRUE ORDER BY created_at DESC';
            db.execute(query, (error, results) => {
                if (error) reject(error);
                resolve(results);
            });
        });
    }

    // Get job by ID
    static async findById(id) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM jobs WHERE id = ? AND is_active = TRUE';
            db.execute(query, [id], (error, results) => {
                if (error) reject(error);
                resolve(results[0]);
            });
        });
    }

    // Create new job
    static async create(jobData) {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO jobs (title, company, location, salary_range, job_type, 
                          description, requirements, responsibilities, created_by) 
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            
            db.execute(query, [
                jobData.title,
                jobData.company,
                jobData.location,
                jobData.salary_range,
                jobData.job_type,
                jobData.description,
                jobData.requirements,
                jobData.responsibilities,
                jobData.created_by
            ], (error, results) => {
                if (error) reject(error);
                resolve(results);
            });
        });
    }

    // Update job
    static async update(id, jobData) {
        return new Promise((resolve, reject) => {
            const query = `UPDATE jobs SET title = ?, company = ?, location = ?, salary_range = ?, 
                          job_type = ?, description = ?, requirements = ?, responsibilities = ? 
                          WHERE id = ?`;
            
            db.execute(query, [
                jobData.title,
                jobData.company,
                jobData.location,
                jobData.salary_range,
                jobData.job_type,
                jobData.description,
                jobData.requirements,
                jobData.responsibilities,
                id
            ], (error, results) => {
                if (error) reject(error);
                resolve(results);
            });
        });
    }

    // Delete job (soft delete)
    static async delete(id) {
        return new Promise((resolve, reject) => {
            const query = 'UPDATE jobs SET is_active = FALSE WHERE id = ?';
            db.execute(query, [id], (error, results) => {
                if (error) reject(error);
                resolve(results);
            });
        });
    }
}

module.exports = Job;