const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

const Sentry = require("@sentry/node");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");

// Sentry should be initialized as early as possible
if (process.env.NODE_ENV === 'production') {
    Sentry.init({
        dsn: process.env.SENTRY_DSN || "https://examplePublicKey@o0.ingest.sentry.io/0",
        integrations: [
            nodeProfilingIntegration(),
        ],
        tracesSampleRate: 1.0,
        profilesSampleRate: 1.0,
    });
}

// Sentry setup handler
Sentry.setupExpressErrorHandler(app);

app.use(helmet());

const frontEndUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({
    origin: frontEndUrl,
    credentials: true,
}));

app.use(express.json());
app.set('trust proxy', 1); // If behind a reverse proxy like Render / Nginx

// Login Rate Limiter (5 requests per 15 mins)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { message: "Too many login attempts, please try again after 15 minutes" },
    standardHeaders: true,
    legacyHeaders: false,
});

// Routes
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const saleRoutes = require('./routes/sale.routes');
const expenseRoutes = require('./routes/expense.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

// Uptime and Health Checking Endpoint
const db = require('./config/db');
const cacheService = require('./services/cache.service');

app.get('/health', async (req, res) => {
    try {
        const dbClient = await db.connect();
        dbClient.release();
        const redisStatus = await cacheService.isHealthy();

        res.status(200).json({
            status: "ok",
            redis: redisStatus ? "connected" : "disconnected",
            db: "connected",
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
});

app.use('/api/auth/login', loginLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Hisobchi API' });
});


const PORT = process.env.PORT || 5000;
const logger = require('./utils/logger');

app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}. NODE_ENV is ${process.env.NODE_ENV}`);
});
