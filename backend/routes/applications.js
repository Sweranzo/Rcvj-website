const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/database');
const router = express.Router();

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `resume-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowed = ['.pdf', '.doc', '.docx'];
        const ext = path.extname(file.originalname).toLowerCase();

        if (!allowed.includes(ext)) {
            return cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
        }
        cb(null, true);
    }
});

// ----------------------------------------------
// DELETE APPLICATION
// ----------------------------------------------
router.delete('/:id', async (req, res) => {
    try {
        const applicationId = req.params.id;
        const query = `DELETE FROM applications WHERE application_id = $1`;
        
        const result = await db.query(query, [applicationId]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        res.json({ success: true, message: 'Application deleted successfully' });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ error: 'Failed to delete application' });
    }
});

// ----------------------------------------------
// UPDATE STATUS
// ----------------------------------------------
router.put('/:id', async (req, res) => {
    try {
        const applicationId = req.params.id;
        const { status, notes } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        const query = `UPDATE applications SET status = $1, notes = $2 WHERE application_id = $3 RETURNING *`;
        
        const result = await db.query(query, [status, notes, applicationId]);
        
        res.json({ success: true, message: 'Status updated successfully', application: result.rows[0] });
    } catch (err) {
        console.error('Status update error:', err);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// ----------------------------------------------
// APPLY FOR JOB
// ----------------------------------------------
router.post('/apply', upload.single('resume'), async (req, res) => {
    console.log('📥 Application received:', {
        name: req.body.name,
        email: req.body.email, 
        phone: req.body.phone,
        jobTitle: req.body.jobTitle,
        jobCompany: req.body.jobCompany,
        jobId: req.body.jobId,
        hasFile: !!req.file
    });

    try {
        const { name, email, phone, cover_letter, jobTitle, jobCompany, jobId } = req.body;

        if (!name || !email || !phone || !req.file) {
            return res.status(400).json({
                error: 'Name, email, phone, and resume are required'
            });
        }

        const applicationId = "APP" + Date.now();

        const saveQuery = `
            INSERT INTO applications (
                application_id,
                job_id,
                job_title,
                job_company,
                applicant_name,
                applicant_email,
                applicant_phone,
                cover_letter,
                resume_filename
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
        `;

        const result = await db.query(saveQuery, [
            applicationId,
            jobId || null,
            jobTitle || '',
            jobCompany || '',
            name,
            email,
            phone,
            cover_letter || '',
            req.file.filename
        ]);

        res.json({
            success: true,
            applicationId,
            message: 'Application submitted successfully!',
            application: result.rows[0]
        });

    } catch (err) {
        console.error('Application error:', err);

        // Remove uploaded file if DB failed
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({ error: 'Failed to save application' });
    }
});

// ----------------------------------------------
// GET ALL APPLICATIONS
// ----------------------------------------------
router.get('/', async (req, res) => {
    try {
        const result = await db.query(`SELECT * FROM applications ORDER BY applied_at DESC`);
        res.json(result.rows);
    } catch (err) {
        console.error('Fetch applications error:', err);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

module.exports = router;