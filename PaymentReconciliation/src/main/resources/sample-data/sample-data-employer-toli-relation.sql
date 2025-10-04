-- =============================================================================
-- Sample Data for Employer Toli Relation Table
-- Payment Reconciliation Application
-- =============================================================================

USE paymentreconciliation_dev;

-- Insert sample employer toli relation data
INSERT INTO employer_toli_relation (
    employer_id, 
    toli_id, 
    toli_name, 
    toli_code, 
    location, 
    supervisor_name, 
    supervisor_contact, 
    status
) VALUES 

-- Larsen & Toubro Limited (EMP001) Tolis
('EMP001', 'TOLI001', 'LNT Mumbai Construction Toli', 'LNT-MUM-001', 'Bandra Kurla Complex, Mumbai', 'Suresh Patil', '9876543210', 'ACTIVE'),
('EMP001', 'TOLI002', 'LNT Pune Infrastructure Toli', 'LNT-PUN-002', 'Hinjewadi, Pune', 'Rajesh Kumar', '9876543211', 'ACTIVE'),
('EMP001', 'TOLI003', 'LNT Chennai Metro Toli', 'LNT-CHE-003', 'Guindy, Chennai', 'Murugan Rajan', '9876543212', 'ACTIVE'),

-- Shapoorji Pallonji (EMP002) Tolis
('EMP002', 'TOLI004', 'SP Mumbai Residential Toli', 'SP-MUM-004', 'Lower Parel, Mumbai', 'Anil Desai', '8765432109', 'ACTIVE'),
('EMP002', 'TOLI005', 'SP Bangalore IT Park Toli', 'SP-BLR-005', 'Electronic City, Bangalore', 'Venkatesh Rao', '8765432108', 'ACTIVE'),
('EMP002', 'TOLI006', 'SP Hyderabad Commercial Toli', 'SP-HYD-006', 'Gachibowli, Hyderabad', 'Srinivas Reddy', '8765432107', 'ACTIVE'),

-- Hindustan Construction Company (EMP003) Tolis
('EMP003', 'TOLI007', 'HCC Mumbai Marine Drive Toli', 'HCC-MUM-007', 'Marine Drive, Mumbai', 'Prakash Joshi', '7654321098', 'ACTIVE'),
('EMP003', 'TOLI008', 'HCC Delhi Metro Toli', 'HCC-DEL-008', 'Connaught Place, Delhi', 'Vikash Sharma', '7654321097', 'ACTIVE'),
('EMP003', 'TOLI009', 'HCC Kolkata Bridge Toli', 'HCC-KOL-009', 'Salt Lake, Kolkata', 'Subhash Das', '7654321096', 'ACTIVE'),

-- Gammon India Limited (EMP004) Tolis
('EMP004', 'TOLI010', 'Gammon Mumbai Airport Toli', 'GMN-MUM-010', 'Andheri, Mumbai', 'Ravi Menon', '6543210987', 'ACTIVE'),
('EMP004', 'TOLI011', 'Gammon Bangalore Highway Toli', 'GMN-BLR-011', 'Hosur Road, Bangalore', 'Mohan Nair', '6543210986', 'ACTIVE'),
('EMP004', 'TOLI012', 'Gammon Chennai Port Toli', 'GMN-CHE-012', 'Ennore, Chennai', 'Raman Pillai', '6543210985', 'ACTIVE'),

-- Afcons Infrastructure (EMP005) Tolis
('EMP005', 'TOLI013', 'Afcons Mumbai Subway Toli', 'AFC-MUM-013', 'Dadar, Mumbai', 'Santosh Patil', '5432109876', 'ACTIVE'),
('EMP005', 'TOLI014', 'Afcons Pune Metro Toli', 'AFC-PUN-014', 'Kothrud, Pune', 'Deepak Joshi', '5432109875', 'ACTIVE'),
('EMP005', 'TOLI015', 'Afcons Ahmedabad Bridge Toli', 'AFC-AHM-015', 'Sabarmati, Ahmedabad', 'Kiran Patel', '5432109874', 'ACTIVE'),

-- NCC Limited (EMP006) Tolis
('EMP006', 'TOLI016', 'NCC Hyderabad Metro Toli', 'NCC-HYD-016', 'HITEC City, Hyderabad', 'Krishna Murthy', '4321098765', 'ACTIVE'),
('EMP006', 'TOLI017', 'NCC Bangalore Airport Toli', 'NCC-BLR-017', 'Devanahalli, Bangalore', 'Suresh Reddy', '4321098764', 'ACTIVE'),
('EMP006', 'TOLI018', 'NCC Chennai IT Corridor Toli', 'NCC-CHE-018', 'OMR, Chennai', 'Rajesh Kumar', '4321098763', 'ACTIVE'),

-- Sobha Limited (EMP007) Tolis
('EMP007', 'TOLI019', 'Sobha Bangalore Residential Toli', 'SBH-BLR-019', 'Whitefield, Bangalore', 'Girish Nair', '3210987654', 'ACTIVE'),
('EMP007', 'TOLI020', 'Sobha Kochi Apartment Toli', 'SBH-KOC-020', 'Marine Drive, Kochi', 'Sunil Kumar', '3210987653', 'ACTIVE'),
('EMP007', 'TOLI021', 'Sobha Chennai Villa Toli', 'SBH-CHE-021', 'Sholinganallur, Chennai', 'Ramesh Babu', '3210987652', 'ACTIVE'),

