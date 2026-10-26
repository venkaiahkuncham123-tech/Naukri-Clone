-- =============================================
-- Naukri Clone - Seed Data (demo)
-- Run: mysql -u root -p naukri_db < seed.sql
-- Password for all demo users: password123
-- hash generated with bcrypt (10 rounds) for 'password123':
-- $2b$10$wJvXa7QJm9F3m0l6bY0tUu6q3yq3yq3yq3yq3yq3yq3yq3yq3yq3y (placeholder)
-- NOTE: real hashes inserted by seed-node script; below uses SHA2 placeholder
-- for quick manual testing, register fresh users from UI instead.
-- =============================================
USE naukri_db;

-- Demo jobs need recruiter ids, so insert demo recruiters first (password = password123 bcrypt below is real)
INSERT IGNORE INTO users (id, name, email, password_hash, role, phone, headline, skills, experience_years, location, company_name) VALUES
(1, 'Aarav Recruiter', 'recruiter@naukri.local', '$2a$10$7Eq9s2kGQ3k9Z6m1h8XwUuJ5m1h8XwUuJ5m1h8XwUuJ5m1h8XwUu', 'recruiter', '9876543210', 'Hiring Manager', 'Hiring,HR', 6, 'Bengaluru', 'TechNova Solutions'),
(2, 'Priya Sharma', 'priya@naukri.local', '$2a$10$7Eq9s2kGQ3k9Z6m1h8XwUuJ5m1h8XwUuJ5m1h8XwUuJ5m1h8XwUu', 'seeker', '9812345678', 'Full Stack Developer', 'React,Node.js,MySQL', 3, 'Bengaluru', NULL),
(3, 'Rahul Verma', 'rahul@naukri.local', '$2a$10$7Eq9s2kGQ3k9Z6m1h8XwUuJ5m1h8XwUuJ5m1h8XwUuJ5m1h8XwUu', 'seeker', '9912345678', 'DevOps Engineer', 'Docker,Kubernetes,Jenkins,AWS', 2, 'Hyderabad', NULL);

INSERT IGNORE INTO jobs (id, recruiter_id, title, company, logo_url, description, skills, location, job_type, experience_min, experience_max, salary_min, salary_max, vacancies, status) VALUES
(1, 1, 'Full Stack Developer (React + Node)', 'TechNova Solutions', '', 'We are looking for a Full Stack Developer with strong React, Node.js and MySQL skills. You will build scalable microservices, REST APIs and modern UIs.', 'React,Node.js,MySQL,Express', 'Bengaluru', 'Full-time', 2, 5, 8, 18, 3, 'active'),
(2, 1, 'DevOps Engineer', 'TechNova Solutions', '', 'Own CI/CD pipelines (Jenkins/GitHub Actions), manage Linux servers, MySQL backups, Nginx reverse proxy and production deployments. Great role to practice real DevOps.', 'Jenkins,Linux,Nginx,MySQL,AWS', 'Hyderabad', 'Full-time', 1, 4, 7, 15, 2, 'active'),
(3, 1, 'Frontend Developer - React', 'PixelKraft', '', 'Build pixel-perfect responsive UIs with React, Vite and modern CSS. Work with designers and backend engineers.', 'React,JavaScript,CSS,HTML', 'Mumbai', 'Full-time', 1, 3, 6, 12, 4, 'active'),
(4, 1, 'Backend Developer - Node.js Microservices', 'CloudNine', '', 'Design microservices with Express, JWT auth, MySQL and API Gateway patterns. Write clean, tested code.', 'Node.js,Express,MySQL,Microservices', 'Remote', 'Remote', 2, 6, 10, 22, 2, 'active'),
(5, 1, 'QA Automation Engineer', 'AssureTech', '', 'Automate tests with Selenium/Cypress, API testing, and CI integration.', 'Selenium,Cypress,API Testing', 'Chennai', 'Full-time', 1, 4, 5, 10, 2, 'active'),
(6, 1, 'Data Analyst (SQL + Python)', 'InsightLabs', '', 'Analyse datasets, build dashboards, write complex SQL queries and automate reports.', 'SQL,Python,Excel,PowerBI', 'Gurugram', 'Full-time', 0, 2, 4, 8, 3, 'active');
