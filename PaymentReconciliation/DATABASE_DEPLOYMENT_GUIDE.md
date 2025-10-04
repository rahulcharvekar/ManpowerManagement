# Database Structure and Deployment Guide

## 📁 **Database Files Organization**

### **Flyway Migrations (Recommended for Production)**
```
src/main/resources/db/migration/
├── V1__create_base_tables.sql              # Base transaction tables
├── V2__create_master_tables.sql            # Master data tables
└── database-schema-comprehensive.sql       # Complete schema (for manual setup)
```

### **Sample Data (Development/Testing)**
```
src/main/resources/sample-data/
├── sample-data-board-master.sql
├── sample-data-employer-master.sql
├── sample-data-worker-master.sql
├── sample-data-employer-toli-relation.sql
├── populate-all-master-data.sql            # Runs all sample data
└── SAMPLE_DATA_README.md                   # Detailed usage guide
```

### **Setup Scripts**
```
src/main/resources/db/migration/
├── setup-database.sh                       # Azure MySQL setup script
└── cleanup_database.sql                    # Development cleanup
```

## 🚀 **Deployment Options**

### **Option 1: Flyway Migrations (Recommended)**
Spring Boot will automatically run Flyway migrations on startup:
```properties
# application.yml
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
```

### **Option 2: Manual Setup (Azure MySQL)**
```bash
# Run from project root
cd src/main/resources/db/migration
bash setup-database.sh
```

### **Option 3: Direct SQL Execution**
```bash
# Use the comprehensive schema file
mysql -u username -p database_name < src/main/resources/db/migration/database-schema-comprehensive.sql
```

## 📊 **Sample Data Population**

### **Quick Start**
```bash
# Navigate to project root
cd /path/to/PaymentReconciliation

# Run all sample data
mysql -u username -p database_name < src/main/resources/sample-data/populate-all-master-data.sql
```

### **Individual Files**
```bash
mysql -u username -p database_name < src/main/resources/sample-data/sample-data-board-master.sql
mysql -u username -p database_name < src/main/resources/sample-data/sample-data-employer-master.sql
# ... etc
```

## ⚠️ **Important Notes**

1. **Migration vs Manual**: Use Flyway migrations for production, comprehensive schema for development
2. **Sample Data Location**: Sample data is now in `/sample-data/` to avoid Flyway conflicts
3. **Script Paths**: Setup script now correctly references files in the same directory
4. **Environment Consistency**: All scripts use consistent database naming

## 🔧 **What Was Fixed**

- ✅ **Path Resolution**: Setup script now finds schema files correctly
- ✅ **Flyway Compatibility**: Separated migrations from sample data
- ✅ **File Organization**: Proper separation of concerns
- ✅ **Script Reliability**: No more "file not found" errors

---

**Ready for deployment!** 🎉
