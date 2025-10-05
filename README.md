# 🏥 Lorans Medical Employee Management System

**Enterprise-grade Healthcare Employee Management System built with Pure PHP, MySQL, HTML, and CSS**

A comprehensive multi-location employee management solution designed specifically for Lorans Medical's operations across Syria (Call Center) and Turkey (Clinic).

![PHP](https://img.shields.io/badge/PHP-8.0%2B-777BB4?style=for-the-badge&logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0%2B-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

## 🌟 Features

### 🏢 **Multi-Location Management**
- **Syria Call Center**: 70+ sales employees management
- **Turkey Clinic**: Medical services staff management
- Location-specific role permissions and data access
- Multi-timezone support (Damascus/Istanbul)

### 👥 **Employee Management**
- Complete employee profiles and records
- Department-wise organization (Sales, Call Center Operations, Medical Services, HR, Admin)
- Role-based access control (Super Admin, Admin, HR Manager, Department Head, Employee)
- Employee photo and document management

### ⏰ **Attendance & Time Tracking**
- Digital clock-in/clock-out system
- Real-time attendance monitoring
- Overtime calculation for call center operations
- Leave management (Annual, Sick, Emergency, Maternity, Unpaid)
- Attendance reports and analytics

### 💰 **Payroll Management**
- Automated salary calculations
- Commission tracking for sales team
- Bonus and deduction management
- Tax calculation and net pay computation
- Payment status tracking
- Detailed payroll reports

### 📊 **Performance Analytics**
- **Call Center Metrics**: Calls made, conversion rates, revenue generated
- Employee productivity tracking
- Department-wise performance reports
- KPI dashboards and analytics
- Performance trend analysis

### 🔒 **Security Features**
- Secure authentication with password hashing
- Session management with timeout
- Account lockout after failed login attempts
- Activity logging and audit trails
- Role-based permissions system

### 📱 **Modern Enterprise UI**
- Responsive design for desktop, tablet, and mobile
- Professional healthcare-themed interface
- Real-time dashboard with live statistics
- Intuitive navigation and user experience
- Modern CSS with gradient designs and animations

## 🏗️ **System Architecture**

### **Database Schema**
- **Locations**: Multi-location company structure
- **Departments**: Organizational departments per location
- **Employees**: Complete employee profiles
- **Users**: Authentication and access control
- **Attendance**: Time tracking and presence records
- **Leave Requests**: Leave application and approval workflow
- **Payroll**: Salary and payment management
- **Sales Performance**: Call center and sales metrics tracking
- **System Logs**: Activity and audit logging
- **Notifications**: Internal communication system

### **Technology Stack**
- **Backend**: Pure PHP 8.0+ with Object-Oriented Programming
- **Database**: MySQL 8.0+ with optimized queries and foreign key constraints
- **Frontend**: HTML5, CSS3 (Flexbox/Grid), Vanilla JavaScript
- **Security**: PDO prepared statements, password hashing, CSRF protection
- **Styling**: Custom CSS with modern enterprise design patterns

## 📦 **Installation**

### **Prerequisites**
- PHP 8.0 or higher
- MySQL 8.0 or higher
- Web server (Apache/Nginx)
- PDO MySQL extension enabled

### **Setup Steps**

1. **Clone the repository**
   ```bash
   git clone https://github.com/bgside/lorans-medical-ems.git
   cd lorans-medical-ems
   ```

2. **Database Setup**
   ```bash
   # Import the database schema
   mysql -u root -p < database/lorans_medical_ems.sql
   ```

3. **Configuration**
   ```php
   // Update config/database.php with your database credentials
   private $host = 'localhost';
   private $db_name = 'lorans_medical_ems';
   private $username = 'your_username';
   private $password = 'your_password';
   ```

4. **Web Server Configuration**
   - Point your web server document root to the project directory
   - Ensure PHP has read/write permissions for `uploads/` and `reports/` directories

5. **Access the System**
   - Navigate to your web server URL
   - Default admin credentials:
     - **Username**: `admin`
     - **Password**: `password`

## 🖥️ **Screenshots**

### Login Page
Professional healthcare-themed login interface with location badges and modern styling.

### Dashboard
Executive dashboard with real-time statistics, location-wise employee distribution, and recent activities.

### Employee Management
Comprehensive employee profiles, department assignments, and multi-location tracking.

## 🌐 **Multi-Location Structure**

### **Syria Call Center (Damascus)**
- **Primary Function**: Customer outreach and sales operations
- **Employee Count**: 70+ sales representatives
- **Departments**: Sales Team, Call Center Operations, Administration, HR
- **Timezone**: Asia/Damascus
- **Focus**: Revenue generation, customer acquisition, call performance

### **Turkey Clinic (Istanbul)**  
- **Primary Function**: Clinical and medical services
- **Employee Count**: 5+ medical staff
- **Departments**: Medical Services
- **Timezone**: Europe/Istanbul
- **Focus**: Patient care, medical operations, clinical support

## 🔐 **User Roles & Permissions**

| Role | Permissions |
|------|-------------|
| **Super Admin** | Full system access across all locations |
| **Admin** | Administrative access within assigned location |
| **HR Manager** | Employee management, payroll, attendance oversight |
| **Department Head** | Team management, performance tracking, leave approvals |
| **Employee** | Personal dashboard, attendance, leave requests |

## 📊 **Key Metrics Tracked**

### **Employee Analytics**
- Total employees across locations
- Active vs inactive staff
- Department-wise distribution
- Attendance rates and patterns

### **Performance Metrics**
- Daily calls made and answered
- Conversion rates and sales closed
- Revenue generated per employee
- Average call duration
- Monthly performance trends

### **Financial Tracking**
- Base salary management
- Commission calculations
- Overtime pay computation
- Monthly payroll totals
- Payment status monitoring

## 🛠️ **Technical Features**

### **Security Implementation**
- Password hashing with PHP's `password_hash()`
- PDO prepared statements prevent SQL injection
- Session timeout management
- Login attempt limitations
- Activity logging for audit trails

### **Database Optimization**
- Proper indexing on frequently queried columns
- Foreign key constraints for data integrity
- Optimized queries for large employee datasets
- Efficient join operations for reporting

### **Responsive Design**
- Mobile-first CSS approach
- Flexible grid layouts
- Touch-friendly interface elements
- Optimized for various screen sizes

## 📈 **Business Impact**

This system is designed to:
- **Streamline Operations**: Automate manual HR processes
- **Improve Accuracy**: Reduce payroll and attendance errors  
- **Enhance Productivity**: Provide real-time performance insights
- **Ensure Compliance**: Maintain proper employee records and audit trails
- **Support Growth**: Scale across multiple locations efficiently

## 🚀 **Future Enhancements**

- **API Integration**: RESTful API for mobile app connectivity
- **Advanced Analytics**: Machine learning for performance prediction
- **Document Management**: Digital employee document storage
- **Communication Hub**: Internal messaging and notification system
- **Mobile App**: Native mobile application for employees
- **Biometric Integration**: Fingerprint attendance systems

## 👨‍💻 **Developer Information**

**Project Type**: Enterprise Employee Management System  
**Industry**: Healthcare & Medical Services  
**Architecture**: MVC Pattern with Pure PHP  
**Database Design**: Normalized relational database structure  
**UI/UX**: Modern enterprise healthcare theme  

## 📞 **Company Information**

**Lorans Medical**
- **Syria Office**: Damascus Business District, Damascus, Syria
- **Turkey Office**: Medical District, Istanbul, Turkey  
- **Specialization**: Healthcare services and medical tourism
- **Employee Base**: 75+ employees across two countries

## 📝 **License**

This project is developed for Lorans Medical's internal operations and serves as a portfolio demonstration of enterprise-level PHP development capabilities.

---

**Built with ❤️ for Healthcare Excellence**  
*Supporting Lorans Medical's mission to provide world-class healthcare services across Syria and Turkey*