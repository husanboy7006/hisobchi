const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.register = async (req, res) => {
    const { phone, password, sector, first_name = '', last_name = '', business_name = '' } = req.body;

    if (!phone || !password) {
        return res.status(400).json({ message: 'Phone and password are required' });
    }

    const client = await db.connect();

    try {
        await client.query('BEGIN');

        const userExists = await client.query('SELECT id FROM users WHERE phone = $1', [phone]);
        if (userExists.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // 1. Create Business
        const bName = business_name || `${first_name}'s Business` || 'My Business';
        const newBusiness = await client.query(
            'INSERT INTO businesses (name, sector) VALUES ($1, $2) RETURNING id, name',
            [bName, sector]
        );
        const business_id = newBusiness.rows[0].id;

        // 2. Create User as OWNER
        const newUser = await client.query(
            'INSERT INTO users (business_id, phone, password_hash, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, phone, role, business_id',
            [business_id, phone, password_hash, first_name, last_name, 'OWNER']
        );
        const user = newUser.rows[0];

        // 3. Create Subscription (Free Plan)
        await client.query(
            `INSERT INTO subscriptions (business_id, plan_type, status, end_date) 
             VALUES ($1, 'FREE', 'ACTIVE', CURRENT_TIMESTAMP + interval '30 days')`,
            [business_id]
        );

        const payload = {
            user: { id: user.id, business_id: user.business_id, role: user.role }
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
        const refresh_token = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

        // Save refresh token to user_sessions
        await client.query(
            'INSERT INTO user_sessions (user_id, refresh_token, expires_at) VALUES ($1, $2, CURRENT_TIMESTAMP + interval \'7 days\')',
            [user.id, refresh_token]
        );

        await client.query('COMMIT');

        res.cookie('refreshToken', refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({ token, user });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).send('Server error');
    } finally {
        client.release();
    }
};

exports.login = async (req, res) => {
    const { phone, password } = req.body;

    try {
        const userResult = await db.query('SELECT * FROM users WHERE phone = $1', [phone]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const user = userResult.rows[0];
        if (!user.is_active) {
            return res.status(403).json({ message: 'Account is disabled' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const payload = {
            user: { id: user.id, business_id: user.business_id, role: user.role }
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
        const refresh_token = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

        await db.query(
            'INSERT INTO user_sessions (user_id, refresh_token, expires_at) VALUES ($1, $2, CURRENT_TIMESTAMP + interval \'7 days\')',
            [user.id, refresh_token]
        );

        res.cookie('refreshToken', refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        const { password_hash, ...userWithoutPassword } = user;
        res.json({ token, user: userWithoutPassword });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.logout = async (req, res) => {
    try {
        const refreshTokenCookie = req.headers.cookie?.split('; ').find(row => row.startsWith('refreshToken='))?.split('=')[1];

        if (refreshTokenCookie) {
            await db.query('DELETE FROM user_sessions WHERE refresh_token = $1', [refreshTokenCookie]);
        }
        res.clearCookie('refreshToken');
        res.json({ message: 'Logged out successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await db.query(
            `SELECT u.id, u.business_id, u.first_name, u.last_name, u.phone, u.role, u.created_at, b.name as business_name, b.sector as business_sector 
             FROM users u 
             LEFT JOIN businesses b ON u.business_id = b.id 
             WHERE u.id = $1`,
            [req.user.id]
        );
        res.json(user.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.refresh = async (req, res) => {
    try {
        const oldRefreshToken = req.headers.cookie?.split('; ').find(row => row.startsWith('refreshToken='))?.split('=')[1];

        if (!oldRefreshToken) {
            return res.status(401).json({ message: 'Refresh token not found' });
        }

        const session = await db.query('SELECT * FROM user_sessions WHERE refresh_token = $1 AND expires_at > CURRENT_TIMESTAMP', [oldRefreshToken]);

        if (session.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid or expired refresh token' });
        }

        const decoded = jwt.verify(oldRefreshToken, process.env.JWT_REFRESH_SECRET);

        const payload = {
            user: { id: decoded.user.id, business_id: decoded.user.business_id, role: decoded.user.role }
        };

        const newToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
        const newRefreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

        await db.query('DELETE FROM user_sessions WHERE refresh_token = $1', [oldRefreshToken]);
        await db.query(
            'INSERT INTO user_sessions (user_id, refresh_token, expires_at) VALUES ($1, $2, CURRENT_TIMESTAMP + interval \'7 days\')',
            [decoded.user.id, newRefreshToken]
        );

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({ token: newToken });
    } catch (err) {
        console.error(err.message);
        return res.status(401).json({ message: 'Invalid refresh token' });
    }
};
