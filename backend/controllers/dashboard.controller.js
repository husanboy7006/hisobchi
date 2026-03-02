const db = require('../config/db');
const cacheService = require('../services/cache.service');

exports.getDashboardStats = async (req, res) => {
    const businessId = req.user.business_id;
    const cacheKey = `dashboard:${businessId}`;

    try {
        // 1. O'qishga urinish (Redis)
        const cachedData = await cacheService.getCache(cacheKey);
        if (cachedData) {
            return res.json(cachedData);
        }

        // 2. Keshda yo'q bo'lsa, DB dan olish
        const todaySalesResult = await db.query(
            "SELECT COALESCE(SUM(total_amount), 0) as total FROM sales WHERE business_id = $1 AND DATE(created_at) = CURRENT_DATE",
            [businessId]
        );
        const todaySales = parseFloat(todaySalesResult.rows[0].total);

        const todayExpensesResult = await db.query(
            "SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE business_id = $1 AND DATE(created_at) = CURRENT_DATE",
            [businessId]
        );
        const todayExpenses = parseFloat(todayExpensesResult.rows[0].total);

        const netProfit = todaySales - todayExpenses;

        const topProductResult = await db.query(
            `SELECT p.name, SUM(si.quantity) as total_sold
             FROM sale_items si
             JOIN sales s ON s.id = si.sale_id
             JOIN products p ON p.id = si.product_id
             WHERE s.business_id = $1
             GROUP BY p.name
             ORDER BY total_sold DESC
             LIMIT 1`,
            [businessId]
        );
        const topProduct = topProductResult.rows[0] ? topProductResult.rows[0] : null;

        const last7DaysStatsResult = await db.query(
            `WITH dates AS (
                SELECT generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day'::interval)::date AS d
             )
             SELECT 
                to_char(d.d, 'YYYY-MM-DD') AS date,
                COALESCE(SUM(s.total_amount), 0) AS sales,
                COALESCE(SUM(e.amount), 0) AS expenses
             FROM dates d
             LEFT JOIN sales s ON DATE(s.created_at) = d.d AND s.business_id = $1
             LEFT JOIN expenses e ON DATE(e.created_at) = d.d AND e.business_id = $1
             GROUP BY d.d
             ORDER BY d.d ASC`,
            [businessId]
        );

        const responseData = {
            today_sales: todaySales,
            today_expenses: todayExpenses,
            net_profit: netProfit,
            top_product: topProduct,
            chart_data: last7DaysStatsResult.rows
        };

        // 3. Olingan ma'lumotni keshga (Redis) yozish. TTL: 60 sec
        await cacheService.setCache(cacheKey, responseData, 60);

        res.json(responseData);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
