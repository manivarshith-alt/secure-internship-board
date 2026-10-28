# Secure Full-Stack Internship Board

A production-ready full-stack internship portal built with HTML, CSS, JavaScript, Node.js, Express, and SQLite.

## Architecture
- **Frontend**: Responsive UI (`index.html`, `script.js`, `style.css`).
- **Backend API**: Express REST API on Node.js.
- **Database**: SQLite database with initial seed data.
- **Security Features**:
  - Helmet.js headers
  - Express Rate Limiting
  - Parameterized SQLite queries
  - Explicit CORS allowance

## API Routes
- `GET /api/health` - Monitoring status endpoint
- `GET /api/internships` - Retrieves internship openings
- `POST /api/applications` - Submits an internship application
-