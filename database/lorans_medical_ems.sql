-- Lorans Medical Employee Management System Database
-- Multi-location Healthcare Company Management System
-- Created for Syria Call Center (70+ sales employees) & Turkey Clinic

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- Create Database
CREATE DATABASE IF NOT EXISTS `lorans_medical_ems` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `lorans_medical_ems`;

-- ===========================
-- 1. LOCATIONS TABLE
-- ===========================
CREATE TABLE `locations` (
  `location_id` int(11) NOT NULL AUTO_INCREMENT,
  `location_name` varchar(100) NOT NULL,
  `location_code` varchar(10) NOT NULL,
  `country` varchar(50) NOT NULL,
  `city` varchar(50) NOT NULL,
  `address` text NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `timezone` varchar(50) DEFAULT 'UTC',
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`location_id`),
  UNIQUE KEY `location_code` (`location_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert Default Locations
INSERT INTO `locations` (`location_name`, `location_code`, `country`, `city`, `address`, `phone`, `email`, `timezone`) VALUES
('Syria Call Center', 'SYR-CC', 'Syria', 'Damascus', 'Damascus Business District, Syria', '+963-11-xxxxxxx', 'syria@loransmedical.com', 'Asia/Damascus'),
('Turkey Clinic', 'TUR-CL', 'Turkey', 'Istanbul', 'Medical District, Istanbul, Turkey', '+90-212-xxxxxxx', 'turkey@loransmedical.com', 'Europe/Istanbul');

-- ===========================
-- 2. DEPARTMENTS TABLE
-- ===========================
CREATE TABLE `departments` (
  `department_id` int(11) NOT NULL AUTO_INCREMENT,
  `department_name` varchar(100) NOT NULL,
  `department_code` varchar(20) NOT NULL,
  `location_id` int(11) NOT NULL,
  `manager_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `budget` decimal(12,2) DEFAULT '0.00',
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`department_id`),
  KEY `location_id` (`location_id`),
  KEY `manager_id` (`manager_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert Default Departments
INSERT INTO `departments` (`department_name`, `department_code`, `location_id`, `description`) VALUES
('Sales Team', 'SALES', 1, 'Customer outreach and sales operations'),
('Call Center Operations', 'CALL-OPS', 1, 'Customer service and support calls'),
('Medical Services', 'MED-SRV', 2, 'Clinical and medical services'),
('Administration', 'ADMIN', 1, 'Administrative and support functions'),
('Human Resources', 'HR', 1, 'Employee management and HR operations');

-- ===========================
-- 3. EMPLOYEES TABLE
-- ===========================
CREATE TABLE `employees` (
  `employee_id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_code` varchar(20) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `hire_date` date NOT NULL,
  `location_id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL,
  `position` varchar(100) NOT NULL,
  `employee_type` enum('full_time','part_time','contract','intern') DEFAULT 'full_time',
  `salary_type` enum('monthly','hourly','commission') DEFAULT 'monthly',
  `base_salary` decimal(10,2) DEFAULT '0.00',
  `commission_rate` decimal(5,2) DEFAULT '0.00',
  `manager_id` int(11) DEFAULT NULL,
  `status` enum('active','inactive','terminated') DEFAULT 'active',
  `profile_image` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `emergency_contact` varchar(100) DEFAULT NULL,
  `emergency_phone` varchar(20) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`employee_id`),
  UNIQUE KEY `employee_code` (`employee_code`),
  UNIQUE KEY `email` (`email`),
  KEY `location_id` (`location_id`),
  KEY `department_id` (`department_id`),
  KEY `manager_id` (`manager_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================
-- 4. USERS TABLE (Login System)
-- ===========================
CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('super_admin','admin','hr_manager','department_head','employee') DEFAULT 'employee',
  `permissions` text DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `login_attempts` int(11) DEFAULT '0',
  `account_locked` tinyint(1) DEFAULT '0',
  `password_reset_token` varchar(255) DEFAULT NULL,
  `password_reset_expires` timestamp NULL DEFAULT NULL,
  `status` enum('active','inactive','suspended') DEFAULT 'active',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `employee_id` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================
-- 5. ATTENDANCE TABLE
-- ===========================
CREATE TABLE `attendance` (
  `attendance_id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `clock_in` time DEFAULT NULL,
  `clock_out` time DEFAULT NULL,
  `break_start` time DEFAULT NULL,
  `break_end` time DEFAULT NULL,
  `total_hours` decimal(4,2) DEFAULT '0.00',
  `overtime_hours` decimal(4,2) DEFAULT '0.00',
  `status` enum('present','absent','late','half_day','holiday') DEFAULT 'present',
  `notes` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`attendance_id`),
  UNIQUE KEY `employee_date` (`employee_id`, `date`),
  KEY `employee_id` (`employee_id`),
  KEY `date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================
-- 6. LEAVE REQUESTS TABLE
-- ===========================
CREATE TABLE `leave_requests` (
  `leave_id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `leave_type` enum('annual','sick','emergency','maternity','unpaid') NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `days_requested` int(11) NOT NULL,
  `reason` text DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `comments` text DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`leave_id`),
  KEY `employee_id` (`employee_id`),
  KEY `approved_by` (`approved_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================
-- 7. PAYROLL TABLE
-- ===========================
CREATE TABLE `payroll` (
  `payroll_id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `pay_period_start` date NOT NULL,
  `pay_period_end` date NOT NULL,
  `base_salary` decimal(10,2) NOT NULL DEFAULT '0.00',
  `overtime_pay` decimal(10,2) DEFAULT '0.00',
  `commission` decimal(10,2) DEFAULT '0.00',
  `bonuses` decimal(10,2) DEFAULT '0.00',
  `deductions` decimal(10,2) DEFAULT '0.00',
  `gross_pay` decimal(10,2) NOT NULL DEFAULT '0.00',
  `tax_deduction` decimal(10,2) DEFAULT '0.00',
  `net_pay` decimal(10,2) NOT NULL DEFAULT '0.00',
  `payment_status` enum('pending','paid','cancelled') DEFAULT 'pending',
  `payment_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`payroll_id`),
  KEY `employee_id` (`employee_id`),
  KEY `pay_period` (`pay_period_start`, `pay_period_end`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================
-- 8. SALES PERFORMANCE TABLE
-- ===========================
CREATE TABLE `sales_performance` (
  `performance_id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `calls_made` int(11) DEFAULT '0',
  `calls_answered` int(11) DEFAULT '0',
  `appointments_set` int(11) DEFAULT '0',
  `sales_closed` int(11) DEFAULT '0',
  `revenue_generated` decimal(12,2) DEFAULT '0.00',
  `call_duration_minutes` int(11) DEFAULT '0',
  `conversion_rate` decimal(5,2) DEFAULT '0.00',
  `notes` text DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`performance_id`),
  UNIQUE KEY `employee_date` (`employee_id`, `date`),
  KEY `employee_id` (`employee_id`),
  KEY `date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================
-- 9. SYSTEM LOGS TABLE
-- ===========================
CREATE TABLE `system_logs` (
  `log_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `module` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  KEY `user_id` (`user_id`),
  KEY `action` (`action`),
  KEY `created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================
-- 10. NOTIFICATIONS TABLE
-- ===========================
CREATE TABLE `notifications` (
  `notification_id` int(11) NOT NULL AUTO_INCREMENT,
  `recipient_id` int(11) NOT NULL,
  `sender_id` int(11) DEFAULT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','success','warning','error') DEFAULT 'info',
  `category` enum('system','payroll','attendance','leave','performance') DEFAULT 'system',
  `is_read` tinyint(1) DEFAULT '0',
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notification_id`),
  KEY `recipient_id` (`recipient_id`),
  KEY `sender_id` (`sender_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================
-- ADD FOREIGN KEY CONSTRAINTS
-- ===========================
ALTER TABLE `departments`
  ADD CONSTRAINT `fk_dept_location` FOREIGN KEY (`location_id`) REFERENCES `locations` (`location_id`) ON DELETE CASCADE;

ALTER TABLE `employees`
  ADD CONSTRAINT `fk_emp_location` FOREIGN KEY (`location_id`) REFERENCES `locations` (`location_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_emp_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`) ON DELETE CASCADE;

ALTER TABLE `users`
  ADD CONSTRAINT `fk_user_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE;

ALTER TABLE `attendance`
  ADD CONSTRAINT `fk_att_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE;

ALTER TABLE `leave_requests`
  ADD CONSTRAINT `fk_leave_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE;

ALTER TABLE `payroll`
  ADD CONSTRAINT `fk_payroll_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE;

ALTER TABLE `sales_performance`
  ADD CONSTRAINT `fk_perf_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE;

-- ===========================
-- INSERT SAMPLE DATA
-- ===========================

-- Sample Admin User
INSERT INTO `employees` (`employee_code`, `first_name`, `last_name`, `email`, `phone`, `hire_date`, `location_id`, `department_id`, `position`, `base_salary`) VALUES
('EMP001', 'Ahmad', 'Al-Manager', 'admin@loransmedical.com', '+963-11-1234567', '2020-01-01', 1, 5, 'General Manager', 5000.00);

INSERT INTO `users` (`employee_id`, `username`, `password_hash`, `role`) VALUES
(1, 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin');

COMMIT;