# 🚀 Installation Guide - Lorans Medical EMS

## Quick Setup for Local Development

### Prerequisites
- **PHP 8.0+** with PDO MySQL extension
- **MySQL 8.0+** or MariaDB 10.4+
- **Web Server** (Apache/Nginx/XAMPP/WAMP)

### 1. Clone Repository
```bash
git clone https://github.com/bgside/lorans-medical-ems.git
cd lorans-medical-ems
```

### 2. Database Setup
```sql
-- Create database
CREATE DATABASE lorans_medical_ems;

-- Import schema
mysql -u root -p lorans_medical_ems < database/lorans_medical_ems.sql
```

### 3. Configuration
Update `config/database.php`:
```php
private $host = 'localhost';
private $db_name = 'lorans_medical_ems';
private $username = 'your_mysql_user';
private $password = 'your_mysql_password';
```

### 4. Set Permissions
```bash
chmod 755 uploads/
chmod 755 reports/
```

### 5. Access System
- Open: `http://localhost/lorans-medical-ems/`
- Login: `admin` / `password`

## Default Demo Credentials
- **Username**: `admin`
- **Password**: `password`
- **Role**: Super Admin

## System Requirements
- PHP 8.0+ (with PDO, MySQL extensions)
- MySQL 8.0+ / MariaDB 10.4+
- Web server with PHP support
- 100MB disk space minimum

## Troubleshooting
1. **Database Connection Error**: Check credentials in `config/database.php`
2. **Permission Denied**: Ensure web server has read/write access to project directory
3. **Login Issues**: Verify database was imported correctly

## Production Deployment
1. Update database credentials
2. Set `display_errors = 0` in config
3. Use HTTPS for secure connections
4. Regular database backups recommended

For support, visit: https://github.com/bgside/lorans-medical-ems