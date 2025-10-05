<?php
/**
 * Lorans Medical Employee Management System
 * Database Configuration
 * 
 * @package LoransMedical
 * @version 1.0.0
 */

class Database {
    // Database credentials
    private $host = 'localhost';
    private $db_name = 'lorans_medical_ems';
    private $username = 'root';  // Change as needed
    private $password = '';      // Change as needed
    private $charset = 'utf8mb4';
    
    public $conn;
    
    /**
     * Database connection
     * @return PDO|null
     */
    public function getConnection() {
        $this->conn = null;
        
        try {
            $dsn = "mysql:host={$this->host};dbname={$this->db_name};charset={$this->charset}";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            
            $this->conn = new PDO($dsn, $this->username, $this->password, $options);
        } catch(PDOException $exception) {
            error_log("Database connection error: " . $exception->getMessage());
            throw new Exception("Database connection failed");
        }
        
        return $this->conn;
    }
    
    /**
     * Close database connection
     */
    public function closeConnection() {
        $this->conn = null;
    }
}

/**
 * Database Configuration Constants
 */
define('DB_HOST', 'localhost');
define('DB_NAME', 'lorans_medical_ems');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

/**
 * Application Configuration
 */
define('APP_NAME', 'Lorans Medical EMS');
define('APP_VERSION', '1.0.0');
define('APP_URL', 'http://localhost/lorans-medical-ems/');
define('UPLOAD_PATH', 'uploads/');
define('REPORTS_PATH', 'reports/');

/**
 * Security Configuration
 */
define('SESSION_TIMEOUT', 3600); // 1 hour
define('MAX_LOGIN_ATTEMPTS', 5);
define('PASSWORD_MIN_LENGTH', 8);

/**
 * Company Information
 */
define('COMPANY_NAME', 'Lorans Medical');
define('COMPANY_ADDRESS_SYRIA', 'Damascus Business District, Syria');
define('COMPANY_ADDRESS_TURKEY', 'Medical District, Istanbul, Turkey');
define('COMPANY_PHONE_SYRIA', '+963-11-xxxxxxx');
define('COMPANY_PHONE_TURKEY', '+90-212-xxxxxxx');
define('COMPANY_EMAIL', 'info@loransmedical.com');

/**
 * Timezone Settings
 */
define('DEFAULT_TIMEZONE', 'Asia/Damascus');
date_default_timezone_set(DEFAULT_TIMEZONE);

/**
 * Error Reporting (Set to false in production)
 */
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
?>