-- =============================================
-- Naukri Clone - MySQL Schema
-- Database: naukri_db
-- Run: mysql -u root -p < schema.sql
-- =============================================
CREATE DATABASE IF NOT EXISTS naukri_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE naukri_db;

-- Users table (used by user-service)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('seeker','recruiter') NOT NULL DEFAULT 'seeker',
  phone VARCHAR(20) DEFAULT NULL,
  headline VARCHAR(255) DEFAULT NULL,
  skills TEXT DEFAULT NULL,
  experience_years INT DEFAULT 0,
  location VARCHAR(120) DEFAULT NULL,
  company_name VARCHAR(150) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB;

-- Jobs table (used by job-service)
CREATE TABLE IF NOT EXISTS jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recruiter_id INT NOT NULL,
  title VARCHAR(180) NOT NULL,
  company VARCHAR(150) NOT NULL,
  logo_url VARCHAR(500) DEFAULT NULL,
  description TEXT NOT NULL,
  skills VARCHAR(500) DEFAULT NULL,
  location VARCHAR(120) NOT NULL DEFAULT 'Remote',
  job_type ENUM('Full-time','Part-time','Contract','Internship','Remote') NOT NULL DEFAULT 'Full-time',
  experience_min INT DEFAULT 0,
  experience_max INT DEFAULT 5,
  salary_min INT DEFAULT NULL COMMENT 'LPA * 100000? store as LPA number e.g. 6 = 6 LPA',
  salary_max INT DEFAULT NULL,
  vacancies INT DEFAULT 1,
  status ENUM('active','closed') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_title (title),
  INDEX idx_location (location),
  INDEX idx_status (status),
  INDEX idx_recruiter (recruiter_id),
  FULLTEXT INDEX ft_title_desc (title, description, skills)
) ENGINE=InnoDB;

-- Applications table (used by application-service)
CREATE TABLE IF NOT EXISTS applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  job_id INT NOT NULL,
  seeker_id INT NOT NULL,
  cover_letter TEXT DEFAULT NULL,
  resume_url VARCHAR(500) DEFAULT NULL,
  status ENUM('applied','shortlisted','rejected','hired','withdrawn') NOT NULL DEFAULT 'applied',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_job_seeker (job_id, seeker_id),
  INDEX idx_job (job_id),
  INDEX idx_seeker (seeker_id),
  INDEX idx_status (status)
) ENGINE=InnoDB;
