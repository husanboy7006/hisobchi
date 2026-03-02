const db = require('../config/db');

// Helper to determine unit based on sector (fallback)
const getUnitForSector = (sector) => {
    switch (sector) {
        case 'bozor': return 'kg';
        case 'qurilish': return 'metr';
        case 'avto': return 'dona';
        default: return 'dona';
    }
};

exports.createProduct = async (req, res) => {
    const { name, sell_price, buy_price = 0, stock = 0, stock_alert = 5, unit } = req.body;
    try {
        const user = await db.query(
            'SELECT u.role, b.sector FROM users u JOIN businesses b ON u.business_id = b.id WHERE u.id = $1',
            [req.user.id]
        );
        if (user.rows.length === 0) return res.status(404).json({ message: "User not found" });

        const productUnit = unit || getUnitForSector(user.rows[0].sector);

        const newProduct = await db.query(
            `INSERT INTO products (business_id, name, unit, stock, stock_alert, sell_price, buy_price, created_by) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [req.user.business_id, name, productUnit, stock, stock_alert, sell_price, buy_price, req.user.id]
        );

        // Audit log
        await db.query(
            `INSERT INTO audit_logs (business_id, user_id, action, entity_type, entity_id, details) 
             VALUES ($1, $2, 'CREATE', 'PRODUCT', $3, $4)`,
            [req.user.business_id, req.user.id, newProduct.rows[0].id, newProduct.rows[0]]
        );

        res.json(newProduct.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.getProducts = async (req, res) => {
    try {
        const { search = '', page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;

        const query = `
            SELECT * FROM products 
            WHERE business_id = $1 AND name ILIKE $2
            ORDER BY created_at DESC
            LIMIT $3 OFFSET $4
        `;
        const products = await db.query(query, [req.user.business_id, `%${search}%`, limit, offset]);

        const totalQuery = await db.query(`SELECT COUNT(*) FROM products WHERE business_id = $1 AND name ILIKE $2`, [req.user.business_id, `%${search}%`]);

        res.json({
            data: products.rows,
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

exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, unit, sell_price, buy_price, stock, stock_alert } = req.body;
    try {
        const product = await db.query(
            `UPDATE products SET name = COALESCE($1, name), unit = COALESCE($2, unit), 
             sell_price = COALESCE($3, sell_price), buy_price = COALESCE($4, buy_price), 
             stock = COALESCE($5, stock), stock_alert = COALESCE($6, stock_alert), updated_at = CURRENT_TIMESTAMP 
             WHERE id = $7 AND business_id = $8 RETURNING *`,
            [name, unit, sell_price, buy_price, stock, stock_alert, id, req.user.business_id]
        );

        if (product.rows.length === 0) return res.status(404).json({ message: "Product not found or not authorized" });

        // Audit log
        await db.query(
            `INSERT INTO audit_logs (business_id, user_id, action, entity_type, entity_id, details) 
             VALUES ($1, $2, 'UPDATE', 'PRODUCT', $3, $4)`,
            [req.user.business_id, req.user.id, id, product.rows[0]]
        );

        res.json(product.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await db.query('DELETE FROM products WHERE id = $1 AND business_id = $2 RETURNING *', [id, req.user.business_id]);
        if (product.rows.length === 0) return res.status(404).json({ message: "Product not found or not authorized" });

        // Audit log
        await db.query(
            `INSERT INTO audit_logs (business_id, user_id, action, entity_type, entity_id, details) 
             VALUES ($1, $2, 'DELETE', 'PRODUCT', $3, $4)`,
            [req.user.business_id, req.user.id, id, { deleted_name: product.rows[0].name }]
        );

        res.json({ message: "Product deleted" });
    } catch (err) {
        console.error(err.message);
        if (err.code === '23503') {
            return res.status(400).json({ message: "Cannot delete product because it is used in existing sales." });
        }
        res.status(500).send('Server error');
    }
};
