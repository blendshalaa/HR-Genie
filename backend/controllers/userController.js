const pool = require('../config/database');

const getAllUsers = async (req, res, next) => {
  try {
    const { department, role } = req.query;

    let query = `
      SELECT id, email, name, department, role, hire_date, 
             sick_leave_balance, vacation_balance, created_at
      FROM users
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (department) {
      query += ` AND department = ${paramCount}`;
      params.push(department);
      paramCount++;
    }

    if (role) {
      query += ` AND role = ${paramCount}`;
      params.push(role);
      paramCount++;
    }

    query += ' ORDER BY name ASC';

    const result = await pool.query(query, params);

    res.json({ users: result.rows });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, email, name, department, role, hire_date,
              sick_leave_balance, vacation_balance, created_at
       FROM users WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, department, role, sick_leave_balance, vacation_balance } = req.body;

    if (req.user.id !== parseInt(id) && !['admin', 'hr'].includes(req.user.role)) {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }

    const updates = [];
    const params = [];
    let paramCount = 1;

    if (name) {
      updates.push(`name = ${paramCount}`);
      params.push(name);
      paramCount++;
    }

    if (department && ['admin', 'hr'].includes(req.user.role)) {
      updates.push(`department = ${paramCount}`);
      params.push(department);
      paramCount++;
    }

    if (role && req.user.role === 'admin') {
      updates.push(`role = ${paramCount}`);
      params.push(role);
      paramCount++;
    }

    if (sick_leave_balance !== undefined && ['admin', 'hr'].includes(req.user.role)) {
      updates.push(`sick_leave_balance = ${paramCount}`);
      params.push(sick_leave_balance);
      paramCount++;
    }

    if (vacation_balance !== undefined && ['admin', 'hr'].includes(req.user.role)) {
      updates.push(`vacation_balance = ${paramCount}`);
      params.push(vacation_balance);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    params.push(id);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ${paramCount} RETURNING *`;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser
};