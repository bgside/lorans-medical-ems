# 🖥️ Lorans Medical EMS - Desktop Application

**Desktop version of the Lorans Medical Employee Management System built with Electron + Node.js + SQLite**

## ✨ Features

### 🏥 **Self-Contained Healthcare EMS**
- **No External Dependencies**: Runs completely offline with embedded SQLite database
- **Multi-location Support**: Syria Call Center (70+ employees) + Turkey Clinic (5+ employees)  
- **Professional Desktop UI**: Native window controls, system tray, and menu integration
- **Real-time Dashboard**: Live statistics and employee management interface

### 🛠️ **Technology Stack**
- **Frontend**: Electron + HTML5/CSS3 + JavaScript
- **Backend**: Node.js + Express server
- **Database**: SQLite (local, no setup required)
- **Authentication**: Session-based with bcrypt password hashing
- **UI Framework**: Custom CSS with modern healthcare theming

### 🔐 **Security & Features**
- Local SQLite database with encrypted storage
- Role-based access control (5 user levels)
- System tray integration with quick access
- Auto-start and background operation
- Professional installer for Windows
- Offline-first architecture

## 📦 **Installation**

### **Option 1: Pre-built Executable (Recommended)**
1. Download `LoransMedicalEMS-Setup.exe` from releases
2. Run installer and follow setup wizard
3. Launch from desktop shortcut or start menu

### **Option 2: Build from Source**
```bash
# Prerequisites: Node.js 16+
npm install
npm start
```

### **Option 3: Create Distribution**
```bash
npm run build          # Build for current platform
npm run build-win      # Build Windows installer
npm run dist           # Create portable version
```

## 🚀 **Getting Started**

1. **First Launch**: Welcome dialog explains features and setup
2. **Default Login**: 
   - Username: `admin`
   - Password: `password`
3. **Database**: SQLite database auto-created at first startup
4. **Sample Data**: 5 demo employees with attendance/performance records

## 🏗️ **Application Structure**

```
desktop-app/
├── src/
│   ├── main.js          # Electron main process
│   ├── preload.js       # Secure renderer communication  
│   ├── server.js        # Express server with routes
│   ├── database.js      # SQLite database manager
│   └── ...
├── data/                # SQLite database storage
├── assets/              # Icons and resources
├── package.json         # Dependencies and build config
└── README.md
```

## 💾 **Database Schema**

The application uses a comprehensive SQLite schema supporting:
- **Locations**: Multi-location company structure
- **Employees**: Complete HR profiles with relationships
- **Users**: Authentication with role-based permissions
- **Attendance**: Time tracking with overtime calculations
- **Payroll**: Salary management and commission tracking
- **Performance**: Call center metrics and KPI tracking
- **System Logs**: Activity auditing and security monitoring

## 🎯 **Core Functionality**

### **Dashboard Overview**
- Real-time employee statistics across locations
- Attendance monitoring and leave management
- Performance metrics and revenue tracking
- Quick access to all system modules

### **Employee Management**
- Complete employee profiles and documentation
- Department and location assignments
- Role-based access and permission management
- Multi-location employee tracking

### **Attendance System**
- Digital time tracking with clock in/out
- Overtime calculation for call center staff
- Leave request workflow and approvals
- Attendance analytics and reporting

### **Performance Analytics**
- Call center metrics (calls made, conversion rates)
- Sales performance and revenue tracking
- Employee productivity measurements
- KPI dashboards and trend analysis

## ⚙️ **System Requirements**

- **Windows**: 10/11 (64-bit)
- **Memory**: 512MB RAM minimum
- **Storage**: 100MB available space
- **Network**: Not required (offline operation)

## 🔧 **Development**

### **Development Mode**
```bash
npm run dev             # Run with dev tools enabled
```

### **Debugging**
- Dev tools accessible via `Ctrl+Shift+I`
- Server logs in console for backend debugging
- SQLite database browser for data inspection

### **Building**
```bash
npm run pack           # Package without installer
npm run build-win      # Create Windows installer
```

## 📋 **Default Demo Data**

The application includes sample data for immediate testing:
- **Admin User**: General Manager with full access
- **Sample Employees**: 5 employees across departments
- **Attendance Records**: Current day attendance data
- **Performance Data**: Sales metrics and call center statistics

## 🔐 **Security Features**

- **Local Data**: All data stored locally in SQLite database
- **Encrypted Passwords**: bcrypt hashing for user authentication
- **Session Management**: Secure session handling with timeouts
- **Role-Based Access**: 5-tier permission system
- **Activity Logging**: Complete audit trail of user actions

## 🚀 **Production Deployment**

1. **Build Application**: `npm run build-win`
2. **Test Installer**: Install on clean system
3. **Distribution**: Share installer executable
4. **Updates**: Use auto-updater for seamless updates

## 📞 **Support**

- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: Comprehensive README and code comments
- **Demo Mode**: Full functionality with sample data

---

**Built for Lorans Medical's Healthcare Operations**  
*Supporting 75+ employees across Syria and Turkey with enterprise-grade desktop EMS*