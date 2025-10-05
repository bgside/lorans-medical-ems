<?php
/**
 * Lorans Medical Employee Management System
 * Main Dashboard
 */

require_once 'includes/Auth.php';

// Initialize auth and check login
$auth = new Auth();
$auth->requireLogin();

// Get current user info from session
$current_user = [
    'user_id' => $_SESSION['user_id'],
    'full_name' => $_SESSION['full_name'],
    'role' => $_SESSION['role'],
    'location_name' => $_SESSION['location_name'],
    'location_code' => $_SESSION['location_code'],
    'department_name' => $_SESSION['department_name'],
    'position' => $_SESSION['position']
];

// Handle logout
if (isset($_GET['logout'])) {
    $auth->logout();
    header('Location: login.php');
    exit();
}

// Mock dashboard data (in a real app, this would come from database queries)
$dashboard_stats = [
    'total_employees' => 75,
    'active_employees' => 68,
    'present_today' => 52,
    'on_leave' => 8,
    'syria_employees' => 70,
    'turkey_employees' => 5,
    'total_departments' => 5,
    'monthly_payroll' => 245000
];

$recent_activities = [
    ['action' => 'New employee registered', 'user' => 'HR Manager', 'time' => '2 hours ago', 'type' => 'success'],
    ['action' => 'Payroll processed for Sales Team', 'user' => 'Finance', 'time' => '4 hours ago', 'type' => 'info'],
    ['action' => 'Leave request approved', 'user' => 'Department Head', 'time' => '6 hours ago', 'type' => 'success'],
    ['action' => 'Performance report generated', 'user' => 'Manager', 'time' => '1 day ago', 'type' => 'info']
];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - <?php echo APP_NAME; ?></title>
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f8fafc;
            color: #334155;
            line-height: 1.6;
        }
        
        /* Sidebar */
        .sidebar {
            width: 280px;
            height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            position: fixed;
            left: 0;
            top: 0;
            z-index: 1000;
            overflow-y: auto;
            transition: all 0.3s ease;
        }
        
        .sidebar-header {
            padding: 2rem 1.5rem;
            text-align: center;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        
        .sidebar-header .company-logo {
            font-size: 2.5rem;
            color: white;
            margin-bottom: 0.5rem;
        }
        
        .sidebar-header .company-name {
            color: white;
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 0.3rem;
        }
        
        .sidebar-header .company-subtitle {
            color: rgba(255,255,255,0.8);
            font-size: 0.85rem;
        }
        
        .sidebar-nav {
            padding: 1rem 0;
        }
        
        .nav-item {
            margin: 0.2rem 0;
        }
        
        .nav-link {
            display: flex;
            align-items: center;
            padding: 0.8rem 1.5rem;
            color: rgba(255,255,255,0.9);
            text-decoration: none;
            transition: all 0.3s ease;
            border-left: 3px solid transparent;
        }
        
        .nav-link:hover, .nav-link.active {
            background-color: rgba(255,255,255,0.1);
            border-left-color: #ffffff;
            color: white;
        }
        
        .nav-link i {
            width: 20px;
            margin-right: 0.8rem;
            font-size: 1.1rem;
        }
        
        /* Main Content */
        .main-content {
            margin-left: 280px;
            min-height: 100vh;
            background-color: #f8fafc;
        }
        
        /* Top Header */
        .top-header {
            background: white;
            padding: 1rem 2rem;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .header-title h1 {
            font-size: 1.8rem;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 0.2rem;
        }
        
        .header-title .breadcrumb {
            color: #64748b;
            font-size: 0.9rem;
        }
        
        .header-user {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .location-switcher {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background: #f1f5f9;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            font-size: 0.9rem;
            color: #475569;
        }
        
        .user-info {
            display: flex;
            align-items: center;
            gap: 0.8rem;
        }
        
        .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea, #764ba2);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
        }
        
        .user-details h4 {
            font-size: 0.9rem;
            color: #1e293b;
            margin-bottom: 0.1rem;
        }
        
        .user-details span {
            font-size: 0.8rem;
            color: #64748b;
        }
        
        .logout-btn {
            background: #ef4444;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: background 0.3s;
        }
        
        .logout-btn:hover {
            background: #dc2626;
        }
        
        /* Dashboard Content */
        .dashboard-content {
            padding: 2rem;
        }
        
        /* Stats Cards */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .stat-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            border-left: 4px solid #667eea;
            transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .stat-card.success { border-left-color: #10b981; }
        .stat-card.warning { border-left-color: #f59e0b; }
        .stat-card.danger { border-left-color: #ef4444; }
        .stat-card.info { border-left-color: #3b82f6; }
        
        .stat-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.8rem;
        }
        
        .stat-title {
            font-size: 0.9rem;
            color: #64748b;
            font-weight: 500;
        }
        
        .stat-icon {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
        }
        
        .stat-icon.primary { background: rgba(102, 126, 234, 0.1); color: #667eea; }
        .stat-icon.success { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .stat-icon.warning { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        .stat-icon.danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        
        .stat-value {
            font-size: 2.2rem;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 0.3rem;
        }
        
        .stat-change {
            font-size: 0.8rem;
            display: flex;
            align-items: center;
            gap: 0.3rem;
        }
        
        .stat-change.positive { color: #10b981; }
        .stat-change.negative { color: #ef4444; }
        
        /* Location Stats */
        .location-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .location-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .location-flag {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }
        
        .location-name {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 0.3rem;
        }
        
        .location-count {
            font-size: 1.8rem;
            font-weight: 700;
            color: #667eea;
        }
        
        /* Recent Activities */
        .activity-section {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .section-header {
            display: flex;
            justify-content: between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .section-title {
            font-size: 1.3rem;
            font-weight: 600;
            color: #1e293b;
        }
        
        .activity-item {
            display: flex;
            align-items: center;
            padding: 0.8rem 0;
            border-bottom: 1px solid #f1f5f9;
        }
        
        .activity-item:last-child {
            border-bottom: none;
        }
        
        .activity-icon {
            width: 35px;
            height: 35px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 1rem;
            font-size: 0.9rem;
        }
        
        .activity-icon.success { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .activity-icon.info { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
        
        .activity-content {
            flex: 1;
        }
        
        .activity-action {
            font-size: 0.95rem;
            color: #1e293b;
            margin-bottom: 0.2rem;
        }
        
        .activity-meta {
            font-size: 0.8rem;
            color: #64748b;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .sidebar {
                transform: translateX(-100%);
            }
            
            .main-content {
                margin-left: 0;
            }
            
            .top-header {
                padding: 1rem;
            }
            
            .dashboard-content {
                padding: 1rem;
            }
            
            .stats-grid {
                grid-template-columns: 1fr;
            }
            
            .user-details {
                display: none;
            }
        }
    </style>
</head>
<body>
    <!-- Sidebar -->
    <div class="sidebar">
        <div class="sidebar-header">
            <div class="company-logo">
                <i class="fas fa-user-md"></i>
            </div>
            <div class="company-name"><?php echo COMPANY_NAME; ?></div>
            <div class="company-subtitle">Employee Management System</div>
        </div>
        
        <nav class="sidebar-nav">
            <div class="nav-item">
                <a href="dashboard.php" class="nav-link active">
                    <i class="fas fa-tachometer-alt"></i>
                    Dashboard
                </a>
            </div>
            <div class="nav-item">
                <a href="employees.php" class="nav-link">
                    <i class="fas fa-users"></i>
                    Employees
                </a>
            </div>
            <div class="nav-item">
                <a href="attendance.php" class="nav-link">
                    <i class="fas fa-clock"></i>
                    Attendance
                </a>
            </div>
            <div class="nav-item">
                <a href="payroll.php" class="nav-link">
                    <i class="fas fa-money-bill-wave"></i>
                    Payroll
                </a>
            </div>
            <div class="nav-item">
                <a href="performance.php" class="nav-link">
                    <i class="fas fa-chart-line"></i>
                    Performance
                </a>
            </div>
            <div class="nav-item">
                <a href="reports.php" class="nav-link">
                    <i class="fas fa-file-alt"></i>
                    Reports
                </a>
            </div>
            <?php if ($auth->hasRole('hr_manager')): ?>
            <div class="nav-item">
                <a href="settings.php" class="nav-link">
                    <i class="fas fa-cog"></i>
                    Settings
                </a>
            </div>
            <?php endif; ?>
        </nav>
    </div>
    
    <!-- Main Content -->
    <div class="main-content">
        <!-- Top Header -->
        <div class="top-header">
            <div class="header-title">
                <h1>Dashboard Overview</h1>
                <div class="breadcrumb">Home / Dashboard</div>
            </div>
            
            <div class="header-user">
                <div class="location-switcher">
                    <i class="fas fa-map-marker-alt"></i>
                    <span><?php echo $current_user['location_name']; ?></span>
                </div>
                
                <div class="user-info">
                    <div class="user-avatar">
                        <?php echo strtoupper(substr($current_user['full_name'], 0, 2)); ?>
                    </div>
                    <div class="user-details">
                        <h4><?php echo $current_user['full_name']; ?></h4>
                        <span><?php echo ucfirst(str_replace('_', ' ', $current_user['role'])); ?></span>
                    </div>
                </div>
                
                <a href="?logout=1" class="logout-btn">
                    <i class="fas fa-sign-out-alt"></i>
                    Logout
                </a>
            </div>
        </div>
        
        <!-- Dashboard Content -->
        <div class="dashboard-content">
            <!-- Stats Cards -->
            <div class="stats-grid">
                <div class="stat-card primary">
                    <div class="stat-header">
                        <div class="stat-title">Total Employees</div>
                        <div class="stat-icon primary">
                            <i class="fas fa-users"></i>
                        </div>
                    </div>
                    <div class="stat-value"><?php echo $dashboard_stats['total_employees']; ?></div>
                    <div class="stat-change positive">
                        <i class="fas fa-arrow-up"></i>
                        +3 this month
                    </div>
                </div>
                
                <div class="stat-card success">
                    <div class="stat-header">
                        <div class="stat-title">Present Today</div>
                        <div class="stat-icon success">
                            <i class="fas fa-check-circle"></i>
                        </div>
                    </div>
                    <div class="stat-value"><?php echo $dashboard_stats['present_today']; ?></div>
                    <div class="stat-change positive">
                        <i class="fas fa-arrow-up"></i>
                        96% attendance rate
                    </div>
                </div>
                
                <div class="stat-card warning">
                    <div class="stat-header">
                        <div class="stat-title">On Leave</div>
                        <div class="stat-icon warning">
                            <i class="fas fa-calendar-times"></i>
                        </div>
                    </div>
                    <div class="stat-value"><?php echo $dashboard_stats['on_leave']; ?></div>
                    <div class="stat-change negative">
                        <i class="fas fa-arrow-down"></i>
                        3 approved requests
                    </div>
                </div>
                
                <div class="stat-card info">
                    <div class="stat-header">
                        <div class="stat-title">Monthly Payroll</div>
                        <div class="stat-icon primary">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                    </div>
                    <div class="stat-value">$<?php echo number_format($dashboard_stats['monthly_payroll']); ?></div>
                    <div class="stat-change positive">
                        <i class="fas fa-arrow-up"></i>
                        +2.5% vs last month
                    </div>
                </div>
            </div>
            
            <!-- Location Stats -->
            <div class="location-stats">
                <div class="location-card">
                    <div class="location-flag">🇸🇾</div>
                    <div class="location-name">Syria Call Center</div>
                    <div class="location-count"><?php echo $dashboard_stats['syria_employees']; ?></div>
                    <div style="color: #64748b; font-size: 0.9rem; margin-top: 0.5rem;">Sales & Operations</div>
                </div>
                
                <div class="location-card">
                    <div class="location-flag">🇹🇷</div>
                    <div class="location-name">Turkey Clinic</div>
                    <div class="location-count"><?php echo $dashboard_stats['turkey_employees']; ?></div>
                    <div style="color: #64748b; font-size: 0.9rem; margin-top: 0.5rem;">Medical Services</div>
                </div>
            </div>
            
            <!-- Recent Activities -->
            <div class="activity-section">
                <div class="section-header">
                    <h3 class="section-title">Recent Activities</h3>
                </div>
                
                <?php foreach ($recent_activities as $activity): ?>
                <div class="activity-item">
                    <div class="activity-icon <?php echo $activity['type']; ?>">
                        <i class="fas fa-<?php echo $activity['type'] == 'success' ? 'check' : 'info'; ?>"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-action"><?php echo $activity['action']; ?></div>
                        <div class="activity-meta">
                            By <?php echo $activity['user']; ?> • <?php echo $activity['time']; ?>
                        </div>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
    
    <script>
        // Real-time clock
        function updateClock() {
            const now = new Date();
            const timeString = now.toLocaleString('en-US', {
                timeZone: 'Asia/Damascus',
                hour12: true,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            
            // You can add clock display if needed
        }
        
        setInterval(updateClock, 1000);
        updateClock();
        
        // Mobile sidebar toggle (if needed)
        function toggleSidebar() {
            document.querySelector('.sidebar').classList.toggle('show');
        }
        
        // Auto-refresh stats every 30 seconds
        setTimeout(() => {
            location.reload();
        }, 30000);
    </script>
</body>
</html>