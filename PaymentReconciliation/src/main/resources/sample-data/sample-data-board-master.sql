-- =============================================================================
-- Sample Data for Board Master Table
-- Payment Reconciliation Application
-- =============================================================================

USE paymentreconciliation_dev;

-- Insert sample board master data
INSERT INTO board_master (
    board_id, 
    board_name, 
    board_code, 
    state_name, 
    district_name, 
    address, 
    contact_person, 
    contact_email, 
    contact_phone, 
    status
) VALUES 
('BRD001', 'Maharashtra State Building and Construction Workers Welfare Board', 'MSBCWB', 'Maharashtra', 'Mumbai', 'Mantralaya, Mumbai - 400032', 'Rajesh Kumar', 'rajesh.kumar@msbcwb.gov.in', '022-22022001', 'ACTIVE'),
('BRD002', 'Karnataka Building and Other Construction Workers Welfare Board', 'KBOCWB', 'Karnataka', 'Bangalore', 'Vidhana Soudha, Bangalore - 560001', 'Suresh Reddy', 'suresh.reddy@kbocwb.gov.in', '080-22250001', 'ACTIVE'),
('BRD003', 'Tamil Nadu Construction Workers Welfare Board', 'TNCWB', 'Tamil Nadu', 'Chennai', 'Secretariat, Chennai - 600009', 'Murugan Pillai', 'murugan.pillai@tncwb.gov.in', '044-28511001', 'ACTIVE'),
('BRD004', 'Gujarat Building and Other Construction Workers Board', 'GBOCWB', 'Gujarat', 'Gandhinagar', 'Sachivalaya, Gandhinagar - 382010', 'Amit Patel', 'amit.patel@gbocwb.gov.in', '079-23251001', 'ACTIVE'),
('BRD005', 'Uttar Pradesh Building and Construction Workers Board', 'UPBCWB', 'Uttar Pradesh', 'Lucknow', 'Lal Bahadur Shastri Bhawan, Lucknow - 226001', 'Vinod Singh', 'vinod.singh@upbcwb.gov.in', '0522-2239001', 'ACTIVE'),
('BRD006', 'West Bengal Construction Workers Welfare Board', 'WBCWB', 'West Bengal', 'Kolkata', 'Writers Building, Kolkata - 700001', 'Subhash Chatterjee', 'subhash.chatterjee@wbcwb.gov.in', '033-22145001', 'ACTIVE'),
('BRD007', 'Rajasthan Building and Construction Workers Board', 'RBCWB', 'Rajasthan', 'Jaipur', 'Secretariat, Jaipur - 302005', 'Mohan Sharma', 'mohan.sharma@rbcwb.gov.in', '0141-2227001', 'ACTIVE'),
('BRD008', 'Andhra Pradesh Building Workers Welfare Board', 'APBWB', 'Andhra Pradesh', 'Amaravati', 'Secretariat, Amaravati - 522020', 'Rama Krishna', 'rama.krishna@apbwb.gov.in', '0863-2344001', 'ACTIVE'),
('BRD009', 'Telangana State Building Workers Board', 'TSBWB', 'Telangana', 'Hyderabad', 'Secretariat, Hyderabad - 500022', 'Srinivas Rao', 'srinivas.rao@tsbwb.gov.in', '040-23450001', 'ACTIVE'),
('BRD010', 'Punjab Building and Construction Workers Board', 'PBCWB', 'Punjab', 'Chandigarh', 'Punjab Civil Secretariat, Chandigarh - 160001', 'Harpreet Singh', 'harpreet.singh@pbcwb.gov.in', '0172-2741001', 'ACTIVE');

-- Verification query
SELECT 'Board Master sample data inserted successfully!' as status;
SELECT COUNT(*) as total_records FROM board_master;
SELECT * FROM board_master ORDER BY board_id;
