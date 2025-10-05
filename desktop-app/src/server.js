const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcryptjs');
const Database = require('./database');

class ServerManager {
    constructor(port = 8080) {
        this.port = port;
        this.app = express();
        this.database = new Database();
        this.server = null;
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        // Body parsing middleware
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));

        // Session middleware
        this.app.use(session({
            secret: 'lorans-medical-ems-secret-key-2024',
            resave: false,
            saveUninitialized: false,
            cookie: { 
                secure: false, 
                maxAge: 3600000 // 1 hour
            }
        }));

        // Static files
        this.app.use(express.static(path.join(__dirname, '../public')));
        
        // CORS for development
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            next();
        });
    }

    setupRoutes() {
        // Home route - redirect to login
        this.app.get('/', (req, res) => {
            if (req.session.user) {
                res.redirect('/dashboard');
            } else {
                res.redirect('/login');
            }
        });

        // Login page
        this.app.get('/login', (req, res) => {
            if (req.session.user) {
                return res.redirect('/dashboard');
            }
            res.send(this.getLoginHTML());
        });

        // Login POST
        this.app.post('/login', async (req, res) => {
            try {
                const { username, password } = req.body;
                
                if (!username || !password) {
                    return res.json({ success: false, message: 'Please enter both username and password' });
                }

                // Get user from database
                const user = await this.database.query(`
                    SELECT u.*, e.first_name, e.last_name, e.employee_code, 
                           e.location_id, e.department_id, e.position,
                           l.location_name, l.location_code,
                           d.department_name 
                    FROM users u 
                    JOIN employees e ON u.employee_id = e.employee_id
                    JOIN locations l ON e.location_id = l.location_id
                    JOIN departments d ON e.department_id = d.department_id
                    WHERE u.username = ? AND u.status = 'active'
                `, [username]);

                if (user.length === 0) {
                    return res.json({ success: false, message: 'Invalid username or password' });
                }

                const userData = user[0];

                // For demo purposes, accept 'password' as password
                let passwordValid = false;
                if (password === 'password') {
                    passwordValid = true;
                } else {
                    // Try bcrypt verification
                    try {
                        passwordValid = await bcrypt.compare(password, userData.password_hash);
                    } catch (err) {
                        passwordValid = false;
                    }
                }

                if (!passwordValid) {
                    return res.json({ success: false, message: 'Invalid username or password' });
                }

                // Set session
                req.session.user = {
                    user_id: userData.user_id,
                    employee_id: userData.employee_id,
                    username: userData.username,
                    role: userData.role,
                    full_name: userData.first_name + ' ' + userData.last_name,
                    employee_code: userData.employee_code,
                    location_id: userData.location_id,
                    location_name: userData.location_name,
                    location_code: userData.location_code,
                    department_id: userData.department_id,
                    department_name: userData.department_name,
                    position: userData.position
                };

                // Update last login
                await this.database.run('UPDATE users SET last_login = datetime("now") WHERE user_id = ?', [userData.user_id]);

                res.json({ success: true, message: 'Login successful' });

            } catch (error) {
                console.error('Login error:', error);
                res.json({ success: false, message: 'An error occurred during login' });
            }
        });

        // Dashboard
        this.app.get('/dashboard', async (req, res) => {
            if (!req.session.user) {
                return res.redirect('/login');
            }

            try {
                // Get dashboard statistics
                const stats = await this.getDashboardStats();
                res.send(this.getDashboardHTML(req.session.user, stats));
            } catch (error) {
                console.error('Dashboard error:', error);
                res.status(500).send('Error loading dashboard');
            }
        });

        // API routes
        this.app.get('/api/employees', async (req, res) => {
            if (!req.session.user) {
                return res.status(401).json({ error: 'Not authenticated' });
            }

            try {
                const employees = await this.database.query(`
                    SELECT e.*, l.location_name, d.department_name 
                    FROM employees e
                    JOIN locations l ON e.location_id = l.location_id
                    JOIN departments d ON e.department_id = d.department_id
                    WHERE e.status = 'active'
                    ORDER BY e.first_name, e.last_name
                `);
                res.json(employees);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.get('/api/attendance/today', async (req, res) => {
            if (!req.session.user) {
                return res.status(401).json({ error: 'Not authenticated' });
            }

            try {
                const attendance = await this.database.query(`
                    SELECT a.*, e.first_name, e.last_name, e.employee_code
                    FROM attendance a
                    JOIN employees e ON a.employee_id = e.employee_id
                    WHERE a.date = date('now')
                    ORDER BY a.clock_in
                `);
                res.json(attendance);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Logout
        this.app.post('/logout', (req, res) => {
            req.session.destroy();
            res.redirect('/login');
        });

        this.app.get('/logout', (req, res) => {
            req.session.destroy();
            res.redirect('/login');
        });
    }

    async getDashboardStats() {
        const totalEmployees = await this.database.query('SELECT COUNT(*) as count FROM employees WHERE status = "active"');
        const presentToday = await this.database.query('SELECT COUNT(*) as count FROM attendance WHERE date = date("now") AND status = "present"');
        const onLeave = await this.database.query('SELECT COUNT(*) as count FROM leave_requests WHERE status = "approved" AND start_date <= date("now") AND end_date >= date("now")');
        const syriaEmployees = await this.database.query('SELECT COUNT(*) as count FROM employees WHERE location_id = 1 AND status = "active"');
        const turkeyEmployees = await this.database.query('SELECT COUNT(*) as count FROM employees WHERE location_id = 2 AND status = "active"');
        
        return {
            total_employees: totalEmployees[0].count,
            present_today: presentToday[0].count,
            on_leave: onLeave[0].count,
            syria_employees: syriaEmployees[0].count,
            turkey_employees: turkeyEmployees[0].count,
            monthly_payroll: 245000
        };
    }

    getLoginHTML() {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Lorans Medical EMS</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        .login-container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
            padding: 3rem;
            width: 100%;
            max-width: 450px;
            color: #333;
        }
        .company-logo { text-align: center; margin-bottom: 2rem; }
        .company-logo i { font-size: 4rem; color: #667eea; margin-bottom: 1rem; }
        .company-name { font-size: 2rem; font-weight: 700; color: #2c3e50; margin-bottom: 0.5rem; }
        .company-subtitle { color: #7f8c8d; font-size: 1rem; }
        .form-group { margin-bottom: 1.5rem; position: relative; }
        .form-group label { display: block; margin-bottom: 0.5rem; color: #2c3e50; font-weight: 600; }
        .form-group input {
            width: 100%; padding: 1rem 1rem 1rem 3rem; border: 2px solid #e0e0e0;
            border-radius: 12px; font-size: 1rem; transition: all 0.3s ease;
        }
        .form-group input:focus { outline: none; border-color: #667eea; }
        .form-group i { position: absolute; left: 1rem; top: 2.2rem; color: #7f8c8d; }
        .login-btn {
            width: 100%; padding: 1rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; border: none; border-radius: 12px; font-size: 1.1rem;
            font-weight: 600; cursor: pointer; transition: all 0.3s ease; margin-top: 1rem;
        }
        .login-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4); }
        .alert { padding: 1rem; border-radius: 8px; margin-bottom: 1rem; font-weight: 500; }
        .alert-danger { background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
        .alert-success { background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
        .footer-text { text-align: center; margin-top: 2rem; color: #7f8c8d; font-size: 0.9rem; }
        .location-badge {
            display: inline-block; background: rgba(102, 126, 234, 0.1); color: #667eea;
            padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.8rem; margin: 0 0.5rem;
        }
        .desktop-app { border-top: 3px solid #667eea; }
    </style>
</head>
<body class="desktop-app">
    <div class="login-container">
        <div class="company-logo">
            <i class="fas fa-user-md"></i>
            <h1 class="company-name">Lorans Medical</h1>
            <p class="company-subtitle">Employee Management System</p>
        </div>
        
        <div style="text-align: center; margin-bottom: 1rem;">
            <span class="location-badge"><i class="fas fa-map-marker-alt"></i> Syria</span>
            <span class="location-badge"><i class="fas fa-map-marker-alt"></i> Turkey</span>
        </div>
        
        <div id="message"></div>
        
        <form id="loginForm">
            <div class="form-group">
                <label for="username">Username</label>
                <i class="fas fa-user"></i>
                <input type="text" id="username" name="username" required placeholder="Enter your username">
            </div>
            
            <div class="form-group">
                <label for="password">Password</label>
                <i class="fas fa-lock"></i>
                <input type="password" id="password" name="password" required placeholder="Enter your password">
            </div>
            
            <button type="submit" class="login-btn">
                <i class="fas fa-sign-in-alt"></i> Sign In
            </button>
        </form>
        
        <div class="footer-text">
            <p><strong>Demo Credentials:</strong></p>
            <p>Username: <code>admin</code> | Password: <code>password</code></p>
            <hr style="margin: 1rem 0; border: none; border-top: 1px solid #e0e0e0;">
            <p>&copy; 2024 Lorans Medical. Desktop Application v1.0.0</p>
        </div>
    </div>
    
    <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                const messageDiv = document.getElementById('message');
                
                if (result.success) {
                    messageDiv.innerHTML = '<div class="alert alert-success">Login successful! Redirecting...</div>';
                    setTimeout(() => window.location.href = '/dashboard', 1000);
                } else {
                    messageDiv.innerHTML = '<div class="alert alert-danger">' + result.message + '</div>';
                }
            } catch (error) {
                document.getElementById('message').innerHTML = '<div class="alert alert-danger">Network error occurred</div>';
            }
        });
        
        document.getElementById('username').focus();
    </script>
</body>
</html>`;
    }

    getDashboardHTML(user, stats) {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Lorans Medical EMS</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f8fafc; color: #334155; line-height: 1.6;
        }
        .desktop-app { border-top: 3px solid #667eea; }
        .sidebar {
            width: 280px; height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            position: fixed; left: 0; top: 0; z-index: 1000; overflow-y: auto;
        }
        .sidebar-header { padding: 2rem 1.5rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .sidebar-header .company-logo { font-size: 2.5rem; color: white; margin-bottom: 0.5rem; }
        .sidebar-header .company-name { color: white; font-size: 1.2rem; font-weight: 600; margin-bottom: 0.3rem; }
        .sidebar-header .company-subtitle { color: rgba(255,255,255,0.8); font-size: 0.85rem; }
        .sidebar-nav { padding: 1rem 0; }
        .nav-item { margin: 0.2rem 0; }
        .nav-link {
            display: flex; align-items: center; padding: 0.8rem 1.5rem; color: rgba(255,255,255,0.9);
            text-decoration: none; transition: all 0.3s ease; border-left: 3px solid transparent;
        }
        .nav-link:hover, .nav-link.active {
            background-color: rgba(255,255,255,0.1); border-left-color: #ffffff; color: white;
        }
        .nav-link i { width: 20px; margin-right: 0.8rem; font-size: 1.1rem; }
        .main-content { margin-left: 280px; min-height: 100vh; background-color: #f8fafc; }
        .top-header {
            background: white; padding: 1rem 2rem; border-bottom: 1px solid #e2e8f0;
            display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .header-title h1 { font-size: 1.8rem; font-weight: 700; color: #1e293b; margin-bottom: 0.2rem; }
        .header-title .breadcrumb { color: #64748b; font-size: 0.9rem; }
        .header-user { display: flex; align-items: center; gap: 1rem; }
        .location-switcher {
            display: flex; align-items: center; gap: 0.5rem; background: #f1f5f9;
            padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.9rem; color: #475569;
        }
        .user-info { display: flex; align-items: center; gap: 0.8rem; }
        .user-avatar {
            width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2);
            display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;
        }
        .user-details h4 { font-size: 0.9rem; color: #1e293b; margin-bottom: 0.1rem; }
        .user-details span { font-size: 0.8rem; color: #64748b; }
        .logout-btn {
            background: #ef4444; color: white; border: none; padding: 0.5rem 1rem;
            border-radius: 6px; cursor: pointer; font-size: 0.9rem; text-decoration: none;
        }
        .logout-btn:hover { background: #dc2626; }
        .dashboard-content { padding: 2rem; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
        .stat-card {
            background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            border-left: 4px solid #667eea; transition: transform 0.3s, box-shadow 0.3s;
        }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.15); }
        .stat-card.success { border-left-color: #10b981; }
        .stat-card.warning { border-left-color: #f59e0b; }
        .stat-card.info { border-left-color: #3b82f6; }
        .stat-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem; }
        .stat-title { font-size: 0.9rem; color: #64748b; font-weight: 500; }
        .stat-icon {
            width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center;
            justify-content: center; font-size: 1.2rem;
        }
        .stat-icon.primary { background: rgba(102, 126, 234, 0.1); color: #667eea; }
        .stat-icon.success { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .stat-icon.warning { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        .stat-value { font-size: 2.2rem; font-weight: 700; color: #1e293b; margin-bottom: 0.3rem; }
        .stat-change { font-size: 0.8rem; display: flex; align-items: center; gap: 0.3rem; }
        .stat-change.positive { color: #10b981; }
        .location-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
        .location-card {
            background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center;
        }
        .location-flag { font-size: 2rem; margin-bottom: 0.5rem; }
        .location-name { font-size: 1.1rem; font-weight: 600; margin-bottom: 0.3rem; }
        .location-count { font-size: 1.8rem; font-weight: 700; color: #667eea; }
    </style>
</head>
<body class="desktop-app">
    <div class="sidebar">
        <div class="sidebar-header">
            <div class="company-logo"><i class="fas fa-user-md"></i></div>
            <div class="company-name">Lorans Medical</div>
            <div class="company-subtitle">Employee Management System</div>
        </div>
        
        <nav class="sidebar-nav">
            <div class="nav-item"><a href="/dashboard" class="nav-link active"><i class="fas fa-tachometer-alt"></i>Dashboard</a></div>
            <div class="nav-item"><a href="#" class="nav-link"><i class="fas fa-users"></i>Employees</a></div>
            <div class="nav-item"><a href="#" class="nav-link"><i class="fas fa-clock"></i>Attendance</a></div>
            <div class="nav-item"><a href="#" class="nav-link"><i class="fas fa-money-bill-wave"></i>Payroll</a></div>
            <div class="nav-item"><a href="#" class="nav-link"><i class="fas fa-chart-line"></i>Performance</a></div>
            <div class="nav-item"><a href="#" class="nav-link"><i class="fas fa-file-alt"></i>Reports</a></div>
        </nav>
    </div>
    
    <div class="main-content">
        <div class="top-header">
            <div class="header-title">
                <h1>Dashboard Overview</h1>
                <div class="breadcrumb">Home / Dashboard</div>
            </div>
            
            <div class="header-user">
                <div class="location-switcher">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${user.location_name}</span>
                </div>
                <div class="user-info">
                    <div class="user-avatar">${user.full_name.substr(0, 2).toUpperCase()}</div>
                    <div class="user-details">
                        <h4>${user.full_name}</h4>
                        <span>${user.role.replace('_', ' ').toUpperCase()}</span>
                    </div>
                </div>
                <a href="/logout" class="logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</a>
            </div>
        </div>
        
        <div class="dashboard-content">
            <div class="stats-grid">
                <div class="stat-card primary">
                    <div class="stat-header">
                        <div class="stat-title">Total Employees</div>
                        <div class="stat-icon primary"><i class="fas fa-users"></i></div>
                    </div>
                    <div class="stat-value">${stats.total_employees}</div>
                    <div class="stat-change positive"><i class="fas fa-arrow-up"></i> Active across locations</div>
                </div>
                
                <div class="stat-card success">
                    <div class="stat-header">
                        <div class="stat-title">Present Today</div>
                        <div class="stat-icon success"><i class="fas fa-check-circle"></i></div>
                    </div>
                    <div class="stat-value">${stats.present_today}</div>
                    <div class="stat-change positive"><i class="fas fa-arrow-up"></i> High attendance rate</div>
                </div>
                
                <div class="stat-card warning">
                    <div class="stat-header">
                        <div class="stat-title">On Leave</div>
                        <div class="stat-icon warning"><i class="fas fa-calendar-times"></i></div>
                    </div>
                    <div class="stat-value">${stats.on_leave}</div>
                    <div class="stat-change">Approved requests</div>
                </div>
                
                <div class="stat-card info">
                    <div class="stat-header">
                        <div class="stat-title">Monthly Payroll</div>
                        <div class="stat-icon primary"><i class="fas fa-dollar-sign"></i></div>
                    </div>
                    <div class="stat-value">$${stats.monthly_payroll.toLocaleString()}</div>
                    <div class="stat-change positive"><i class="fas fa-arrow-up"></i> Multi-location total</div>
                </div>
            </div>
            
            <div class="location-stats">
                <div class="location-card">
                    <div class="location-flag">🇸🇾</div>
                    <div class="location-name">Syria Call Center</div>
                    <div class="location-count">${stats.syria_employees}</div>
                    <div style="color: #64748b; font-size: 0.9rem; margin-top: 0.5rem;">Sales & Operations</div>
                </div>
                
                <div class="location-card">
                    <div class="location-flag">🇹🇷</div>
                    <div class="location-name">Turkey Clinic</div>
                    <div class="location-count">${stats.turkey_employees}</div>
                    <div style="color: #64748b; font-size: 0.9rem; margin-top: 0.5rem;">Medical Services</div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        console.log('Lorans Medical EMS Desktop - Dashboard Loaded');
        console.log('User:', '${user.full_name}', 'Role:', '${user.role}');
        
        // Auto-refresh every 30 seconds
        setTimeout(() => location.reload(), 30000);
    </script>
</body>
</html>`;
    }

    async start() {
        try {
            await this.database.connect();
            
            this.server = this.app.listen(this.port, 'localhost', () => {
                console.log(`Lorans Medical EMS Server running on http://localhost:${this.port}`);
            });
            
            return this.server;
        } catch (error) {
            console.error('Failed to start server:', error);
            throw error;
        }
    }

    async stop() {
        if (this.server) {
            this.server.close();
        }
        if (this.database) {
            await this.database.close();
        }
        console.log('Server stopped');
    }
}

module.exports = ServerManager;