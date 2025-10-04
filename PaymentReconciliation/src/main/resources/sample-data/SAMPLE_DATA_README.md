# Sample Master Data for Payment Reconciliation Application

This directory contains SQL scripts to populate master tables with sample data for testing and development purposes.

## 📁 Files Overview

### Individual Master Data Files
- **`sample-data-board-master.sql`** - Sample data for board_master table (10 boards across different states)
- **`sample-data-employer-master.sql`** - Sample data for employer_master table (15 major construction companies)
- **`sample-data-worker-master.sql`** - Sample data for worker_master table (20 workers from different states)
- **`sample-data-employer-toli-relation.sql`** - Sample data for employer_toli_relation table (40+ toli relationships)

### Master Execution Script
- **`populate-all-master-data.sql`** - Executes all sample data scripts in correct order with verification

## 🚀 How to Use

### Option 1: Run All Sample Data (Recommended)
```sql
-- Execute the master script that runs all sample data files
SOURCE populate-all-master-data.sql;
```

### Option 2: Run Individual Files
```sql
-- Run in this exact order due to dependencies
SOURCE sample-data-board-master.sql;
SOURCE sample-data-employer-master.sql;
SOURCE sample-data-worker-master.sql;
SOURCE sample-data-employer-toli-relation.sql;
```

### Option 3: Command Line Execution
```bash
# Navigate to the project directory
cd /path/to/PaymentReconciliation

# Run all master data
mysql -u your_username -p paymentreconciliation_dev < src/main/resources/sample-data/populate-all-master-data.sql

# Or run individual files
mysql -u your_username -p paymentreconciliation_dev < src/main/resources/sample-data/sample-data-board-master.sql
mysql -u your_username -p paymentreconciliation_dev < src/main/resources/sample-data/sample-data-employer-master.sql
mysql -u your_username -p paymentreconciliation_dev < src/main/resources/sample-data/sample-data-worker-master.sql
mysql -u your_username -p paymentreconciliation_dev < src/main/resources/sample-data/sample-data-employer-toli-relation.sql
```

## 📊 Sample Data Overview

### Board Master (10 records)
- **States Covered**: Maharashtra, Karnataka, Tamil Nadu, Gujarat, UP, West Bengal, Rajasthan, Andhra Pradesh, Telangana, Punjab
- **Includes**: Board IDs, names, codes, contact information, addresses

### Employer Master (15 records)
- **Major Companies**: L&T, Shapoorji Pallonji, HCC, Gammon India, Afcons, NCC, Sobha, Brigade, Puravankara, GMR, Tata Projects, IVRCL, Nagarjuna Construction, DLF, Unitech
- **Includes**: Company registration numbers, PAN, GST numbers, contact details

### Worker Master (20 records)
- **Distribution**: Workers from all major states with proper demographics
- **Includes**: Aadhar, PAN, bank details, emergency contacts, complete address information
- **Gender Distribution**: Mixed male/female workers for comprehensive testing

### Employer Toli Relations (40+ records)
- **Coverage**: Multiple tolis per employer across different cities
- **Includes**: Toli codes, locations, supervisor information
- **Special Cases**: Multi-employer shared tolis for complex scenarios

## 🎯 Key Features for Testing

### 1. **Realistic Data**
- All sample data uses realistic Indian names, addresses, and identification numbers
- Proper state-wise distribution matching real construction industry patterns
- Valid bank account formats and contact information

### 2. **Comprehensive Coverage**
- Pan-India representation with major states covered
- Different types of construction companies (infrastructure, residential, commercial)
- Various toli types (metro, highway, residential, commercial, industrial)

### 3. **Testing Scenarios**
- Single employer with multiple tolis
- Multiple employers sharing same toli location
- Workers distributed across different states
- Different board jurisdictions for compliance testing

### 4. **Data Relationships**
- Proper employer-toli relationships established
- Workers can be mapped to any employer-toli combination
- Board jurisdictions align with worker locations

## 🔍 Verification Queries

After running the sample data, you can verify the data using these queries:

```sql
-- Check total records in each table
SELECT 'board_master' as table_name, COUNT(*) as records FROM board_master
UNION ALL
SELECT 'employer_master', COUNT(*) FROM employer_master
UNION ALL  
SELECT 'worker_master', COUNT(*) FROM worker_master
UNION ALL
SELECT 'employer_toli_relation', COUNT(*) FROM employer_toli_relation;

-- Check employer-toli relationships
SELECT 
    em.employer_name,
    COUNT(etr.toli_id) as toli_count
FROM employer_master em
LEFT JOIN employer_toli_relation etr ON em.employer_id = etr.employer_id
GROUP BY em.employer_id, em.employer_name
ORDER BY toli_count DESC;

-- Sample data for testing uploads
SELECT 
    etr.employer_id,
    etr.toli_id,
    wm.worker_reference,
    wm.registration_id,
    wm.worker_name
FROM employer_toli_relation etr
CROSS JOIN worker_master wm
WHERE etr.status = 'ACTIVE' AND wm.status = 'ACTIVE'
LIMIT 10;
```

## ⚠️ Important Notes

1. **Order Matters**: Always run the scripts in the specified order due to foreign key dependencies
2. **Development Only**: This sample data is for development/testing purposes only
3. **Unique Constraints**: All unique fields (Aadhar, PAN, etc.) have been carefully designed to avoid conflicts
4. **Status Fields**: All records are created with 'ACTIVE' status by default
5. **Timestamps**: Created/updated timestamps are automatically set to current time

## 🛠️ Customization

To add more sample data or modify existing data:

1. **Adding Boards**: Follow the pattern in `sample-data-board-master.sql`
2. **Adding Employers**: Ensure unique company registration numbers and PAN/GST numbers
3. **Adding Workers**: Ensure unique Aadhar numbers and worker references
4. **Adding Tolis**: Link to existing employers and ensure unique toli_id per employer

## 🔄 Cleanup

To remove all sample data:

```sql
-- Clear all master data (be careful - this removes all data!)
DELETE FROM employer_toli_relation;
DELETE FROM worker_master;
DELETE FROM employer_master;
DELETE FROM board_master;

-- Reset auto-increment counters
ALTER TABLE board_master AUTO_INCREMENT = 1;
ALTER TABLE employer_master AUTO_INCREMENT = 1;
ALTER TABLE worker_master AUTO_INCREMENT = 1;
ALTER TABLE employer_toli_relation AUTO_INCREMENT = 1;
```

---

**Ready to test uploads!** 🚀

After running these scripts, your application will have comprehensive master data to test file uploads, worker payment processing, and the entire payment reconciliation workflow.
