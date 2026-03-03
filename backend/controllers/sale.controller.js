const db = require('../config/db');

// Helper to parse "2 olma" format
const parseSaleInput = (input) => {
    const parts = input.trim().split(' ');
    if (parts.length < 2) return null;

    const quantity = parseFloat(parts[0]);
    if (isNaN(quantity)) return null;

    const productName = parts.slice(1).join(' ').trim();

    return { quantity, productName };
};

exports.createSale = async (req, res) => {
    const { items_text } = req.body; // array of strings: e.g., ["2 olma", "3 banan"]
    const business_id = req.user.business_id;

    try {
        let totalAmount = 0;
        const processedItems = [];
        const notFoundProducts = [];

        // 1. Parse and validate all items first
        for (const text of items_text) {
            const parsed = parseSaleInput(text);
            if (!parsed) {
                return res.status(400).json({ message: `Noto'g'ri format: "${text}". Kutilgan format: "Soni Nomi" (Masalan: 2 olma)` });
            }

            // Find product in DB (using ILIKE for case-insensitive match)
            const productQuery = await db.query(
                `SELECT id, sell_price, stock FROM products WHERE business_id = $1 AND name ILIKE $2`,
                [business_id, parsed.productName]
            );

            if (productQuery.rows.length === 0) {
                notFoundProducts.push(parsed.productName);
                continue;
            }

            const product = productQuery.rows[0];
            const price = parseFloat(product.sell_price);
            const itemTotal = price * parsed.quantity;

            totalAmount += itemTotal;
            processedItems.push({
                product_id: product.id,
                quantity: parsed.quantity,
                price: price,
                stock: parseFloat(product.stock)
            });
        }

        if (notFoundProducts.length > 0) {
            return res.status(404).json({
                error: 'PRODUCTS_NOT_FOUND',
                not_found: notFoundProducts,
                message: `Quyidagi mahsulotlar topilmadi: ${notFoundProducts.join(', ')}. Iltimos avval baza ro'yxatiga qo'shing.`
            });
        }

        // 2. Insert into Sales table
        const saleResult = await db.query(
            'INSERT INTO sales (business_id, cashier_id, total_amount) VALUES ($1, $2, $3) RETURNING id',
            [business_id, req.user.id, totalAmount]
        );
        const saleId = saleResult.rows[0].id;

        // 3. Insert into Sale Items table & Deduct Stock
        for (const item of processedItems) {
            await db.query(
                'INSERT INTO sale_items (sale_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
                [saleId, item.product_id, item.quantity, item.price]
            );

            // Deduct stock
            await db.query(
                'UPDATE products SET stock = stock - $1 WHERE id = $2',
                [item.quantity, item.product_id]
            );
        }

        // Audit log
        await db.query(
            `INSERT INTO audit_logs (business_id, user_id, action, entity_type, entity_id, details) 
             VALUES ($1, $2, 'CREATE', 'SALE', $3, $4)`,
            [business_id, req.user.id, saleId, { total: totalAmount, items_count: processedItems.length }]
        );

        // Cache invalidation
        const cacheService = require('../services/cache.service');
        await cacheService.invalidateCache(`dashboard:${business_id}`);

        res.json({ message: "Savdo muvaffaqiyatli saqlandi", sale_id: saleId, total_amount: totalAmount });

    } catch (err) {
        console.error('Sale error:', err.message);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};

exports.getSales = async (req, res) => {
    try {
        const { search = '', page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;

        const sales = await db.query(
            `SELECT s.id, s.total_amount, s.created_at, u.first_name as cashier_name,
                json_agg(json_build_object('product_name', p.name, 'quantity', si.quantity, 'price', si.price, 'total', si.total, 'unit', p.unit)) as items
             FROM sales s
             LEFT JOIN sale_items si ON s.id = si.sale_id
             LEFT JOIN products p ON si.product_id = p.id
             LEFT JOIN users u ON s.cashier_id = u.id
             WHERE s.business_id = $1
             GROUP BY s.id, u.first_name
             ORDER BY s.created_at DESC
             LIMIT $2 OFFSET $3`,
            [req.user.business_id, limit, offset]
        );

        const totalQuery = await db.query(`SELECT COUNT(*) FROM sales WHERE business_id = $1`, [req.user.business_id]);

        res.json({
            data: sales.rows,
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
