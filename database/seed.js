/**
 * Seed demo data with REAL bcrypt hashes.
 * Usage:
 *   cd database
 *   npm install bcryptjs mysql2   (or run from any service folder that already has them)
 *   node seed.js
 * Env vars respected: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
 */
const bcrypt = require(process.env.BCRYPT_PATH || 'bcryptjs');
const mysql = require(process.env.MYSQL_PATH || 'mysql2/promise');

(async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'naukri',
    password: process.env.DB_PASSWORD || 'naukri123',
    database: process.env.DB_NAME || 'naukri_db',
    multipleStatements: true,
  });

  const hash = await bcrypt.hash('password123', 10);
  console.log('Seeding users (password for all = password123) ...');
  await pool.query(
    `INSERT INTO users (id, name, email, password_hash, role, phone, headline, skills, experience_years, location, company_name)
     VALUES
     (1, 'Aarav Recruiter', 'recruiter@naukri.local', ?, 'recruiter', '9876543210', 'Hiring Manager', 'Hiring,HR', 6, 'Bengaluru', 'TechNova Solutions'),
     (2, 'Priya Sharma', 'priya@naukri.local', ?, 'seeker', '9812345678', 'Full Stack Developer', 'React,Node.js,MySQL', 3, 'Bengaluru', NULL),
     (3, 'Rahul Verma', 'rahul@naukri.local', ?, 'seeker', '9912345678', 'DevOps Engineer', 'Docker,Kubernetes,Jenkins,AWS', 2, 'Hyderabad', NULL)
     ON DUPLICATE KEY UPDATE name=VALUES(name), password_hash=VALUES(password_hash), role=VALUES(role)`,
    [hash, hash, hash]
  );

  console.log('Seeding jobs ...');
  await pool.query(
    `INSERT INTO jobs (id, recruiter_id, title, company, description, skills, location, job_type, experience_min, experience_max, salary_min, salary_max, vacancies, status) VALUES
     (1, 1, 'Full Stack Developer (React + Node)', 'TechNova Solutions', 'We are looking for a Full Stack Developer with strong React, Node.js and MySQL skills. You will build scalable microservices, REST APIs and modern UIs.', 'React,Node.js,MySQL,Express', 'Bengaluru', 'Full-time', 2, 5, 8, 18, 3, 'active'),
     (2, 1, 'DevOps Engineer', 'TechNova Solutions', 'Own CI/CD pipelines (Jenkins/GitHub Actions), manage Linux servers, MySQL backups, Nginx reverse proxy and production deployments. Great role to practice real DevOps.', 'Jenkins,Linux,Nginx,MySQL,AWS', 'Hyderabad', 'Full-time', 1, 4, 7, 15, 2, 'active'),
     (3, 1, 'Frontend Developer - React', 'PixelKraft', 'Build pixel-perfect responsive UIs with React, Vite and modern CSS. Work with designers and backend engineers.', 'React,JavaScript,CSS,HTML', 'Mumbai', 'Full-time', 1, 3, 6, 12, 4, 'active'),
     (4, 1, 'Backend Developer - Node.js Microservices', 'CloudNine', 'Design microservices with Express, JWT auth, MySQL and API Gateway patterns. Write clean, tested code.', 'Node.js,Express,MySQL,Microservices', 'Remote', 'Remote', 2, 6, 10, 22, 2, 'active'),
     (5, 1, 'QA Automation Engineer', 'AssureTech', 'Automate tests with Selenium/Cypress, API testing, and CI integration.', 'Selenium,Cypress,API Testing', 'Chennai', 'Full-time', 1, 4, 5, 10, 2, 'active'),
     (6, 1, 'Data Analyst (SQL + Python)', 'InsightLabs', 'Analyse datasets, build dashboards, write complex SQL queries and automate reports.', 'SQL,Python,Excel,PowerBI', 'Gurugram', 'Full-time', 0, 2, 4, 8, 3, 'active')
     ON DUPLICATE KEY UPDATE title=VALUES(title), description=VALUES(description)`
  );

  console.log('Seed done. Logins: recruiter@naukri.local / priya@naukri.local / rahul@naukri.local (password123)');
  await pool.end();
})().catch((e) => { console.error('Seed failed:', e.message); process.exit(1); });
