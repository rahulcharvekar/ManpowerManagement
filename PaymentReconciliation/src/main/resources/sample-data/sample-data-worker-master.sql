-- =============================================================================
-- Sample Data for Worker Master Table
-- Payment Reconciliation Application
-- =============================================================================

USE paymentreconciliation_dev;

-- Insert sample worker master data
INSERT INTO worker_master (
    worker_id, 
    worker_reference, 
    registration_id, 
    worker_name, 
    father_name, 
    date_of_birth, 
    gender, 
    aadhar, 
    pan, 
    bank_account, 
    bank_name, 
    ifsc_code, 
    phone_number, 
    email, 
    address, 
    emergency_contact_name, 
    emergency_contact_phone, 
    status
) VALUES 

-- Maharashtra Workers
('WRK001', 'MH001WRK001', 'REG001MH2024', 'Rajesh Kumar Sharma', 'Ram Kumar Sharma', '1985-03-15', 'Male', '123456789012', 'ABCPK1234A', '1234567890123456', 'State Bank of India', 'SBIN0001234', '9876543210', 'rajesh.sharma@email.com', '123, Shivaji Nagar, Mumbai - 400001', 'Sunita Sharma', '9876543211', 'ACTIVE'),
('WRK002', 'MH002WRK002', 'REG002MH2024', 'Suresh Patil', 'Ganesh Patil', '1990-07-22', 'Male', '234567890123', 'DEFPK5678B', '2345678901234567', 'Bank of Maharashtra', 'MAHB0001234', '8765432109', 'suresh.patil@email.com', '456, Pune Camp, Pune - 411001', 'Lata Patil', '8765432108', 'ACTIVE'),
('WRK003', 'MH003WRK003', 'REG003MH2024', 'Priya Devi', 'Mohan Singh', '1988-12-10', 'Female', '345678901234', 'GHIPK9012C', '3456789012345678', 'HDFC Bank', 'HDFC0001234', '7654321098', 'priya.devi@email.com', '789, Nashik Road, Nashik - 422005', 'Mohan Singh', '7654321097', 'ACTIVE'),

-- Karnataka Workers  
('WRK004', 'KA001WRK004', 'REG004KA2024', 'Venkatesh Reddy', 'Krishnamurthy Reddy', '1987-05-18', 'Male', '456789012345', 'JKLPK3456D', '4567890123456789', 'Canara Bank', 'CNRB0001234', '6543210987', 'venkatesh.reddy@email.com', '321, Brigade Road, Bangalore - 560025', 'Lakshmi Reddy', '6543210986', 'ACTIVE'),
('WRK005', 'KA002WRK005', 'REG005KA2024', 'Anjali Nair', 'Suresh Nair', '1992-09-25', 'Female', '567890123456', 'MNOPK7890E', '5678901234567890', 'Karnataka Bank', 'KARB0001234', '5432109876', 'anjali.nair@email.com', '654, Malleshwaram, Bangalore - 560003', 'Suresh Nair', '5432109875', 'ACTIVE'),

-- Tamil Nadu Workers
('WRK006', 'TN001WRK006', 'REG006TN2024', 'Murugan Pillai', 'Ramasamy Pillai', '1983-11-08', 'Male', '678901234567', 'PQRPK1234F', '6789012345678901', 'Indian Bank', 'IDIB0001234', '4321098765', 'murugan.pillai@email.com', '987, T Nagar, Chennai - 600017', 'Kamala Pillai', '4321098764', 'ACTIVE'),
('WRK007', 'TN002WRK007', 'REG007TN2024', 'Kavitha Krishnan', 'Krishnan Iyer', '1991-04-14', 'Female', '789012345678', 'STUVK5678G', '7890123456789012', 'City Union Bank', 'CIUB0001234', '3210987654', 'kavitha.krishnan@email.com', '147, Anna Nagar, Chennai - 600040', 'Krishnan Iyer', '3210987653', 'ACTIVE'),

-- Gujarat Workers
('WRK008', 'GJ001WRK008', 'REG008GJ2024', 'Amit Patel', 'Bharat Patel', '1986-08-30', 'Male', '890123456789', 'WXYPK9012H', '8901234567890123', 'Bank of Baroda', 'BARB0001234', '2109876543', 'amit.patel@email.com', '258, Navrangpura, Ahmedabad - 380009', 'Nisha Patel', '2109876542', 'ACTIVE'),
('WRK009', 'GJ002WRK009', 'REG009GJ2024', 'Priyanka Shah', 'Jayesh Shah', '1989-01-20', 'Female', '901234567890', 'ABCPK3456I', '9012345678901234', 'State Bank of India', 'SBIN0005678', '1098765432', 'priyanka.shah@email.com', '369, Satellite, Ahmedabad - 380015', 'Jayesh Shah', '1098765431', 'ACTIVE'),