-- Brigade Enterprises (EMP008) Tolis
('EMP008', 'TOLI022', 'Brigade Bangalore Commercial Toli', 'BRG-BLR-022', 'Brigade Road, Bangalore', 'Ashwin Prabhu', '2109876543', 'ACTIVE'),
('EMP008', 'TOLI023', 'Brigade Chennai Mall Toli', 'BRG-CHE-023', 'Express Avenue, Chennai', 'Venkat Raman', '2109876542', 'ACTIVE'),
('EMP008', 'TOLI024', 'Brigade Hyderabad Office Toli', 'BRG-HYD-024', 'Banjara Hills, Hyderabad', 'Sanjay Reddy', '2109876541', 'ACTIVE'),

-- Puravankara Limited (EMP009) Tolis
('EMP009', 'TOLI025', 'Puravankara Bangalore Housing Toli', 'PVK-BLR-025', 'JP Nagar, Bangalore', 'Madhav Rao', '1098765432', 'ACTIVE'),
('EMP009', 'TOLI026', 'Puravankara Mumbai Premium Toli', 'PVK-MUM-026', 'Thane, Mumbai', 'Amit Shah', '1098765431', 'ACTIVE'),
('EMP009', 'TOLI027', 'Puravankara Chennai Luxury Toli', 'PVK-CHE-027', 'Pallavaram, Chennai', 'Karthik Krishnan', '1098765430', 'ACTIVE'),

-- GMR Infrastructure (EMP010) Tolis
('EMP010', 'TOLI028', 'GMR Delhi Airport Toli', 'GMR-DEL-028', 'IGI Airport, Delhi', 'Rajesh Singh', '9876501234', 'ACTIVE'),
('EMP010', 'TOLI029', 'GMR Hyderabad Airport Toli', 'GMR-HYD-029', 'Shamshabad, Hyderabad', 'Prasad Reddy', '9876501235', 'ACTIVE'),
('EMP010', 'TOLI030', 'GMR Bangalore Highway Toli', 'GMR-BLR-030', 'Electronic City, Bangalore', 'Naveen Kumar', '9876501236', 'ACTIVE'),

-- Tata Projects (EMP011) Tolis
('EMP011', 'TOLI031', 'Tata Kolkata Steel Plant Toli', 'TAT-KOL-031', 'Jamshedpur, Kolkata', 'Debashish Roy', '8765401234', 'ACTIVE'),
('EMP011', 'TOLI032', 'Tata Mumbai Power Plant Toli', 'TAT-MUM-032', 'Trombay, Mumbai', 'Rohit Sharma', '8765401235', 'ACTIVE'),
('EMP011', 'TOLI033', 'Tata Chennai Refinery Toli', 'TAT-CHE-033', 'Manali, Chennai', 'Selvam Raj', '8765401236', 'ACTIVE'),

-- IVRCL Limited (EMP012) Tolis
('EMP012', 'TOLI034', 'IVRCL Hyderabad Infrastructure Toli', 'IVR-HYD-034', 'Kukatpally, Hyderabad', 'Ramesh Babu', '7654301234', 'ACTIVE'),
('EMP012', 'TOLI035', 'IVRCL Bangalore IT Campus Toli', 'IVR-BLR-035', 'Marathahalli, Bangalore', 'Sunil Reddy', '7654301235', 'ACTIVE'),
('EMP012', 'TOLI036', 'IVRCL Chennai Industrial Toli', 'IVR-CHE-036', 'Sriperumbudur, Chennai', 'Prakash Murugan', '7654301236', 'ACTIVE'),

-- Additional Tolis for comprehensive testing
('EMP013', 'TOLI037', 'Nagarjuna Hyderabad Metro Phase 2 Toli', 'NAG-HYD-037', 'Secunderabad, Hyderabad', 'Krishna Rao', '6543201234', 'ACTIVE'),
('EMP014', 'TOLI038', 'DLF Gurgaon Cyber City Toli', 'DLF-GUR-038', 'Cyber City, Gurgaon', 'Manoj Kapoor', '5432101234', 'ACTIVE'),
('EMP015', 'TOLI039', 'Unitech Noida Commercial Toli', 'UNI-NOI-039', 'Sector 62, Noida', 'Vivek Chandra', '4321001234', 'ACTIVE'),

-- Multi-employer shared tolis (different employers sharing same location)
('EMP001', 'TOLI040', 'Multi-Employer Delhi Infrastructure Hub', 'MUL-DEL-040', 'Dwarka, Delhi', 'Shared Supervisor Team', '3210901234', 'ACTIVE'),
('EMP002', 'TOLI040', 'Multi-Employer Delhi Infrastructure Hub', 'MUL-DEL-040', 'Dwarka, Delhi', 'Shared Supervisor Team', '3210901234', 'ACTIVE');

-- Verification query
SELECT 'Employer Toli Relation sample data inserted successfully!' as status;
SELECT COUNT(*) as total_records FROM employer_toli_relation;
SELECT 
    etr.employer_id, 
    em.employer_name,
    etr.toli_id, 
    etr.toli_name, 
    etr.location, 
    etr.status 
FROM employer_toli_relation etr
JOIN employer_master em ON etr.employer_id = em.employer_id
ORDER BY etr.employer_id, etr.toli_id;
