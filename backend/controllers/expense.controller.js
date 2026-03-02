const db = require('../config/db');

exports.createExpense = async (req, res) => {
    const { title, amount, category = 'OTHER' } = req.body;
    try {
        const newExpense = await db.query(
            'INSERT INTO expenses (business_id, title, amount, category, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [req.user.business_id, title, amount, category, req.user.id]
        );

        // Audit log
        await db.query(
            `INSERT INTO audit_logs (business_id, user_id, action, entity_type, entity_id, details) 
             VALUES ($1, $2, 'CREATE', 'EXPENSE', $3, $4)`,
            [req.user.business_id, req.user.id, newExpense.rows[0].id, newExpense.rows[0]]
        );

        // Cache invalidation
        const cacheService = require('../services/cache.service');
        await cacheService.invalidateCache(`dashboard:${req.user.business_id}`);

        res.json(newExpense.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.getExpenses = async (req, res) => {
    try {
        // filter: 'bugun', 'hafta', 'oy', 'barchasi'
        const { filter = 'bugun', page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;

        let dateCondition = '';
        let queryParams = [req.user.business_id];
        let pIndex = 2;

        if (filter === 'bugun') {
            dateCondition = `AND DATE(created_at) = CURRENT_DATE`;
        } else if (filter === 'hafta') {
            dateCondition = `AND created_at >= CURRENT_DATE - INTERVAL '6 days'`;
        } else if (filter === 'oy') {
            dateCondition = `AND created_at >= date_trunc('month', CURRENT_DATE)`;
        }

        const query = `
            SELECT * FROM expenses 
            WHERE business_id = $1 ${dateCondition}
            ORDER BY created_at DESC
            LIMIT $${pIndex} OFFSET $${pIndex + 1}
        `;
        queryParams.push(limit, offset);

        const expenses = await db.query(query, queryParams);

        // Count query
        const countQuery = `SELECT COUNT(*) FROM expenses WHERE business_id = $1 ${dateCondition}`;
        const totalQuery = await db.query(countQuery, [req.user.business_id]);

        res.json({
            data: expenses.rows,
            pagination: {
                total: parseInt(totalQuery.rows[0].count),
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