-- Uttar Pradesh Workers
('WRK010', 'UP001WRK010', 'REG010UP2024', 'Vinod Singh', 'Ram Singh', '1984-06-12', 'Male', '012345678901', 'DEFPK7890J', '0123456789012345', 'Punjab National Bank', 'PUNB0001234', '9087654321', 'vinod.singh@email.com', '741, Hazratganj, Lucknow - 226001', 'Sunita Singh', '9087654320', 'ACTIVE'),
('WRK011', 'UP002WRK011', 'REG011UP2024', 'Geeta Yadav', 'Ramesh Yadav', '1993-10-05', 'Female', '123450678912', 'GHIPK1234K', '1234506789123456', 'Union Bank of India', 'UBIN0001234', '8976543210', 'geeta.yadav@email.com', '852, Gomti Nagar, Lucknow - 226010', 'Ramesh Yadav', '8976543209', 'ACTIVE'),

-- West Bengal Workers
('WRK012', 'WB001WRK012', 'REG012WB2024', 'Subhash Chatterjee', 'Bimal Chatterjee', '1982-02-28', 'Male', '234561789023', 'JKLPK5678L', '2345617890234567', 'UCO Bank', 'UCBA0001234', '7865432109', 'subhash.chatterjee@email.com', '963, Salt Lake, Kolkata - 700064', 'Mala Chatterjee', '7865432108', 'ACTIVE'),
('WRK013', 'WB002WRK013', 'REG013WB2024', 'Ruma Das', 'Gopal Das', '1990-12-17', 'Female', '345672890134', 'MNOPK9012M', '3456728901345678', 'Allahabad Bank', 'ALLA0001234', '6754321098', 'ruma.das@email.com', '159, Howrah, Kolkata - 711101', 'Gopal Das', '6754321097', 'ACTIVE'),

-- Rajasthan Workers
('WRK014', 'RJ001WRK014', 'REG014RJ2024', 'Mohan Sharma', 'Devi Lal Sharma', '1988-07-03', 'Male', '456783901245', 'PQRPK3456N', '4567839012456789', 'Bank of Rajasthan', 'BRAJ0001234', '5643210987', 'mohan.sharma@email.com', '357, Johari Bazaar, Jaipur - 302003', 'Kamla Sharma', '5643210986', 'ACTIVE'),
('WRK015', 'RJ002WRK015', 'REG015RJ2024', 'Sunita Meena', 'Babu Lal Meena', '1994-03-11', 'Female', '567894012356', 'STUVK7890O', '5678940123567890', 'Punjab National Bank', 'PUNB0005678', '4532109876', 'sunita.meena@email.com', '468, Malviya Nagar, Jaipur - 302017', 'Babu Lal Meena', '4532109875', 'ACTIVE'),

-- Additional workers for testing
('WRK016', 'AP001WRK016', 'REG016AP2024', 'Rama Krishna', 'Venkateswara Rao', '1985-09-16', 'Male', '678905123467', 'WXYPK1234P', '6789051234678901', 'State Bank of Hyderabad', 'SBHY0001234', '3421098765', 'rama.krishna@email.com', '579, Jubilee Hills, Hyderabad - 500033', 'Sita Krishna', '3421098764', 'ACTIVE'),
('WRK017', 'TS001WRK017', 'REG017TS2024', 'Srinivas Rao', 'Narayana Rao', '1987-11-22', 'Male', '789016234578', 'ABCPK5678Q', '7890162345789012', 'Andhra Bank', 'ANDB0001234', '2310987654', 'srinivas.rao@email.com', '680, Banjara Hills, Hyderabad - 500034', 'Padma Rao', '2310987653', 'ACTIVE'),
('WRK018', 'PB001WRK018', 'REG018PB2024', 'Harpreet Singh', 'Gurmeet Singh', '1986-04-09', 'Male', '890127345689', 'DEFPK9012R', '8901273456890123', 'Punjab National Bank', 'PUNB0009012', '1209876543', 'harpreet.singh@email.com', '791, Model Town, Chandigarh - 160022', 'Simran Kaur', '1209876542', 'ACTIVE'),
('WRK019', 'HR001WRK019', 'REG019HR2024', 'Deepak Kumar', 'Suresh Kumar', '1989-08-25', 'Male', '901238456790', 'GHIPK3456S', '9012384567901234', 'State Bank of India', 'SBIN0009012', '0198765432', 'deepak.kumar@email.com', '802, Sector-17, Gurgaon - 122001', 'Pooja Kumar', '0198765431', 'ACTIVE'),
('WRK020', 'DL001WRK020', 'REG020DL2024', 'Anita Gupta', 'Rajesh Gupta', '1991-06-13', 'Female', '012349567801', 'JKLPK7890T', '0123495678012345', 'HDFC Bank', 'HDFC0009012', '9087654321', 'anita.gupta@email.com', '913, Connaught Place, New Delhi - 110001', 'Rajesh Gupta', '9087654320', 'ACTIVE');

-- Verification query
SELECT 'Worker Master sample data inserted successfully!' as status;
SELECT COUNT(*) as total_records FROM worker_master;
SELECT worker_id, worker_reference, worker_name, aadhar, phone_number, status FROM worker_master ORDER BY worker_id;
