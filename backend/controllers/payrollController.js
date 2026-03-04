const pool = require('../config/database');

const getAllPayrolls = async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT p.*, u.name as employee_name, u.email 
       FROM payroll p
       JOIN users u ON p.user_id = u.id
       ORDER BY p.pay_period_end DESC`
        );
        res.json({ payrolls: result.rows });
    } catch (error) {
        next(error);
    }
};

const getPayrollById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT p.*, u.name as employee_name, u.email 
       FROM payroll p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Payroll record not found' });
        }

        // Role check: Only admin/hr or the employee themselves can view this
        if (req.user.role !== 'admin' && req.user.role !== 'hr' && req.user.id !== result.rows[0].user_id) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        res.json({ payroll: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

const getPayrollByUser = async (req, res, next) => {
    try {
        const { userId } = req.params;

        // Role check
        if (req.user.role !== 'admin' && req.user.role !== 'hr' && req.user.id !== parseInt(userId)) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const result = await pool.query(
            `SELECT * FROM payroll WHERE user_id = $1 ORDER BY pay_period_end DESC`,
            [userId]
        );

        res.json({ payrolls: result.rows });
    } catch (error) {
        next(error);
    }
};

const createPayroll = async (req, res, next) => {
    try {
        const { user_id, base_salary, bonus, tax_deduction, pay_period_start, pay_period_end } = req.body;

        if (!user_id || !base_salary || !pay_period_start || !pay_period_end) {
            return res.status(400).json({ error: 'Missing required payroll fields' });
        }

        const insertResult = await pool.query(
            `INSERT INTO payroll (user_id, base_salary, bonus, tax_deduction, pay_period_start, pay_period_end) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            [user_id, base_salary, bonus || 0, tax_deduction || 0, pay_period_start, pay_period_end]
        );

        const payrollId = insertResult.rows[0].id;
        const result = await pool.query(
            `SELECT p.*, u.name as employee_name, u.email 
       FROM payroll p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
            [payrollId]
        );

        res.status(201).json({ payroll: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

const updatePayrollStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'paid'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const result = await pool.query(
            `UPDATE payroll SET status = $1 WHERE id = $2 RETURNING *`,
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Payroll record not found' });
        }

        res.json({ message: 'Payroll status updated', payroll: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllPayrolls,
    getPayrollById,
    getPayrollByUser,
    createPayroll,
    updatePayrollStatus
};
