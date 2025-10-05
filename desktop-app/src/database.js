const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class Database {
    constructor(dbPath = null) {
        this.dbPath = dbPath || path.join(__dirname, '../data/lorans_medical.db');
        this.db = null;
        this.ensureDataDirectory();
    }

    ensureDataDirectory() {
        const dataDir = path.dirname(this.dbPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
    }

    async connect() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('Connected to SQLite database');
                    this.initializeDatabase().then(resolve).catch(reject);
                }
            });
        });
    }

    async initializeDatabase() {
        const schema = `
            -- Enable foreign keys
            PRAGMA foreign_keys = ON;

            -- Locations table
            CREATE TABLE IF NOT EXISTS locations (
                location_id INTEGER PRIMARY KEY AUTOINCREMENT,
                location_name VARCHAR(100) NOT NULL,
                location_code VARCHAR(10) NOT NULL UNIQUE,
                country VARCHAR(50) NOT NULL,
                city VARCHAR(50) NOT NULL,
                address TEXT NOT NULL,
                phone VARCHAR(20),
                email VARCHAR(100),
                timezone VARCHAR(50) DEFAULT 'UTC',
                status VARCHAR(10) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            -- Departments table
            CREATE TABLE IF NOT EXISTS departments (
                department_id INTEGER PRIMARY KEY AUTOINCREMENT,
                department_name VARCHAR(100) NOT NULL,
                department_code VARCHAR(20) NOT NULL,
                location_id INTEGER NOT NULL,
                manager_id INTEGER,
                description TEXT,
                budget DECIMAL(12,2) DEFAULT 0.00,
                status VARCHAR(10) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (location_id) REFERENCES locations(location_id)
            );

            -- Employees table
            CREATE TABLE IF NOT EXISTS employees (
                employee_id INTEGER PRIMARY KEY AUTOINCREMENT,
                employee_code VARCHAR(20) NOT NULL UNIQUE,
                first_name VARCHAR(50) NOT NULL,
                last_name VARCHAR(50) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                phone VARCHAR(20),
                date_of_birth DATE,
                hire_date DATE NOT NULL,
                location_id INTEGER NOT NULL,
                department_id INTEGER NOT NULL,
                position VARCHAR(100) NOT NULL,
                employee_type VARCHAR(20) DEFAULT 'full_time' CHECK (employee_type IN ('full_time', 'part_time', 'contract', 'intern')),
                salary_type VARCHAR(20) DEFAULT 'monthly' CHECK (salary_type IN ('monthly', 'hourly', 'commission')),
                base_salary DECIMAL(10,2) DEFAULT 0.00,
                commission_rate DECIMAL(5,2) DEFAULT 0.00,
                manager_id INTEGER,
                status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
                profile_image VARCHAR(255),
                address TEXT,
                emergency_contact VARCHAR(100),
                emergency_phone VARCHAR(20),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (location_id) REFERENCES locations(location_id),
                FOREIGN KEY (department_id) REFERENCES departments(department_id)
            );

            -- Users table
            CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                employee_id INTEGER NOT NULL UNIQUE,
                username VARCHAR(50) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'employee' CHECK (role IN ('super_admin', 'admin', 'hr_manager', 'department_head', 'employee')),
                permissions TEXT,
                last_login DATETIME,
                login_attempts INTEGER DEFAULT 0,
                account_locked INTEGER DEFAULT 0,
                password_reset_token VARCHAR(255),
                password_reset_expires DATETIME,
                status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
            );

            -- Attendance table
            CREATE TABLE IF NOT EXISTS attendance (
                attendance_id INTEGER PRIMARY KEY AUTOINCREMENT,
                employee_id INTEGER NOT NULL,
                date DATE NOT NULL,
                clock_in TIME,
                clock_out TIME,
                break_start TIME,
                break_end TIME,
                total_hours DECIMAL(4,2) DEFAULT 0.00,
                overtime_hours DECIMAL(4,2) DEFAULT 0.00,
                status VARCHAR(20) DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'half_day', 'holiday')),
                notes TEXT,
                created_by INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
                UNIQUE(employee_id, date)
            );

            -- Leave requests table
            CREATE TABLE IF NOT EXISTS leave_requests (
                leave_id INTEGER PRIMARY KEY AUTOINCREMENT,
                employee_id INTEGER NOT NULL,
                leave_type VARCHAR(20) NOT NULL CHECK (leave_type IN ('annual', 'sick', 'emergency', 'maternity', 'unpaid')),
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                days_requested INTEGER NOT NULL,
                reason TEXT,
                status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
                approved_by INTEGER,
                approved_at DATETIME,
                comments TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
            );

            -- Payroll table
            CREATE TABLE IF NOT EXISTS payroll (
                payroll_id INTEGER PRIMARY KEY AUTOINCREMENT,
                employee_id INTEGER NOT NULL,
                pay_period_start DATE NOT NULL,
                pay_period_end DATE NOT NULL,
                base_salary DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                overtime_pay DECIMAL(10,2) DEFAULT 0.00,
                commission DECIMAL(10,2) DEFAULT 0.00,
                bonuses DECIMAL(10,2) DEFAULT 0.00,
                deductions DECIMAL(10,2) DEFAULT 0.00,
                gross_pay DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                tax_deduction DECIMAL(10,2) DEFAULT 0.00,
                net_pay DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled')),
                payment_date DATE,
                notes TEXT,
                created_by INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
            );

            -- Sales performance table
            CREATE TABLE IF NOT EXISTS sales_performance (
                performance_id INTEGER PRIMARY KEY AUTOINCREMENT,
                employee_id INTEGER NOT NULL,
                date DATE NOT NULL,
                calls_made INTEGER DEFAULT 0,
                calls_answered INTEGER DEFAULT 0,
                appointments_set INTEGER DEFAULT 0,
                sales_closed INTEGER DEFAULT 0,
                revenue_generated DECIMAL(12,2) DEFAULT 0.00,
                call_duration_minutes INTEGER DEFAULT 0,
                conversion_rate DECIMAL(5,2) DEFAULT 0.00,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
                UNIQUE(employee_id, date)
            );

            -- System logs table
            CREATE TABLE IF NOT EXISTS system_logs (
                log_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                action VARCHAR(100) NOT NULL,
                module VARCHAR(50) NOT NULL,
                description TEXT,
                ip_address VARCHAR(45),
                user_agent TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            -- Notifications table
            CREATE TABLE IF NOT EXISTS notifications (
                notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
                recipient_id INTEGER NOT NULL,
                sender_id INTEGER,
                title VARCHAR(200) NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
                category VARCHAR(20) DEFAULT 'system' CHECK (category IN ('system', 'payroll', 'attendance', 'leave', 'performance')),
                is_read INTEGER DEFAULT 0,
                read_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (recipient_id) REFERENCES users(user_id)
            );
        `;

        return new Promise((resolve, reject) => {
            this.db.exec(schema, (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('Database schema initialized');
                    this.seedInitialData().then(resolve).catch(reject);
                }
            });
        });
    }

    async seedInitialData() {
        const seedData = `
            -- Insert default locations
            INSERT OR IGNORE INTO locations (location_name, location_code, country, city, address, phone, email, timezone) VALUES
            ('Syria Call Center', 'SYR-CC', 'Syria', 'Damascus', 'Damascus Business District, Syria', '+963-11-xxxxxxx', 'syria@loransmedical.com', 'Asia/Damascus'),
            ('Turkey Clinic', 'TUR-CL', 'Turkey', 'Istanbul', 'Medical District, Istanbul, Turkey', '+90-212-xxxxxxx', 'turkey@loransmedical.com', 'Europe/Istanbul');

            -- Insert default departments
            INSERT OR IGNORE INTO departments (department_name, department_code, location_id, description) VALUES
            ('Sales Team', 'SALES', 1, 'Customer outreach and sales operations'),
            ('Call Center Operations', 'CALL-OPS', 1, 'Customer service and support calls'),
            ('Medical Services', 'MED-SRV', 2, 'Clinical and medical services'),
            ('Administration', 'ADMIN', 1, 'Administrative and support functions'),
            ('Human Resources', 'HR', 1, 'Employee management and HR operations');

            -- Insert sample admin user
            INSERT OR IGNORE INTO employees (employee_code, first_name, last_name, email, phone, hire_date, location_id, department_id, position, base_salary) VALUES
            ('EMP001', 'Ahmad', 'Al-Manager', 'admin@loransmedical.com', '+963-11-1234567', '2020-01-01', 1, 5, 'General Manager', 5000.00);

            -- Insert admin user account (password: password)
            INSERT OR IGNORE INTO users (employee_id, username, password_hash, role) VALUES
            (1, 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin');

            -- Insert sample employees for demonstration
            INSERT OR IGNORE INTO employees (employee_code, first_name, last_name, email, hire_date, location_id, department_id, position, base_salary) VALUES
            ('EMP002', 'Sara', 'Ahmad', 'sara.ahmad@loransmedical.com', '2023-01-15', 1, 1, 'Sales Representative', 1200.00),
            ('EMP003', 'Omar', 'Hassan', 'omar.hassan@loransmedical.com', '2023-02-01', 1, 1, 'Senior Sales Rep', 1500.00),
            ('EMP004', 'Layla', 'Mahmoud', 'layla.mahmoud@loransmedical.com', '2023-01-10', 1, 2, 'Call Center Agent', 1000.00),
            ('EMP005', 'Dr. Mehmet', 'Yilmaz', 'mehmet.yilmaz@loransmedical.com', '2022-06-01', 2, 3, 'Medical Doctor', 4000.00);

            -- Insert sample attendance records
            INSERT OR IGNORE INTO attendance (employee_id, date, clock_in, clock_out, total_hours, status) VALUES
            (1, date('now'), '09:00', '17:00', 8.00, 'present'),
            (2, date('now'), '09:15', '17:00', 7.75, 'present'),
            (3, date('now'), '09:00', '17:30', 8.50, 'present'),
            (4, date('now'), '08:30', '16:30', 8.00, 'present'),
            (5, date('now'), '10:00', '18:00', 8.00, 'present');

            -- Insert sample performance data
            INSERT OR IGNORE INTO sales_performance (employee_id, date, calls_made, calls_answered, appointments_set, sales_closed, revenue_generated) VALUES
            (2, date('now'), 45, 32, 8, 3, 2500.00),
            (3, date('now'), 52, 38, 12, 5, 4200.00),
            (4, date('now'), 38, 28, 6, 2, 1800.00);
        `;

        return new Promise((resolve, reject) => {
            this.db.exec(seedData, (err) => {
                if (err) {
                    console.warn('Warning: Some seed data may already exist:', err.message);
                }
                console.log('Sample data seeded successfully');
                resolve();
            });
        });
    }

    async query(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    }

    async close() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        console.log('Database connection closed');
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }
}

module.exports = Database;