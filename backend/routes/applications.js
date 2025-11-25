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
router.delete('/:id', (req, res) => {
    const applicationId = req.params.id;

    const query = `DELETE FROM applications WHERE application_id = ?`;

    db.execute(query, [applicationId], (err, result) => {
        if (err) {
            console.error('Delete error:', err);
            return res.status(500).json({ error: 'Failed to delete application' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        res.json({ success: true, message: 'Application deleted successfully' });
    });
});

// ----------------------------------------------
// UPDATE STATUS
// ----------------------------------------------
router.put('/:id/status', (req, res) => {
    const applicationId = req.params.id;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ error: 'Status is required' });
    }

    const query = `UPDATE applications SET status = ? WHERE application_id = ?`;

    db.execute(query, [status, applicationId], (err, result) => {
        if (err) {
            console.error('Status update error:', err);
            return res.status(500).json({ error: 'Failed to update status' });
        }

        res.json({ success: true, message: 'Status updated successfully' });
    });
});

// ----------------------------------------------
// APPLY FOR JOB
// ----------------------------------------------
router.post('/apply', upload.single('resume'), async (req, res) => {
    try {
        const { name, email, phone, coverLetter, jobTitle, jobCompany, jobId } = req.body;

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
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.execute(saveQuery, [
            applicationId,
            jobId || null,
            jobTitle || '',
            jobCompany || '',
            name,
            email,
            phone,
            coverLetter || '',
            req.file.filename
        ], (err, result) => {
            if (err) {
                console.error('DB Insert Error:', err);

                // Remove uploaded file if DB failed
                if (req.file && fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }

                return res.status(500).json({ error: 'Failed to save application' });
            }

            return res.json({
                success: true,
                applicationId,
                message: 'Application submitted successfully!'
            });
        });

    } catch (err) {
        console.error('Application error:', err);

        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.status(500).json({ error: 'Unexpected error occurred' });
    }
});

// ----------------------------------------------
// GET ALL APPLICATIONS
// ----------------------------------------------
router.get('/', (req, res) => {
    db.execute(`SELECT * FROM applications ORDER BY applied_at DESC`, (err, rows) => {
        if (err) {
            console.error('Fetch applications error:', err);
            return res.status(500).json({ error: 'Failed to fetch applications' });
        }

        res.json(rows);
    });
});

module.exports = router;
