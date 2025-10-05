<?php
/**
 * Lorans Medical Employee Management System
 * Authentication and Session Management Class
 * 
 * @package LoransMedical
 * @version 1.0.0
 */

require_once __DIR__ . '/../config/database.php';

class Auth {
    private $conn;
    private $database;
    
    public function __construct() {
        $this->database = new Database();
        $this->conn = $this->database->getConnection();
        
        // Start session if not started
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
    }
    
    /**
     * User login
     * @param string $username
     * @param string $password
     * @return array
     */
    public function login($username, $password) {
        try {
            // Check login attempts
            if ($this->isAccountLocked($username)) {
                return [
                    'success' => false,
                    'message' => 'Account is temporarily locked due to multiple failed login attempts.'
                ];
            }
            
            $query = "SELECT u.*, e.first_name, e.last_name, e.employee_code, 
                            e.location_id, e.department_id, e.position,
                            l.location_name, l.location_code,
                            d.department_name 
                     FROM users u 
                     JOIN employees e ON u.employee_id = e.employee_id
                     JOIN locations l ON e.location_id = l.location_id
                     JOIN departments d ON e.department_id = d.department_id
                     WHERE u.username = :username AND u.status = 'active'";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':username', $username);
            $stmt->execute();
            
            if ($stmt->rowCount() == 1) {
                $user = $stmt->fetch(PDO::FETCH_ASSOC);
                
                // Verify password
                if (password_verify($password, $user['password_hash'])) {
                    // Reset login attempts
                    $this->resetLoginAttempts($username);
                    
                    // Update last login
                    $this->updateLastLogin($user['user_id']);
                    
                    // Set session variables
                    $_SESSION['user_id'] = $user['user_id'];
                    $_SESSION['employee_id'] = $user['employee_id'];
                    $_SESSION['username'] = $user['username'];
                    $_SESSION['role'] = $user['role'];
                    $_SESSION['full_name'] = $user['first_name'] . ' ' . $user['last_name'];
                    $_SESSION['employee_code'] = $user['employee_code'];
                    $_SESSION['location_id'] = $user['location_id'];
                    $_SESSION['location_name'] = $user['location_name'];
                    $_SESSION['location_code'] = $user['location_code'];
                    $_SESSION['department_id'] = $user['department_id'];
                    $_SESSION['department_name'] = $user['department_name'];
                    $_SESSION['position'] = $user['position'];
                    $_SESSION['login_time'] = time();
                    $_SESSION['last_activity'] = time();
                    
                    // Log successful login
                    $this->logActivity($user['user_id'], 'login', 'authentication', 'User logged in successfully');
                    
                    return [
                        'success' => true,
                        'message' => 'Login successful',
                        'user' => $user
                    ];
                } else {
                    // Increment login attempts
                    $this->incrementLoginAttempts($username);
                    
                    return [
                        'success' => false,
                        'message' => 'Invalid username or password'
                    ];
                }
            } else {
                return [
                    'success' => false,
                    'message' => 'Invalid username or password'
                ];
            }
            
        } catch (PDOException $e) {
            error_log("Login error: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'An error occurred during login. Please try again.'
            ];
        }
    }
    
    /**
     * User logout
     */
    public function logout() {
        if (isset($_SESSION['user_id'])) {
            // Log logout activity
            $this->logActivity($_SESSION['user_id'], 'logout', 'authentication', 'User logged out');
        }
        
        // Clear all session variables
        $_SESSION = array();
        
        // Destroy the session cookie
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        
        // Destroy the session
        session_destroy();
    }
    
    /**
     * Check if user is logged in
     * @return bool
     */
    public function isLoggedIn() {
        return isset($_SESSION['user_id']) && isset($_SESSION['login_time']);
    }
    
    /**
     * Check session timeout
     * @return bool
     */
    public function checkSessionTimeout() {
        if (isset($_SESSION['last_activity'])) {
            if (time() - $_SESSION['last_activity'] > SESSION_TIMEOUT) {
                $this->logout();
                return false;
            }
            $_SESSION['last_activity'] = time();
        }
        return true;
    }
    
