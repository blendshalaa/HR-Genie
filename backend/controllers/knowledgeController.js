const pool = require('../config/database');

const getAllKnowledge = async (req, res, next) => {
  try {
    const { category, search } = req.query;

    let query = 'SELECT * FROM knowledge_base WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (category) {
      query += ` AND category = ${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (search) {
      query += ` AND (title ILIKE ${paramCount} OR content ILIKE ${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);

    res.json({ knowledge: result.rows });
  } catch (error) {
    next(error);
  }
};

const getKnowledgeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM knowledge_base WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Knowledge article not found' });
    }

    res.json({ knowledge: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

const createKnowledge = async (req, res, next) => {
  try {
    const { title, content, category, tags } = req.body;
    const createdBy = req.user.id;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const result = await pool.query(
      `INSERT INTO knowledge_base (title, content, category, tags, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, content, category, tags || [], createdBy]
    );

    res.status(201).json({
      message: 'Knowledge article created successfully',
      knowledge: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

const updateKnowledge = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, category, tags } = req.body;

    const result = await pool.query(
      `UPDATE knowledge_base 
       SET title = COALESCE($1, title),
           content = COALESCE($2, content),
           category = COALESCE($3, category),
           tags = COALESCE($4, tags)
       WHERE id = $5
       RETURNING *`,
      [title, content, category, tags, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Knowledge article not found' });
    }

    res.json({
      message: 'Knowledge article updated successfully',
      knowledge: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

const deleteKnowledge = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM knowledge_base WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Knowledge article not found' });
    }

    res.json({ message: 'Knowledge article deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const searchKnowledge = async (req, res, next) => {
  try {
    const { query, category } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    let searchQuery = `
      SELECT id, title, content, category, tags
      FROM knowledge_base
      WHERE content ILIKE $1 OR title ILIKE $1
    `;
    const params = [`%${query}%`];

    if (category) {
      searchQuery += ' AND category = $2';
      params.push(category);
    }

    searchQuery += ' LIMIT 5';

    const result = await pool.query(searchQuery, params);

    await pool.query(
      'INSERT INTO analytics_logs (user_id, action_type, query) VALUES ($1, $2, $3)',
      [req.user.id, 'knowledge_search', query]
    );

    res.json({ results: result.rows });
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT category, COUNT(*) as count FROM knowledge_base GROUP BY category ORDER BY category'
    );

    res.json({ categories: result.rows });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllKnowledge,
  getKnowledgeById,
  createKnowledge,
  updateKnowledge,
  deleteKnowledge,
  searchKnowledge,
  getCategories
};