-- =============================================================================
-- Sample Data for Employer Master Table
-- Payment Reconciliation Application
-- =============================================================================

USE paymentreconciliation_dev;

-- Insert sample employer master data
INSERT INTO employer_master (
    employer_id, 
    employer_name, 
    employer_code, 
    company_registration_number, 
    pan_number, 
    gst_number, 
    address, 
    contact_person, 
    contact_email, 
    contact_phone, 
    status
) VALUES 
('EMP001', 'Larsen & Toubro Limited', 'LNT', 'U99999MH1946PLC004768', 'AAACL0204C', '27AAACL0204C1ZF', 'L&T House, Ballard Estate, Mumbai - 400001', 'Anil Kumar', 'anil.kumar@lnt.com', '022-67525656', 'ACTIVE'),
('EMP002', 'Shapoorji Pallonji and Company Pvt Ltd', 'SPCPL', 'U45200MH1865PTC000638', 'AAACP0208B', '27AAACP0208B1ZG', 'SP House, 41/44 Minoo Desai Marg, Mumbai - 400005', 'Ravi Menon', 'ravi.menon@shapoorji.com', '022-66794444', 'ACTIVE'),
('EMP003', 'Hindustan Construction Company Ltd', 'HCC', 'L45200MH1926PLC001615', 'AAACH0918F', '27AAACH0918F1ZD', 'Hincon House, 247 Park, LBS Marg, Mumbai - 400070', 'Sunil Sharma', 'sunil.sharma@hccindia.com', '022-25969933', 'ACTIVE'),
('EMP004', 'Gammon India Limited', 'GIL', 'L45200MH1922PLC000731', 'AAACG0208A', '27AAACG0208A1ZC', 'Gammon House, Veer Savarkar Marg, Mumbai - 400025', 'Prakash Joshi', 'prakash.joshi@gammonindia.com', '022-24923030', 'ACTIVE'),
('EMP005', 'Afcons Infrastructure Limited', 'AIL', 'L45200MH1959PLC011671', 'AAACA1847B', '27AAACA1847B1ZH', 'Afcons House, S V Road, Andheri (W), Mumbai - 400058', 'Rajesh Patil', 'rajesh.patil@afcons.com', '022-67919999', 'ACTIVE'),
('EMP006', 'NCC Limited', 'NCCL', 'L45200TG1978PLC002119', 'AAACN0029B', '36AAACN0029B1ZP', 'NCC House, Plot No. 10, Sy. No. 83/1, Hyderabad - 500032', 'Venkat Reddy', 'venkat.reddy@nccltd.in', '040-23425566', 'ACTIVE'),
('EMP007', 'Sobha Limited', 'SL', 'L45201KA1995PLC018475', 'AAACP1250A', '29AAACP1250A1ZK', 'Sobha City, Puzhakkal, Thrissur - 680553', 'Mohan Nair', 'mohan.nair@sobha.com', '0487-2201111', 'ACTIVE'),
('EMP008', 'Brigade Enterprises Limited', 'BEL', 'L85110KA1995PLC019126', 'AAACB1640A', '29AAACB1640A1ZM', 'Brigade House, 26/1, Race Course Road, Bangalore - 560001', 'Suresh Kumar', 'suresh.kumar@brigade.co.in', '080-41335533', 'ACTIVE'),
('EMP009', 'Puravankara Limited', 'PL', 'L70102KA1986PLC007937', 'AAACP5201A', '29AAACP5201A1ZL', 'Puravankara House, 130/1, Brigade Road, Bangalore - 560025', 'Ashwin Prabhu', 'ashwin.prabhu@puravankara.com', '080-25599000', 'ACTIVE'),
('EMP010', 'GMR Infrastructure Limited', 'GMRIL', 'L45203DL1996PLC083630', 'AAACG9121A', '07AAACG9121A1ZN', 'GMR House, 3rd & 4th Floor, Sector-21A, Gurgaon - 122016', 'Amit Singh', 'amit.singh@gmrgroup.in', '0124-4205000', 'ACTIVE'),
('EMP011', 'Tata Projects Limited', 'TPL', 'U45209TG1979PLC002457', 'AAACT5950A', '36AAACT5950A1ZR', 'Tata Centre, 43, Jawaharlal Nehru Road, Kolkata - 700071', 'Raman Tata', 'raman.tata@tataprojects.com', '033-66123456', 'ACTIVE'),
('EMP012', 'IVRCL Limited', 'IVRCL', 'L45203AP1987PLC007633', 'AAACI5201B', '36AAACI5201B1ZS', 'IVRCL House, Cyber Hills, Gachibowli, Hyderabad - 500032', 'Krishna Murthy', 'krishna.murthy@ivrcl.com', '040-23114400', 'ACTIVE'),
('EMP013', 'Nagarjuna Construction Company Ltd', 'NCCL2', 'L45203AP1978PLC003119', 'AAACN5201C', '36AAACN5201C1ZT', 'Nagarjuna Hills, Punjagutta, Hyderabad - 500082', 'Nagarjuna Rao', 'nagarjuna.rao@nccltd.co.in', '040-23418888', 'ACTIVE'),
('EMP014', 'DLF Limited', 'DLFL', 'L70101HR1963PLC003852', 'AAACD0698A', '06AAACD0698A1ZU', 'DLF Centre, Sansad Marg, New Delhi - 110001', 'Vikram Kapoor', 'vikram.kapoor@dlf.in', '011-42576666', 'ACTIVE'),
('EMP015', 'Unitech Limited', 'UL', 'L74899DL1996PLC083271', 'AAACU0175A', '07AAACU0175A1ZV', 'Unitech House, South City-I, Gurgaon - 122001', 'Sanjay Chandra', 'sanjay.chandra@unitechgroup.com', '0124-4771000', 'ACTIVE');

-- Verification query
SELECT 'Employer Master sample data inserted successfully!' as status;
SELECT COUNT(*) as total_records FROM employer_master;
SELECT * FROM employer_master ORDER BY employer_id;
