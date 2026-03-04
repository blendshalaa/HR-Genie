const pool = require('../config/database');

// --- JOB POSTINGS ---

const getAllJobs = async (req, res, next) => {
    try {
        const { status } = req.query;
        let query = `
      SELECT j.*, d.name as department_name 
      FROM job_postings j
      LEFT JOIN departments d ON j.department_id = d.id
    `;
        const params = [];

        if (status) {
            query += ` WHERE j.status = $1`;
            params.push(status);
        }

        query += ` ORDER BY j.created_at DESC`;

        const result = await pool.query(query, params);
        res.json({ jobs: result.rows });
    } catch (error) {
        next(error);
    }
};

const getJobById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT j.*, d.name as department_name 
       FROM job_postings j
       LEFT JOIN departments d ON j.department_id = d.id
       WHERE j.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Job posting not found' });
        }
        res.json({ job: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

const createJob = async (req, res, next) => {
    try {
        const { title, department_id, description, requirements, status } = req.body;

        if (!title || !description) {
            return res.status(400).json({ error: 'Title and description are required' });
        }

        const insertResult = await pool.query(
            `INSERT INTO job_postings (title, department_id, description, requirements, status) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [title, department_id || null, description, requirements || '', status || 'open']
        );

        const jobId = insertResult.rows[0].id;
        const result = await pool.query(
            `SELECT j.*, d.name as department_name 
       FROM job_postings j
       LEFT JOIN departments d ON j.department_id = d.id
       WHERE j.id = $1`,
            [jobId]
        );

        res.status(201).json({ job: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

const updateJob = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, department_id, description, requirements, status } = req.body;

        const updates = [];
        const params = [];
        let paramCount = 1;

        if (title) { updates.push(`title = $${paramCount}`); params.push(title); paramCount++; }
        if (department_id !== undefined) { updates.push(`department_id = $${paramCount}`); params.push(department_id); paramCount++; }
        if (description) { updates.push(`description = $${paramCount}`); params.push(description); paramCount++; }
        if (requirements !== undefined) { updates.push(`requirements = $${paramCount}`); params.push(requirements); paramCount++; }
        if (status) {
            updates.push(`status = $${paramCount}`);
            params.push(status);
            paramCount++;
            if (status === 'closed') {
                updates.push(`closed_at = CURRENT_TIMESTAMP`);
            } else if (status === 'open') {
                updates.push(`closed_at = NULL`);
            }
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        params.push(id);
        const result = await pool.query(
            `UPDATE job_postings SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            params
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Job posting not found' });
        }

        res.json({ message: 'Job updated successfully', job: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

// --- APPLICATIONS ---

const getAllApplications = async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT a.*, j.title as job_title, j.department_id
       FROM applications a
       JOIN job_postings j ON a.job_id = j.id
       ORDER BY a.applied_at DESC`
        );
        res.json({ applications: result.rows });
    } catch (error) {
        next(error);
    }
};

const getApplicationsForJob = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const result = await pool.query(
            `SELECT * FROM applications WHERE job_id = $1 ORDER BY applied_at DESC`,
            [jobId]
        );
        res.json({ applications: result.rows });
    } catch (error) {
        next(error);
    }
};

const submitApplication = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const { applicant_name, email, resume_url } = req.body;

        if (!applicant_name || !email) {
            return res.status(400).json({ error: 'Applicant name and email are required' });
        }

        const jobCheck = await pool.query('SELECT * FROM job_postings WHERE id = $1', [jobId]);
        if (jobCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Job posting not found' });
        }

        const result = await pool.query(
            `INSERT INTO applications (job_id, applicant_name, email, resume_url, status)
       VALUES ($1, $2, $3, $4, 'applied') RETURNING *`,
            [jobId, applicant_name, email, resume_url || null]
        );

        res.status(201).json({ message: 'Application submitted successfully', application: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

const updateApplicationStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['applied', 'interviewing', 'hired', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const result = await pool.query(
            `UPDATE applications SET status = $1 WHERE id = $2 RETURNING *`,
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        res.json({ message: 'Application status updated', application: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllJobs,
    getJobById,
    createJob,
    updateJob,
    getAllApplications,
    getApplicationsForJob,
    submitApplication,
    updateApplicationStatus
};
