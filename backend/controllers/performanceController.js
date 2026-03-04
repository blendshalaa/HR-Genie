const pool = require('../config/database');

const getReviewsForUser = async (req, res, next) => {
    try {
        const { userId } = req.params;

        if (req.user.role !== 'admin' && req.user.role !== 'hr' && req.user.role !== 'manager' && req.user.id !== parseInt(userId)) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const result = await pool.query(
            `SELECT pr.*, u.name as reviewer_name 
       FROM performance_reviews pr
       LEFT JOIN users u ON pr.reviewer_id = u.id
       WHERE pr.user_id = $1
       ORDER BY pr.review_date DESC`,
            [userId]
        );

        res.json({ reviews: result.rows });
    } catch (error) {
        next(error);
    }
};

const getReviewById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT pr.*, u.name as reviewer_name, emp.name as employee_name
       FROM performance_reviews pr
       LEFT JOIN users u ON pr.reviewer_id = u.id
       LEFT JOIN users emp ON pr.user_id = emp.id
       WHERE pr.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Review not found' });
        }

        const review = result.rows[0];
        if (req.user.role !== 'admin' && req.user.role !== 'hr' && req.user.role !== 'manager' && req.user.id !== review.user_id) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        res.json({ review });
    } catch (error) {
        next(error);
    }
};

const createReview = async (req, res, next) => {
    try {
        const { user_id, evaluation_criteria, rating, comments, review_date } = req.body;
        const reviewer_id = req.user.id;

        if (!user_id || !rating || !review_date) {
            return res.status(400).json({ error: 'Missing required review fields' });
        }

        const insertResult = await pool.query(
            `INSERT INTO performance_reviews (user_id, reviewer_id, evaluation_criteria, rating, comments, review_date) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            [user_id, reviewer_id, JSON.stringify(evaluation_criteria || {}), rating, comments, review_date]
        );

        const reviewId = insertResult.rows[0].id;
        const result = await pool.query(
            `SELECT pr.*, u.name as reviewer_name 
       FROM performance_reviews pr
       LEFT JOIN users u ON pr.reviewer_id = u.id
       WHERE pr.id = $1`,
            [reviewId]
        );

        res.status(201).json({ review: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

const updateReview = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { evaluation_criteria, rating, comments } = req.body;

        const result = await pool.query('SELECT * FROM performance_reviews WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Review not found' });
        }

        if (req.user.role !== 'admin' && req.user.role !== 'hr' && req.user.id !== result.rows[0].reviewer_id) {
            return res.status(403).json({ error: 'You can only update reviews you created' });
        }

        const updates = [];
        const params = [];
        let paramCount = 1;

        if (evaluation_criteria) { updates.push(`evaluation_criteria = $${paramCount}`); params.push(JSON.stringify(evaluation_criteria)); paramCount++; }
        if (rating) { updates.push(`rating = $${paramCount}`); params.push(rating); paramCount++; }
        if (comments !== undefined) { updates.push(`comments = $${paramCount}`); params.push(comments); paramCount++; }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        params.push(id);
        const updateResult = await pool.query(
            `UPDATE performance_reviews SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            params
        );

        res.json({ message: 'Review updated', review: updateResult.rows[0] });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getReviewsForUser,
    getReviewById,
    createReview,
    updateReview
};
