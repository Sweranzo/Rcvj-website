const db = require('../config/database');

class Job {
    // Get all active jobs
    static async findAll() {
        try {
            const query = 'SELECT * FROM jobs WHERE is_active = TRUE ORDER BY created_at DESC';
            const result = await db.query(query);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    // Get job by ID
    static async findById(id) {
        try {
            const query = 'SELECT * FROM jobs WHERE id = $1 AND is_active = TRUE';
            const result = await db.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Create new job
    static async create(jobData) {
        try {
            const query = `INSERT INTO jobs (title, company, location, salary_range, job_type, 
                          description, requirements, responsibilities, created_by) 
                          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`;
            
            const result = await db.query(query, [
                jobData.title,
                jobData.company,
                jobData.location,
                jobData.salary_range,
                jobData.job_type,
                jobData.description,
                jobData.requirements,
                jobData.responsibilities,
                jobData.created_by
            ]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Update job
    static async update(id, jobData) {
        try {
            const query = `UPDATE jobs SET title = $1, company = $2, location = $3, salary_range = $4, 
                          job_type = $5, description = $6, requirements = $7, responsibilities = $8 
                          WHERE id = $9 RETURNING *`;
            
            const result = await db.query(query, [
                jobData.title,
                jobData.company,
                jobData.location,
                jobData.salary_range,
                jobData.job_type,
                jobData.description,
                jobData.requirements,
                jobData.responsibilities,
                id
            ]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Delete job (soft delete)
    static async delete(id) {
        try {
            const query = 'UPDATE jobs SET is_active = FALSE WHERE id = $1 RETURNING *';
            const result = await db.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Job;