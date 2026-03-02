import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '30s', target: 50 },  // Ramp-up: 50 virtual users
        { duration: '3m', target: 50 },   // Maintain 50 virtual users for 3 minutes
        { duration: '1m', target: 100 },  // Stress peak: 100 virtual users
        { duration: '30s', target: 0 },   // Ramp-down to 0 users
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
        http_req_failed: ['rate<0.01'],   // Error rate must be < 1%
    },
};

const BASE_URL = 'http://localhost:5000/api';
const TEST_PHONE = '+998900000000'; // Make sure this user exists in DB or register it prior to test
const TEST_PASSWORD = 'password123';

export default function () {
    // 1. Auth Flow
    let loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
        phone: TEST_PHONE,
        password: TEST_PASSWORD
    }), { headers: { 'Content-Type': 'application/json' } });

    check(loginRes, {
        'logged in successfully': (r) => r.status === 200,
        'has token': (r) => r.json('token') !== undefined,
    });

    let token = '';
    if (loginRes.status === 200) {
        token = loginRes.json('token');
    }

    const authHeaders = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    };

    sleep(1);

    // 2. Fetch Dashboard (Should be incredibly fast due to Redis caching)
    if (token) {
        let dashRes = http.get(`${BASE_URL}/dashboard`, authHeaders);
        check(dashRes, {
            'dashboard loaded': (r) => r.status === 200,
            'dashboard fast': (r) => r.timings.duration < 200
        });

        sleep(1);

        // 3. Fetch Products List
        let prodRes = http.get(`${BASE_URL}/products?page=1&limit=50`, authHeaders);
        check(prodRes, {
            'products loaded': (r) => r.status === 200,
        });

        sleep(1);

        // 4. Fetch Sales List
        let salesRes = http.get(`${BASE_URL}/sales?page=1&limit=50`, authHeaders);
        check(salesRes, {
            'sales loaded': (r) => r.status === 200,
        });

        sleep(1);
    }
}
