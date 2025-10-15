const pool = require('../config/database');

const getMyLeaveRequests = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT lr.*, u.name as approver_name
       FROM leave_requests lr
       LEFT JOIN users u ON lr.approved_by = u.id
       WHERE lr.user_id = $1
       ORDER BY lr.created_at DESC`,
      [userId]
    );

    res.json({ leave_requests: result.rows });
  } catch (error) {
    next(error);
  }
};

const getAllLeaveRequests = async (req, res, next) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT lr.*, u.name as employee_name, u.department, approver.name as approver_name
      FROM leave_requests lr
      JOIN users u ON lr.user_id = u.id
      LEFT JOIN users approver ON lr.approved_by = approver.id
    `;

    const params = [];
    if (status) {
      query += ' WHERE lr.status = $1';
      params.push(status);
    }

    query += ' ORDER BY lr.created_at DESC';

    const result = await pool.query(query, params);

    res.json({ leave_requests: result.rows });
  } catch (error) {
    next(error);
  }
};

const createLeaveRequest = async (req, res, next) => {
  try {
    const { type, start_date, end_date, reason } = req.body;
    const userId = req.user.id;

    if (!type || !start_date || !end_date) {
      return res.status(400).json({ error: 'Type, start_date, and end_date are required' });
    }

    if (!['sick', 'vacation', 'personal'].includes(type)) {
      return res.status(400).json({ error: 'Invalid leave type' });
    }

    const start = new Date(start_date);
    const end = new Date(end_date);
    
    if (start > end) {
      return res.status(400).json({ error: 'Start date must be before end date' });
    }

    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const userBalance = await pool.query(
      'SELECT sick_leave_balance, vacation_balance FROM users WHERE id = $1',
      [userId]
    );

    const balance = userBalance.rows[0];
    if (type === 'sick' && balance.sick_leave_balance < days) {
      return res.status(400).json({ 
        error: 'Insufficient sick leave balance',
        current_balance: balance.sick_leave_balance,
        requested_days: days
      });
    }

    if (type === 'vacation' && balance.vacation_balance < days) {
      return res.status(400).json({ 
        error: 'Insufficient vacation balance',
        current_balance: balance.vacation_balance,
        requested_days: days
      });
    }

    const result = await pool.query(
      `INSERT INTO leave_requests (user_id, type, start_date, end_date, days, reason, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
      [userId, type, start_date, end_date, days, reason]
    );

    await pool.query(
      'INSERT INTO analytics_logs (user_id, action_type, metadata) VALUES ($1, $2, $3)',
      [userId, 'leave_request', JSON.stringify({ type, days })]
    );

    res.status(201).json({
      message: 'Leave request submitted successfully',
      leave_request: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

const updateLeaveRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const approverId = req.user.id;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved or rejected' });
    }

    const leaveRequest = await pool.query(
      'SELECT * FROM leave_requests WHERE id = $1',
      [id]
    );

    if (leaveRequest.rows.length === 0) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    const request = leaveRequest.rows[0];

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Leave request has already been processed' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        `UPDATE leave_requests 
         SET status = $1, approved_by = $2, approved_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [status, approverId, id]
      );

      if (status === 'approved') {
        const balanceField = request.type === 'sick' ? 'sick_leave_balance' : 'vacation_balance';
        await client.query(
          `UPDATE users SET ${balanceField} = ${balanceField} - $1 WHERE id = $2`,
          [request.days, request.user_id]
        );
      }

      await client.query('COMMIT');

      const updated = await pool.query('SELECT * FROM leave_requests WHERE id = $1', [id]);

      res.json({
        message: `Leave request ${status} successfully`,
        leave_request: updated.rows[0]
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

const getLeaveBalance = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT sick_leave_balance, vacation_balance FROM users WHERE id = $1',
      [userId]
    );

    res.json({ balance: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyLeaveRequests,
  getAllLeaveRequests,
  createLeaveRequest,
  updateLeaveRequestStatus,
  getLeaveBalance
};