    /**
     * Check user role and permissions
     * @param string $required_role
     * @return bool
     */
    public function hasRole($required_role) {
        if (!$this->isLoggedIn()) {
            return false;
        }
        
        $user_role = $_SESSION['role'];
        
        // Role hierarchy
        $roles = [
            'employee' => 1,
            'department_head' => 2,
            'hr_manager' => 3,
            'admin' => 4,
            'super_admin' => 5
        ];
        
        $user_level = isset($roles[$user_role]) ? $roles[$user_role] : 0;
        $required_level = isset($roles[$required_role]) ? $roles[$required_role] : 5;
        
        return $user_level >= $required_level;
    }
    
    /**
     * Check if user can access location data
     * @param int $location_id
     * @return bool
     */
    public function canAccessLocation($location_id) {
        if (!$this->isLoggedIn()) {
            return false;
        }
        
        // Super admin and admin can access all locations
        if (in_array($_SESSION['role'], ['super_admin', 'admin'])) {
            return true;
        }
        
        // Others can only access their own location
        return $_SESSION['location_id'] == $location_id;
    }
    
    /**
     * Redirect if not authenticated
     * @param string $redirect_url
     */
    public function requireLogin($redirect_url = 'login.php') {
        if (!$this->isLoggedIn() || !$this->checkSessionTimeout()) {
            header("Location: $redirect_url");
            exit();
        }
    }
    
    /**
     * Redirect if insufficient permissions
     * @param string $required_role
     * @param string $redirect_url
     */
    public function requireRole($required_role, $redirect_url = 'unauthorized.php') {
        $this->requireLogin();
        
        if (!$this->hasRole($required_role)) {
            header("Location: $redirect_url");
            exit();
        }
    }
    
    /**
     * Check if account is locked
     * @param string $username
     * @return bool
     */
    private function isAccountLocked($username) {
        try {
            $query = "SELECT login_attempts, account_locked FROM users WHERE username = :username";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':username', $username);
            $stmt->execute();
            
            if ($stmt->rowCount() == 1) {
                $user = $stmt->fetch();
                return $user['account_locked'] == 1 || $user['login_attempts'] >= MAX_LOGIN_ATTEMPTS;
            }
            
            return false;
        } catch (PDOException $e) {
            error_log("Account lock check error: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Increment login attempts
     * @param string $username
     */
    private function incrementLoginAttempts($username) {
        try {
            $query = "UPDATE users SET login_attempts = login_attempts + 1 WHERE username = :username";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':username', $username);
            $stmt->execute();
            
            // Lock account if max attempts reached
            $query = "UPDATE users SET account_locked = 1 WHERE username = :username AND login_attempts >= :max_attempts";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':username', $username);
            $stmt->bindParam(':max_attempts', MAX_LOGIN_ATTEMPTS);
            $stmt->execute();
            
        } catch (PDOException $e) {
            error_log("Login attempts increment error: " . $e->getMessage());
        }
    }
    
    /**
     * Reset login attempts
     * @param string $username
     */
    private function resetLoginAttempts($username) {
        try {
            $query = "UPDATE users SET login_attempts = 0, account_locked = 0 WHERE username = :username";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':username', $username);
            $stmt->execute();
        } catch (PDOException $e) {
            error_log("Login attempts reset error: " . $e->getMessage());
        }
    }
    
    /**
     * Update last login time
     * @param int $user_id
     */
    private function updateLastLogin($user_id) {
        try {
            $query = "UPDATE users SET last_login = NOW() WHERE user_id = :user_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':user_id', $user_id);
            $stmt->execute();
        } catch (PDOException $e) {
            error_log("Last login update error: " . $e->getMessage());
        }
    }
    
    /**
     * Log user activity
     * @param int $user_id
     * @param string $action
     * @param string $module
     * @param string $description
     */
    private function logActivity($user_id, $action, $module, $description) {
        try {
            $query = "INSERT INTO system_logs (user_id, action, module, description, ip_address, user_agent) 
                     VALUES (:user_id, :action, :module, :description, :ip_address, :user_agent)";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':user_id', $user_id);
            $stmt->bindParam(':action', $action);
            $stmt->bindParam(':module', $module);
            $stmt->bindParam(':description', $description);
            $stmt->bindParam(':ip_address', $_SERVER['REMOTE_ADDR']);
            $stmt->bindParam(':user_agent', $_SERVER['HTTP_USER_AGENT']);
            $stmt->execute();
        } catch (PDOException $e) {
            error_log("Activity log error: " . $e->getMessage());
        }
    }
}
?>