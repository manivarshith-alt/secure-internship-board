const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// Request Logging Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} request to ${req.url}`);
    next();
});

// Explicit CORS configuration
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet());
app.use(express.json());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use(limiter);

// Database Setup
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS internships (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            domain TEXT NOT NULL,
            mode TEXT NOT NULL,
            location TEXT NOT NULL,
            openings INTEGER NOT NULL,
            skills TEXT
        )`, (createErr) => {
            if (!createErr) {
                db.get(`SELECT COUNT(*) as count FROM internships`, (countErr, row) => {
                    if (row && row.count === 0) {
                        const stmt = db.prepare(`INSERT INTO internships (title, domain, mode, location, openings, skills) VALUES (?, ?, ?, ?, ?, ?)`);
                        stmt.run(['Frontend Intern', 'Full Stack Development', 'Remote (India)', 'Remote (India)', 3, '["HTML", "CSS", "JavaScript"]']);
                        stmt.run(['API Engineering Intern', 'Full Stack Development', 'Hybrid (Pune)', 'Pune', 2, '["Node.js", "SQL"]']);
                        stmt.run(['Data Analyst Intern', 'Data Analytics', 'On-site (Bengaluru)', 'Bengaluru', 2, '["Excel", "SQL", "Data Visualization"]']);
                        stmt.finalize();
                        console.log('Database seeded successfully.');
                    }
                });
            }
        });
    }
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// GET Internships Endpoint
app.get('/api/internships', (req, res) => {
    db.all(`SELECT * FROM internships`, [], (err, rows) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        const formattedRows = rows.map(row => ({
            ...row,
            skills: row.skills ? JSON.parse(row.skills) : []
        }));
        res.json({ success: true, data: formattedRows });
    });
});

// POST Application Submission Endpoint
app.post('/api/applications', (req, res) => {
    const { name, email, internshipId } = req.body;

    if (!name || !email || !internshipId) {
        return res.status(400).json({ success: false, error: 'All fields are required.' });
    }

    db.run(
        `CREATE TABLE IF NOT EXISTS applications (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, internship_id INTEGER)`,
        () => {
            db.run(
                `INSERT INTO applications (name, email, internship_id) VALUES (?, ?, ?)`,
                [name, email, internshipId],
                function (err) {
                    if (err) return res.status(500).json({ success: false, error: err.message });
                    res.status(201).json({ success: true, message: 'Application submitted successfully!' });
                }
            );
        }
    );
});

app.listen(PORT, () => {
    console.log(`Server running on http://127.0.0.1:${PORT}`);
});