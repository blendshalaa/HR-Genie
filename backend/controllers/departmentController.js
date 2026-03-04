const pool = require('../config/database');

// Create a new department
const createDepartment = async (req, res, next) => {
    try {
        const { name, manager_id, description } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Department name is required' });
        }

        const insertResult = await pool.query(
            'INSERT INTO departments (name, manager_id, description) VALUES ($1, $2, $3) RETURNING id',
            [name, manager_id || null, description || '']
        );

        const deptId = insertResult.rows[0].id;
        const result = await pool.query(
            `SELECT d.*, u.name as manager_name 
       FROM departments d 
       LEFT JOIN users u ON d.manager_id = u.id
       WHERE d.id = $1`,
            [deptId]
        );

        res.status(201).json({ department: result.rows[0] });
    } catch (error) {
        if (error.code === '23505') { // unique violation
            return res.status(400).json({ error: 'Department name already exists' });
        }
        next(error);
    }
};

// Get all departments
const getAllDepartments = async (req, res, next) => {
    try {
        const allDepartments = await pool.query(
            `SELECT d.*, u.name as manager_name 
       FROM departments d 
       LEFT JOIN users u ON d.manager_id = u.id
       ORDER BY d.name ASC`
        );
        res.json({ departments: allDepartments.rows });
    } catch (error) {
        next(error);
    }
};

// Get a single department
const getDepartmentById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const department = await pool.query(
            `SELECT d.*, u.name as manager_name 
       FROM departments d 
       LEFT JOIN users u ON d.manager_id = u.id
       WHERE d.id = $1`,
            [id]
        );

        if (department.rows.length === 0) {
            return res.status(404).json({ error: 'Department not found' });
        }

        res.json({ department: department.rows[0] });
    } catch (error) {
        next(error);
    }
};

// Update a department
const updateDepartment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, manager_id, description } = req.body;

        const updates = [];
        const params = [];
        let paramCount = 1;

        if (name) {
            updates.push(`name = $${paramCount}`);
            params.push(name);
            paramCount++;
        }
        if (manager_id !== undefined) {
            updates.push(`manager_id = $${paramCount}`);
            params.push(manager_id);
            paramCount++;
        }
        if (description !== undefined) {
            updates.push(`description = $${paramCount}`);
            params.push(description);
            paramCount++;
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        params.push(id);
        const updatedDepartment = await pool.query(
            `UPDATE departments SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            params
        );

        if (updatedDepartment.rows.length === 0) {
            return res.status(404).json({ error: 'Department not found' });
        }

        res.json({
            message: 'Department updated successfully',
            department: updatedDepartment.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

// Delete a department
const deleteDepartment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedDepartment = await pool.query(
            'DELETE FROM departments WHERE id = $1 RETURNING *',
            [id]
        );

        if (deletedDepartment.rows.length === 0) {
            return res.status(404).json({ error: 'Department not found' });
        }

        res.json({ message: 'Department deleted successfully' });
    } catch (error) {
        if (error.code === '23503') { // foreign key violation
            return res.status(400).json({ error: 'Cannot delete department with assigned users or job postings' });
        }
        next(error);
    }
};

module.exports = {
    createDepartment,
    getAllDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment
};
