const pool = require('../config/database');

const getAllEvents = async (req, res, next) => {
    try {
        const result = await pool.query(`SELECT * FROM calendar_events ORDER BY event_date ASC`);
        res.json({ events: result.rows });
    } catch (error) {
        next(error);
    }
};

const createEvent = async (req, res, next) => {
    try {
        const { title, description, event_date, attendees } = req.body;
        const created_by = req.user.id;

        if (!title || !event_date) {
            return res.status(400).json({ error: 'Title and event_date are required' });
        }

        const result = await pool.query(
            `INSERT INTO calendar_events (title, description, event_date, attendees, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [title, description || '', event_date, JSON.stringify(attendees || []), created_by]
        );

        res.status(201).json({ event: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

const deleteEvent = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM calendar_events WHERE id = $1 RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllEvents,
    createEvent,
    deleteEvent
};
