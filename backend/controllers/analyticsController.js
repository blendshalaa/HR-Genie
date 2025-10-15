const pool = require('../config/database');

const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const isAdmin = ['admin', 'hr'].includes(req.user.role);

    let totalUsers = 0;
    if (isAdmin) {
      const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
      totalUsers = parseInt(usersResult.rows[0].count);
    }

    let pendingLeaveQuery = 'SELECT COUNT(*) as count FROM leave_requests WHERE status = $1';
    const pendingLeaveParams = ['pending'];
    
    if (!isAdmin) {
      pendingLeaveQuery += ' AND user_id = $2';
      pendingLeaveParams.push(userId);
    }
    
    const pendingLeaveResult = await pool.query(pendingLeaveQuery, pendingLeaveParams);
    const pendingLeave = parseInt(pendingLeaveResult.rows[0].count);

    const conversationsResult = await pool.query(
      'SELECT COUNT(*) as count FROM conversations WHERE user_id = $1',
      [userId]
    );
    const totalConversations = parseInt(conversationsResult.rows[0].count);

    const knowledgeResult = await pool.query('SELECT COUNT(*) as count FROM knowledge_base');
    const totalKnowledge = parseInt(knowledgeResult.rows[0].count);

    const chatActivityQuery = `
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM analytics_logs
      WHERE action_type = 'chat_message' AND created_at >= CURRENT_DATE - INTERVAL '7 days'
      ${isAdmin ? '' : 'AND user_id = $1'}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;
    const chatActivityParams = isAdmin ? [] : [userId];
    const chatActivity = await pool.query(chatActivityQuery, chatActivityParams);

    let topQueries = [];
    if (isAdmin) {
      const topQueriesResult = await pool.query(`
        SELECT query, COUNT(*) as count
        FROM analytics_logs
        WHERE action_type = 'chat_message' AND query IS NOT NULL
        GROUP BY query
        ORDER BY count DESC
        LIMIT 10
      `);
      topQueries = topQueriesResult.rows;
    }

    let leaveDistribution = [];
    if (isAdmin) {
      const leaveDistResult = await pool.query(`
        SELECT type, COUNT(*) as count
        FROM leave_requests
        GROUP BY type
      `);
      leaveDistribution = leaveDistResult.rows;
    }

    res.json({
      stats: {
        total_users: totalUsers,
        pending_leave_requests: pendingLeave,
        total_conversations: totalConversations,
        total_knowledge_articles: totalKnowledge
      },
      chat_activity: chatActivity.rows,
      top_queries: topQueries,
      leave_distribution: leaveDistribution
    });
  } catch (error) {
    next(error);
  }
};

const getUserActivity = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT action_type, DATE(created_at) as date, COUNT(*) as count
       FROM analytics_logs
       WHERE user_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '${parseInt(days)} days'
       GROUP BY action_type, DATE(created_at)
       ORDER BY date ASC`,
      [userId]
    );

    res.json({ activity: result.rows });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getUserActivity
};