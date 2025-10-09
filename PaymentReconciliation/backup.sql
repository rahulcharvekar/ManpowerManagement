Enter password: 
-- MySQL dump 10.13  Distrib 9.4.0, for Linux (aarch64)
--
-- Host: localhost    Database: paymentreconciliation_dev
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `board_master`
--

DROP TABLE IF EXISTS `board_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `board_master` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `board_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `board_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `board_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `state_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `district_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `contact_person` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `board_id` (`board_id`),
  UNIQUE KEY `board_code` (`board_code`),
  KEY `idx_board_id` (`board_id`),
  KEY `idx_board_code` (`board_code`),
  KEY `idx_status` (`status`),
  KEY `idx_state_name` (`state_name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `board_master`
--

LOCK TABLES `board_master` WRITE;
/*!40000 ALTER TABLE `board_master` DISABLE KEYS */;
INSERT INTO `board_master` VALUES (1,'BRD001','Maharashtra State Building and Construction Workers Welfare Board','MSBCWB','Maharashtra','Mumbai','Mantralaya, Mumbai - 400032','Rajesh Kumar','rajesh.kumar@msbcwb.gov.in','022-22022001','ACTIVE','2025-10-07 11:09:42','2025-10-07 11:09:42'),(2,'BRD002','Karnataka Building and Other Construction Workers Welfare Board','KBOCWB','Karnataka','Bangalore','Vidhana Soudha, Bangalore - 560001','Suresh Reddy','suresh.reddy@kbocwb.gov.in','080-22250001','ACTIVE','2025-10-07 11:09:42','2025-10-07 11:09:42'),(3,'BRD003','Tamil Nadu Construction Workers Welfare Board','TNCWB','Tamil Nadu','Chennai','Secretariat, Chennai - 600009','Murugan Pillai','murugan.pillai@tncwb.gov.in','044-28511001','ACTIVE','2025-10-07 11:09:42','2025-10-07 11:09:42'),(4,'BRD004','Gujarat Building and Other Construction Workers Board','GBOCWB','Gujarat','Gandhinagar','Sachivalaya, Gandhinagar - 382010','Amit Patel','amit.patel@gbocwb.gov.in','079-23251001','ACTIVE','2025-10-07 11:09:42','2025-10-07 11:09:42'),(5,'BRD005','Uttar Pradesh Building and Construction Workers Board','UPBCWB','Uttar Pradesh','Lucknow','Lal Bahadur Shastri Bhawan, Lucknow - 226001','Vinod Singh','vinod.singh@upbcwb.gov.in','0522-2239001','ACTIVE','2025-10-07 11:09:42','2025-10-07 11:09:42'),(6,'BRD006','West Bengal Construction Workers Welfare Board','WBCWB','West Bengal','Kolkata','Writers Building, Kolkata - 700001','Subhash Chatterjee','subhash.chatterjee@wbcwb.gov.in','033-22145001','ACTIVE','2025-10-07 11:09:42','2025-10-07 11:09:42'),(7,'BRD007','Rajasthan Building and Construction Workers Board','RBCWB','Rajasthan','Jaipur','Secretariat, Jaipur - 302005','Mohan Sharma','mohan.sharma@rbcwb.gov.in','0141-2227001','ACTIVE','2025-10-07 11:09:42','2025-10-07 11:09:42'),(8,'BRD008','Andhra Pradesh Building Workers Welfare Board','APBWB','Andhra Pradesh','Amaravati','Secretariat, Amaravati - 522020','Rama Krishna','rama.krishna@apbwb.gov.in','0863-2344001','ACTIVE','2025-10-07 11:09:42','2025-10-07 11:09:42'),(9,'BRD009','Telangana State Building Workers Board','TSBWB','Telangana','Hyderabad','Secretariat, Hyderabad - 500022','Srinivas Rao','srinivas.rao@tsbwb.gov.in','040-23450001','ACTIVE','2025-10-07 11:09:42','2025-10-07 11:09:42'),(10,'BRD010','Punjab Building and Construction Workers Board','PBCWB','Punjab','Chandigarh','Punjab Civil Secretariat, Chandigarh - 160001','Harpreet Singh','harpreet.singh@pbcwb.gov.in','0172-2741001','ACTIVE','2025-10-07 11:09:42','2025-10-07 11:09:42');
/*!40000 ALTER TABLE `board_master` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `board_receipts`
--

DROP TABLE IF EXISTS `board_receipts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `board_receipts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `board_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `board_reference` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employer_reference` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employer_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `toli_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `utr_number` varchar(48) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `maker` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checker` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `receipt_date` date NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_board_id` (`board_id`),
  KEY `idx_board_reference` (`board_reference`),
  KEY `idx_employer_reference` (`employer_reference`),
  KEY `idx_employer_id` (`employer_id`),
  KEY `idx_toli_id` (`toli_id`),
  KEY `idx_utr_number` (`utr_number`),
  KEY `idx_status` (`status`),
  KEY `idx_receipt_date` (`receipt_date`),
  KEY `idx_maker` (`maker`),
  KEY `idx_checker` (`checker`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `board_receipts`
--

LOCK TABLES `board_receipts` WRITE;
/*!40000 ALTER TABLE `board_receipts` DISABLE KEYS */;
INSERT INTO `board_receipts` VALUES (1,'BOARD_BRD-20251007-222','BRD-20251007-222','EMP-20251007-201825-236','EMP_TECHCORP_LTD','TOLI_ENGINEERING',12612.00,'','PENDING','Rahul',NULL,'2025-10-07'),(2,'BOARD_BRD-20251007-222','BRD-20251007-222','EMP-20251007-201825-236','EMP_TECHCORP_LTD','TOLI_ENGINEERING',12612.00,'TXNREF','VERIFIED','Rahul','Ram','2025-10-07');
/*!40000 ALTER TABLE `board_receipts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `component_permissions`
--

DROP TABLE IF EXISTS `component_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `component_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `component_id` bigint NOT NULL COMMENT 'Reference to ui_components table',
  `action` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Action type (VIEW, CREATE, EDIT, DELETE, etc.)',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'Description of what this permission allows',
  `is_active` tinyint(1) DEFAULT '1' COMMENT 'Whether this permission is active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_component_action` (`component_id`,`action`),
  KEY `idx_component_id` (`component_id`),
  KEY `idx_action` (`action`),
  KEY `idx_active` (`is_active`),
  CONSTRAINT `component_permissions_ibfk_1` FOREIGN KEY (`component_id`) REFERENCES `ui_components` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Specific permissions (actions) available for each UI component';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `component_permissions`
--

LOCK TABLES `component_permissions` WRITE;
/*!40000 ALTER TABLE `component_permissions` DISABLE KEYS */;
INSERT INTO `component_permissions` VALUES (1,1,'VIEW','Can view and access Dashboard',1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(2,2,'VIEW','Can view and access User Management',1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(3,3,'VIEW','Can view and access System Settings',1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(4,4,'VIEW','Can view and access System Logs',1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(5,5,'VIEW','Can view and access Payment Processing',1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(6,6,'VIEW','Can view and access Reconciliation Dashboard',1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(7,7,'VIEW','Can view and access Worker Payments',1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(8,8,'VIEW','Can view and access Worker Data Upload',1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(9,9,'VIEW','Can view and access Employer Receipts',1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(10,10,'VIEW','Can view and access Board Receipts',1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(11,11,'VIEW','Can view and access Reports',1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(16,5,'CREATE','Can create new records in Payment Processing',1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(17,3,'CREATE','Can create new records in System Settings',1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(18,2,'CREATE','Can create new records in User Management',1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(19,8,'CREATE','Can create new records in Worker Data Upload',1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(23,9,'EDIT','Can edit and modify records in Employer Receipts',1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(24,5,'EDIT','Can edit and modify records in Payment Processing',1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(25,3,'EDIT','Can edit and modify records in System Settings',1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(26,2,'EDIT','Can edit and modify records in User Management',1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(27,7,'EDIT','Can edit and modify records in Worker Payments',1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(30,4,'DELETE','Can delete records from System Logs',1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(31,2,'DELETE','Can delete records from User Management',1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(32,7,'DELETE','Can delete records from Worker Payments',1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(33,10,'APPROVE','Can approve items in Board Receipts',1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(34,9,'APPROVE','Can approve items in Employer Receipts',1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(35,5,'APPROVE','Can approve items in Payment Processing',1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(36,10,'REJECT','Can reject items in Board Receipts',1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(37,9,'REJECT','Can reject items in Employer Receipts',1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(38,5,'REJECT','Can reject items in Payment Processing',1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(39,8,'UPLOAD','Can upload files to Worker Data Upload',1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(40,9,'EXPORT','Can export data from Employer Receipts',1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(41,6,'EXPORT','Can export data from Reconciliation Dashboard',1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(42,11,'EXPORT','Can export data from Reports',1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(43,4,'EXPORT','Can export data from System Logs',1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(44,7,'EXPORT','Can export data from Worker Payments',1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(47,3,'MANAGE','Full management access to System Settings',1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(48,2,'MANAGE','Full management access to User Management',1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(50,1,'ANALYTICS','Can view analytics and insights in Dashboard',1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(51,6,'ANALYTICS','Can view analytics and insights in Reconciliation Dashboard',1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(52,11,'ANALYTICS','Can view analytics and insights in Reports',1,'2025-10-06 14:52:42','2025-10-06 14:52:42');
/*!40000 ALTER TABLE `component_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employer_master`
--

DROP TABLE IF EXISTS `employer_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employer_master` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `employer_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employer_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employer_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_registration_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pan_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gst_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `contact_person` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employer_id` (`employer_id`),
  UNIQUE KEY `employer_code` (`employer_code`),
  KEY `idx_employer_id` (`employer_id`),
  KEY `idx_employer_code` (`employer_code`),
  KEY `idx_status` (`status`),
  KEY `idx_pan_number` (`pan_number`),
  KEY `idx_gst_number` (`gst_number`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employer_master`
--

LOCK TABLES `employer_master` WRITE;
/*!40000 ALTER TABLE `employer_master` DISABLE KEYS */;
INSERT INTO `employer_master` VALUES (1,'EMP001','Larsen & Toubro Limited','LNT','U99999MH1946PLC004768','AAACL0204C','27AAACL0204C1ZF','L&T House, Ballard Estate, Mumbai - 400001','Anil Kumar','anil.kumar@lnt.com','022-67525656','ACTIVE','2025-10-07 11:09:48','2025-10-07 11:09:48'),(2,'EMP002','Shapoorji Pallonji and Company Pvt Ltd','SPCPL','U45200MH1865PTC000638','AAACP0208B','27AAACP0208B1ZG','SP House, 41/44 Minoo Desai Marg, Mumbai - 400005','Ravi Menon','ravi.menon@shapoorji.com','022-66794444','ACTIVE','2025-10-07 11:09:48','2025-10-07 11:09:48'),(3,'EMP003','Hindustan Construction Company Ltd','HCC','L45200MH1926PLC001615','AAACH0918F','27AAACH0918F1ZD','Hincon House, 247 Park, LBS Marg, Mumbai - 400070','Sunil Sharma','sunil.sharma@hccindia.com','022-25969933','ACTIVE','2025-10-07 11:09:48','2025-10-07 11:09:48'),(4,'EMP004','Gammon India Limited','GIL','L45200MH1922PLC000731','AAACG0208A','27AAACG0208A1ZC','Gammon House, Veer Savarkar Marg, Mumbai - 400025','Prakash Joshi','prakash.joshi@gammonindia.com','022-24923030','ACTIVE','2025-10-07 11:09:48','2025-10-07 11:09:48'),(5,'EMP005','Afcons Infrastructure Limited','AIL','L45200MH1959PLC011671','AAACA1847B','27AAACA1847B1ZH','Afcons House, S V Road, Andheri (W), Mumbai - 400058','Rajesh Patil','rajesh.patil@afcons.com','022-67919999','ACTIVE','2025-10-07 11:09:48','2025-10-07 11:09:48'),(6,'EMP006','NCC Limited','NCCL','L45200TG1978PLC002119','AAACN0029B','36AAACN0029B1ZP','NCC House, Plot No. 10, Sy. No. 83/1, Hyderabad - 500032','Venkat Reddy','venkat.reddy@nccltd.in','040-23425566','ACTIVE','2025-10-07 11:09:48','2025-10-07 11:09:48'),(7,'EMP007','Sobha Limited','SL','L45201KA1995PLC018475','AAACP1250A','29AAACP1250A1ZK','Sobha City, Puzhakkal, Thrissur - 680553','Mohan Nair','mohan.nair@sobha.com','0487-2201111','ACTIVE','2025-10-07 11:09:48','2025-10-07 11:09:48'),(8,'EMP008','Brigade Enterprises Limited','BEL','L85110KA1995PLC019126','AAACB1640A','29AAACB1640A1ZM','Brigade House, 26/1, Race Course Road, Bangalore - 560001','Suresh Kumar','suresh.kumar@brigade.co.in','080-41335533','ACTIVE','2025-10-07 11:09:48','2025-10-07 11:09:48'),(9,'EMP009','Puravankara Limited','PL','L70102KA1986PLC007937','AAACP5201A','29AAACP5201A1ZL','Puravankara House, 130/1, Brigade Road, Bangalore - 560025','Ashwin Prabhu','ashwin.prabhu@puravankara.com','080-25599000','ACTIVE','2025-10-07 11:09:48','2025-10-07 11:09:48'),(10,'EMP010','GMR Infrastructure Limited','GMRIL','L45203DL1996PLC083630','AAACG9121A','07AAACG9121A1ZN','GMR House, 3rd & 4th Floor, Sector-21A, Gurgaon - 122016','Amit Singh','amit.singh@gmrgroup.in','0124-4205000','ACTIVE','2025-10-07 11:09:48','2025-10-07 11:09:48'),(11,'EMP011','Tata Projects Limited','TPL','U45209TG1979PLC002457','AAACT5950A','36AAACT5950A1ZR','Tata Centre, 43, Jawaharlal Nehru Road, Kolkata - 700071','Raman Tata','raman.tata@tataprojects.com','033-66123456','ACTIVE','2025-10-07 11:09:48','2025-10-07 11:09:48'),(12,'EMP012','IVRCL Limited','IVRCL','L45203AP1987PLC007633','AAACI5201B','36AAACI5201B1ZS','IVRCL House, Cyber Hills, Gachibowli, Hyderabad - 500032','Krishna Murthy','krishna.murthy@ivrcl.com','040-23114400','ACTIVE','2025-10-07 11:09:48','2025-10-07 11:09:48'),(13,'EMP013','Nagarjuna Construction Company Ltd','NCCL2','L45203AP1978PLC003119','AAACN5201C','36AAACN5201C1ZT','Nagarjuna Hills, Punjagutta, Hyderabad - 500082','Nagarjuna Rao','nagarjuna.rao@nccltd.co.in','040-23418888','ACTIVE','2025-10-07 11:09:48','2025-10-07 11:09:48'),(14,'EMP014','DLF Limited','DLFL','L70101HR1963PLC003852','AAACD0698A','06AAACD0698A1ZU','DLF Centre, Sansad Marg, New Delhi - 110001','Vikram Kapoor','vikram.kapoor@dlf.in','011-42576666','ACTIVE','2025-10-07 11:09:48','2025-10-07 11:09:48'),(15,'EMP015','Unitech Limited','UL','L74899DL1996PLC083271','AAACU0175A','07AAACU0175A1ZV','Unitech House, South City-I, Gurgaon - 122001','Sanjay Chandra','sanjay.chandra@unitechgroup.com','0124-4771000','ACTIVE','2025-10-07 11:09:48','2025-10-07 11:09:48');
/*!40000 ALTER TABLE `employer_master` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employer_payment_receipts`
--

DROP TABLE IF EXISTS `employer_payment_receipts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employer_payment_receipts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `employer_receipt_number` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `worker_receipt_number` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employer_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `toli_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `transaction_reference` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `validated_by` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `validated_at` datetime NOT NULL,
  `total_records` int NOT NULL,
  `total_amount` decimal(15,2) NOT NULL,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employer_receipt_number` (`employer_receipt_number`),
  KEY `idx_employer_receipt_number` (`employer_receipt_number`),
  KEY `idx_worker_receipt_number` (`worker_receipt_number`),
  KEY `idx_employer_id` (`employer_id`),
  KEY `idx_toli_id` (`toli_id`),
  KEY `idx_transaction_reference` (`transaction_reference`),
  KEY `idx_validated_by` (`validated_by`),
  KEY `idx_validated_at` (`validated_at`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employer_payment_receipts`
--

LOCK TABLES `employer_payment_receipts` WRITE;
/*!40000 ALTER TABLE `employer_payment_receipts` DISABLE KEYS */;
INSERT INTO `employer_payment_receipts` VALUES (1,'EMP-20251007-201825-236','RCP-20251007-201746-391','EMP_TECHCORP_LTD','TOLI_ENGINEERING','TXNREF','Rahul','2025-10-07 15:01:28',12,12612.00,'RECONCILED');
/*!40000 ALTER TABLE `employer_payment_receipts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employer_toli_relation`
--

DROP TABLE IF EXISTS `employer_toli_relation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employer_toli_relation` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `employer_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `toli_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `toli_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `toli_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `supervisor_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `supervisor_contact` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_employer_toli` (`employer_id`,`toli_id`),
  KEY `idx_employer_id` (`employer_id`),
  KEY `idx_toli_id` (`toli_id`),
  KEY `idx_status` (`status`),
  KEY `idx_toli_code` (`toli_code`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employer_toli_relation`
--

LOCK TABLES `employer_toli_relation` WRITE;
/*!40000 ALTER TABLE `employer_toli_relation` DISABLE KEYS */;
INSERT INTO `employer_toli_relation` VALUES (1,'EMP001','TOLI001','LNT Mumbai Construction Toli','LNT-MUM-001','Bandra Kurla Complex, Mumbai','Suresh Patil','9876543210','ACTIVE','2025-10-07 11:10:01','2025-10-07 11:10:01'),(2,'EMP001','TOLI002','LNT Pune Infrastructure Toli','LNT-PUN-002','Hinjewadi, Pune','Rajesh Kumar','9876543211','ACTIVE','2025-10-07 11:10:01','2025-10-07 11:10:01'),(3,'EMP001','TOLI003','LNT Chennai Metro Toli','LNT-CHE-003','Guindy, Chennai','Murugan Rajan','9876543212','ACTIVE','2025-10-07 11:10:01','2025-10-07 11:10:01'),(4,'EMP002','TOLI004','SP Mumbai Residential Toli','SP-MUM-004','Lower Parel, Mumbai','Anil Desai','8765432109','ACTIVE','2025-10-07 11:10:01','2025-10-07 11:10:01'),(5,'EMP002','TOLI005','SP Bangalore IT Park Toli','SP-BLR-005','Electronic City, Bangalore','Venkatesh Rao','8765432108','ACTIVE','2025-10-07 11:10:01','2025-10-07 11:10:01'),(6,'EMP002','TOLI006','SP Hyderabad Commercial Toli','SP-HYD-006','Gachibowli, Hyderabad','Srinivas Reddy','8765432107','ACTIVE','2025-10-07 11:10:01','2025-10-07 11:10:01'),(7,'EMP003','TOLI007','HCC Mumbai Marine Drive Toli','HCC-MUM-007','Marine Drive, Mumbai','Prakash Joshi','7654321098','ACTIVE','2025-10-07 11:10:01','2025-10-07 11:10:01'),(8,'EMP003','TOLI008','HCC Delhi Metro Toli','HCC-DEL-008','Connaught Place, Delhi','Vikash Sharma','7654321097','ACTIVE','2025-10-07 11:10:01','2025-10-07 11:10:01'),(9,'EMP003','TOLI009','HCC Kolkata Bridge Toli','HCC-KOL-009','Salt Lake, Kolkata','Subhash Das','7654321096','ACTIVE','2025-10-07 11:10:01','2025-10-07 11:10:01'),(10,'EMP004','TOLI010','Gammon Mumbai Airport Toli','GMN-MUM-010','Andheri, Mumbai','Ravi Menon','6543210987','ACTIVE','2025-10-07 11:10:01','2025-10-07 11:10:01'),(11,'EMP004','TOLI011','Gammon Bangalore Highway Toli','GMN-BLR-011','Hosur Road, Bangalore','Mohan Nair','6543210986','ACTIVE','2025-10-07 11:10:01','2025-10-07 11:10:01'),(12,'EMP004','TOLI012','Gammon Chennai Port Toli','GMN-CHE-012','Ennore, Chennai','Raman Pillai','6543210985','ACTIVE','2025-10-07 11:10:01','2025-10-07 11:10:01'),(13,'EMP005','TOLI013','Afcons Mumbai Subway Toli','AFC-MUM-013','Dadar, Mumbai','Santosh Patil','5432109876','ACTIVE','2025-10-07 11:10:01','2025-10-07 11:10:01'),(14,'EMP005','TOLI014','Afcons Pune Metro Toli','AFC-PUN-014','Kothrud, Pune','Deepak Joshi','5432109875','ACTIVE','2025-10-07 11:10:01','2025-10-07 11:10:01'),(15,'EMP005','TOLI015','Afcons Ahmedabad Bridge Toli','AFC-AHM-015','Sabarmati, Ahmedabad','Kiran Patel','5432109874','ACTIVE','2025-10-07 11:10:01','2025-10-07 11:10:01'),(16,'EMP006','TOLI016','NCC Hyderabad Metro Toli','NCC-HYD-016','HITEC City, Hyderabad','Krishna Murthy','4321098765','ACTIVE','2025-10-07 11:10:01','2025-10-07 11:10:01'),(17,'EMP006','TOLI017','NCC Bangalore Airport Toli','NCC-BLR-017','Devanahalli, Bangalore','Suresh Reddy','4321098764','ACTIVE','2025-10-07 11:10:01','2025-10-07 11:10:01'),(18,'EMP006','TOLI018','NCC Chennai IT Corridor Toli','NCC-CHE-018','OMR, Chennai','Rajesh Kumar','4321098763','ACTIVE','2025-10-07 11:10:01','2025-10-07 11:10:01'),(19,'EMP007','TOLI019','Sobha Bangalore Residential Toli','SBH-BLR-019','Whitefield, Bangalore','Girish Nair','3210987654','ACTIVE','2025-10-07 11:10:01','2025-10-07 11:10:01'),(20,'EMP007','TOLI020','Sobha Kochi Apartment Toli','SBH-KOC-020','Marine Drive, Kochi','Sunil Kumar','3210987653','ACTIVE','2025-10-07 11:10:01','2025-10-07 11:10:01'),(21,'EMP007','TOLI021','Sobha Chennai Villa Toli','SBH-CHE-021','Sholinganallur, Chennai','Ramesh Babu','3210987652','ACTIVE','2025-10-07 11:10:01','2025-10-07 11:10:01'),(22,'EMP008','TOLI022','Brigade Bangalore Commercial Toli','BRG-BLR-022','Brigade Road, Bangalore','Ashwin Prabhu','2109876543','ACTIVE','2025-10-07 11:10:01','2025-10-07 11:10:01'),(23,'EMP008','TOLI023','Brigade Chennai Mall Toli','BRG-CHE-023','Express Avenue, Chennai','Venkat Raman','2109876542','ACTIVE','2025-10-07 11:10:01','2025-10-07 11:10:01'),(24,'EMP008','TOLI024','Brigade Hyderabad Office Toli','BRG-HYD-024','Banjara Hills, Hyderabad','Sanjay Reddy','2109876541','ACTIVE','2025-10-07 11:10:01','2025-10-07 11:10:01'),(25,'EMP009','TOLI025','Puravankara Bangalore Housing Toli','PVK-BLR-025','JP Nagar, Bangalore','Madhav Rao','1098765432','ACTIVE','2025-10-07 11:10:01','2025-10-07 11:10:01'),(26,'EMP009','TOLI026','Puravankara Mumbai Premium Toli','PVK-MUM-026','Thane, Mumbai','Amit Shah','1098765431','ACTIVE','2025-10-07 11:10:01','2025-10-07 11:10:01'),(27,'EMP009','TOLI027','Puravankara Chennai Luxury Toli','PVK-CHE-027','Pallavaram, Chennai','Karthik Krishnan','1098765430','ACTIVE','2025-10-07 11:10:01','2025-10-07 11:10:01'),(28,'EMP010','TOLI028','GMR Delhi Airport Toli','GMR-DEL-028','IGI Airport, Delhi','Rajesh Singh','9876501234','ACTIVE','2025-10-07 11:10:01','2025-10-07 11:10:01'),(29,'EMP010','TOLI029','GMR Hyderabad Airport Toli','GMR-HYD-029','Shamshabad, Hyderabad','Prasad Reddy','9876501235','ACTIVE','2025-10-07 11:10:01','2025-10-07 11:10:01'),(30,'EMP010','TOLI030','GMR Bangalore Highway Toli','GMR-BLR-030','Electronic City, Bangalore','Naveen Kumar','9876501236','ACTIVE','2025-10-07 11:10:01','2025-10-07 11:10:01'),(31,'EMP011','TOLI031','Tata Kolkata Steel Plant Toli','TAT-KOL-031','Jamshedpur, Kolkata','Debashish Roy','8765401234','ACTIVE','2025-10-07 11:10:01','2025-10-07 11:10:01'),(32,'EMP011','TOLI032','Tata Mumbai Power Plant Toli','TAT-MUM-032','Trombay, Mumbai','Rohit Sharma','8765401235','ACTIVE','2025-10-07 11:10:01','2025-10-07 11:10:01'),(33,'EMP011','TOLI033','Tata Chennai Refinery Toli','TAT-CHE-033','Manali, Chennai','Selvam Raj','8765401236','ACTIVE','2025-10-07 11:10:01','2025-10-07 11:10:01'),(34,'EMP012','TOLI034','IVRCL Hyderabad Infrastructure Toli','IVR-HYD-034','Kukatpally, Hyderabad','Ramesh Babu','7654301234','ACTIVE','2025-10-07 11:10:01','2025-10-07 11:10:01'),(35,'EMP012','TOLI035','IVRCL Bangalore IT Campus Toli','IVR-BLR-035','Marathahalli, Bangalore','Sunil Reddy','7654301235','ACTIVE','2025-10-07 11:10:01','2025-10-07 11:10:01'),(36,'EMP012','TOLI036','IVRCL Chennai Industrial Toli','IVR-CHE-036','Sriperumbudur, Chennai','Prakash Murugan','7654301236','ACTIVE','2025-10-07 11:10:01','2025-10-07 11:10:01'),(37,'EMP013','TOLI037','Nagarjuna Hyderabad Metro Phase 2 Toli','NAG-HYD-037','Secunderabad, Hyderabad','Krishna Rao','6543201234','ACTIVE','2025-10-07 11:10:01','2025-10-07 11:10:01'),(38,'EMP014','TOLI038','DLF Gurgaon Cyber City Toli','DLF-GUR-038','Cyber City, Gurgaon','Manoj Kapoor','5432101234','ACTIVE','2025-10-07 11:10:01','2025-10-07 11:10:01'),(39,'EMP015','TOLI039','Unitech Noida Commercial Toli','UNI-NOI-039','Sector 62, Noida','Vivek Chandra','4321001234','ACTIVE','2025-10-07 11:10:01','2025-10-07 11:10:01'),(40,'EMP001','TOLI040','Multi-Employer Delhi Infrastructure Hub','MUL-DEL-040','Dwarka, Delhi','Shared Supervisor Team','3210901234','ACTIVE','2025-10-07 11:10:01','2025-10-07 11:10:01'),(41,'EMP002','TOLI040','Multi-Employer Delhi Infrastructure Hub','MUL-DEL-040','Dwarka, Delhi','Shared Supervisor Team','3210901234','ACTIVE','2025-10-07 11:10:01','2025-10-07 11:10:01');
/*!40000 ALTER TABLE `employer_toli_relation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permission_api_endpoints`
--

DROP TABLE IF EXISTS `permission_api_endpoints`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permission_api_endpoints` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `permission_id` bigint NOT NULL,
  `api_endpoint` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `http_method` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'GET',
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_permission_endpoint_method` (`permission_id`,`api_endpoint`,`http_method`),
  KEY `idx_permission_id` (`permission_id`),
  KEY `idx_api_endpoint` (`api_endpoint`),
  KEY `idx_http_method` (`http_method`),
  KEY `idx_active` (`is_active`),
  CONSTRAINT `permission_api_endpoints_ibfk_1` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=131 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permission_api_endpoints`
--

LOCK TABLES `permission_api_endpoints` WRITE;
/*!40000 ALTER TABLE `permission_api_endpoints` DISABLE KEYS */;
INSERT INTO `permission_api_endpoints` VALUES (1,396,'/api/auth/login','POST','User login endpoint',1,'2025-10-07 11:12:38',NULL),(2,397,'/api/auth/logout','POST','User logout endpoint',1,'2025-10-07 11:12:38',NULL),(3,398,'/api/auth/refresh','POST','Refresh authentication token',1,'2025-10-07 11:12:38',NULL),(4,399,'/api/auth/profile','GET','Get user profile',1,'2025-10-07 11:12:38',NULL),(5,400,'/api/auth/profile','PUT','Update user profile',1,'2025-10-07 11:12:38',NULL),(6,401,'/api/auth/change-password','POST','Change user password',1,'2025-10-07 11:12:38',NULL),(7,402,'/api/admin/users','GET','Get all users list',1,'2025-10-07 11:12:38',NULL),(8,403,'/api/admin/users/{id}','GET','Get specific user details',1,'2025-10-07 11:12:38',NULL),(9,404,'/api/admin/users','POST','Create new user',1,'2025-10-07 11:12:38',NULL),(10,405,'/api/admin/users/{id}','PUT','Update user information',1,'2025-10-07 11:12:38',NULL),(11,406,'/api/admin/users/{id}','DELETE','Delete user account',1,'2025-10-07 11:12:38',NULL),(12,407,'/api/admin/users/{id}/activate','POST','Activate user account',1,'2025-10-07 11:12:38',NULL),(13,408,'/api/admin/users/{id}/deactivate','POST','Deactivate user account',1,'2025-10-07 11:12:38',NULL),(14,409,'/api/admin/users/{id}/reset-password','POST','Reset user password',1,'2025-10-07 11:12:38',NULL),(15,410,'/api/admin/roles','GET','Get all roles list',1,'2025-10-07 11:12:38',NULL),(16,411,'/api/admin/roles/{id}','GET','Get specific role details',1,'2025-10-07 11:12:38',NULL),(17,412,'/api/admin/roles','POST','Create new role',1,'2025-10-07 11:12:38',NULL),(18,413,'/api/admin/roles/{id}','PUT','Update role information',1,'2025-10-07 11:12:38',NULL),(19,414,'/api/admin/roles/{id}','DELETE','Delete role',1,'2025-10-07 11:12:38',NULL),(20,415,'/api/admin/users/{userId}/roles/{roleId}','POST','Assign role to user',1,'2025-10-07 11:12:38',NULL),(21,416,'/api/admin/users/{userId}/roles/{roleId}','DELETE','Remove role from user',1,'2025-10-07 11:12:38',NULL),(22,417,'/api/admin/permissions','GET','Get all permissions list',1,'2025-10-07 11:12:38',NULL),(23,418,'/api/admin/permissions/{id}','GET','Get specific permission details',1,'2025-10-07 11:12:38',NULL),(24,419,'/api/admin/permissions','POST','Create new permission',1,'2025-10-07 11:12:38',NULL),(25,420,'/api/admin/permissions/{id}','PUT','Update permission information',1,'2025-10-07 11:12:38',NULL),(26,421,'/api/admin/permissions/{id}','DELETE','Delete permission',1,'2025-10-07 11:12:38',NULL),(27,422,'/api/admin/roles/{roleId}/permissions/{permissionId}','POST','Assign permission to role',1,'2025-10-07 11:12:38',NULL),(28,423,'/api/admin/roles/{roleId}/permissions/{permissionId}','DELETE','Remove permission from role',1,'2025-10-07 11:12:38',NULL),(29,424,'/api/v1/worker-payments','GET','Get worker payments list',1,'2025-10-07 11:12:38',NULL),(30,425,'/api/v1/worker-payments/{id}','GET','Get specific worker payment',1,'2025-10-07 11:12:38',NULL),(31,426,'/api/v1/worker-payments','POST','Create worker payment record',1,'2025-10-07 11:12:38',NULL),(32,427,'/api/v1/worker-payments/{id}','PUT','Update worker payment',1,'2025-10-07 11:12:38',NULL),(33,428,'/api/v1/worker-payments/{id}','DELETE','Delete worker payment',1,'2025-10-07 11:12:38',NULL),(34,429,'/api/worker/uploaded-data/files','GET','Get uploaded files list',1,'2025-10-07 11:12:38',NULL),(35,430,'/api/worker/uploaded-data/files/{id}/summary','GET','Get file summary',1,'2025-10-07 11:12:38',NULL),(36,431,'/api/worker/uploaded-data/upload','POST','Upload worker data file',1,'2025-10-07 11:12:38',NULL),(37,432,'/api/worker/uploaded-data/files/{id}/validate','POST','Validate worker file',1,'2025-10-07 11:12:38',NULL),(38,433,'/api/worker/uploaded-data/files/{id}','DELETE','Delete uploaded file',1,'2025-10-07 11:12:38',NULL),(39,434,'/api/worker/uploaded-data/files/{id}/download','GET','Download worker file',1,'2025-10-07 11:12:38',NULL),(40,435,'/api/v1/worker-payments/generate-batch','POST','Generate payment batch',1,'2025-10-07 11:12:38',NULL),(41,436,'/api/v1/worker-payments/{id}/approve','POST','Approve worker payment',1,'2025-10-07 11:12:38',NULL),(42,437,'/api/v1/worker-payments/{id}/reject','POST','Reject worker payment',1,'2025-10-07 11:12:38',NULL),(43,438,'/api/v1/worker-payments/bulk-approve','POST','Bulk approve worker payments',1,'2025-10-07 11:12:38',NULL),(44,439,'/api/v1/worker-payments/bulk-reject','POST','Bulk reject worker payments',1,'2025-10-07 11:12:38',NULL),(45,440,'/api/v1/worker-payments/reports','GET','Generate worker payment report',1,'2025-10-07 11:12:38',NULL),(46,441,'/api/v1/worker-payments/export','GET','Export worker payment data',1,'2025-10-07 11:12:38',NULL),(47,442,'/api/payment-processing/queue','GET','Get payment processing queue',1,'2025-10-07 11:12:38',NULL),(48,443,'/api/payment-processing/{id}/status','GET','Get payment status',1,'2025-10-07 11:12:38',NULL),(49,444,'/api/payment-processing/{id}/process','POST','Process individual payment',1,'2025-10-07 11:12:38',NULL),(50,445,'/api/payment-processing/batch-process','POST','Batch process payments',1,'2025-10-07 11:12:38',NULL),(51,446,'/api/payment-processing/{id}/retry','POST','Retry failed payment',1,'2025-10-07 11:12:38',NULL),(52,447,'/api/payment-processing/{id}/cancel','POST','Cancel payment processing',1,'2025-10-07 11:12:38',NULL),(53,448,'/api/payment-processing/{id}/approve','POST','Approve payment request',1,'2025-10-07 11:12:38',NULL),(54,449,'/api/payment-processing/{id}/reject','POST','Reject payment request',1,'2025-10-07 11:12:38',NULL),(55,450,'/api/payment-processing/bulk-approve','POST','Bulk approve payments',1,'2025-10-07 11:12:38',NULL),(56,451,'/api/payment-processing/bulk-reject','POST','Bulk reject payments',1,'2025-10-07 11:12:38',NULL),(57,452,'/api/payment-processing/reports/summary','GET','Generate payment summary report',1,'2025-10-07 11:12:38',NULL),(58,453,'/api/payment-processing/reports/detailed','GET','Generate detailed payment report',1,'2025-10-07 11:12:38',NULL),(59,454,'/api/payment-processing/export','GET','Export payment data',1,'2025-10-07 11:12:38',NULL),(60,455,'/api/payment-processing/analytics','GET','View payment analytics',1,'2025-10-07 11:12:38',NULL),(61,456,'/api/employer/receipts','GET','Get employer receipts list',1,'2025-10-07 11:12:38',NULL),(62,457,'/api/employer/receipts/{id}','GET','Get employer receipt details',1,'2025-10-07 11:12:38',NULL),(63,458,'/api/employer/receipts','POST','Create employer receipt',1,'2025-10-07 11:12:38',NULL),(64,459,'/api/employer/receipts/{id}','PUT','Update employer receipt',1,'2025-10-07 11:12:38',NULL),(65,460,'/api/employer/receipts/{id}','DELETE','Delete employer receipt',1,'2025-10-07 11:12:38',NULL),(66,461,'/api/employer/receipts/{id}/validate','POST','Validate employer receipt',1,'2025-10-07 11:12:38',NULL),(67,462,'/api/employer/receipts/{id}/approve','POST','Approve employer receipt',1,'2025-10-07 11:12:38',NULL),(68,463,'/api/employer/receipts/{id}/reject','POST','Reject employer receipt',1,'2025-10-07 11:12:38',NULL),(69,464,'/api/employer/receipts/{id}/send-to-board','POST','Send receipt to board',1,'2025-10-07 11:12:38',NULL),(70,465,'/api/employer/receipts/reports','GET','Generate employer receipt report',1,'2025-10-07 11:12:38',NULL),(71,466,'/api/employer/receipts/export','GET','Export employer receipt data',1,'2025-10-07 11:12:38',NULL),(72,467,'/api/v1/board-receipts','GET','Get board receipts list',1,'2025-10-07 11:12:38',NULL),(73,468,'/api/v1/board-receipts/{id}','GET','Get board receipt details',1,'2025-10-07 11:12:38',NULL),(74,469,'/api/v1/board-receipts','POST','Create board receipt',1,'2025-10-07 11:12:38',NULL),(75,470,'/api/v1/board-receipts/{id}','PUT','Update board receipt',1,'2025-10-07 11:12:38',NULL),(76,471,'/api/v1/board-receipts/{id}','DELETE','Delete board receipt',1,'2025-10-07 11:12:38',NULL),(77,472,'/api/v1/board-receipts/{id}/approve','POST','Approve board receipt',1,'2025-10-07 11:12:38',NULL),(78,473,'/api/v1/board-receipts/{id}/reject','POST','Reject board receipt',1,'2025-10-07 11:12:38',NULL),(79,474,'/api/v1/board-receipts/bulk-approve','POST','Bulk approve board receipts',1,'2025-10-07 11:12:38',NULL),(80,475,'/api/v1/board-receipts/bulk-reject','POST','Bulk reject board receipts',1,'2025-10-07 11:12:38',NULL),(81,476,'/api/v1/board-receipts/{id}/return-to-employer','POST','Return receipt to employer',1,'2025-10-07 11:12:38',NULL),(82,477,'/api/v1/board-receipts/reports','GET','Generate board receipt report',1,'2025-10-07 11:12:38',NULL),(83,478,'/api/v1/board-receipts/export','GET','Export board receipt data',1,'2025-10-07 11:12:38',NULL),(84,479,'/api/v1/board-receipts/analytics','GET','View board analytics',1,'2025-10-07 11:12:38',NULL),(85,480,'/api/v1/reconciliations','GET','Get reconciliations list',1,'2025-10-07 11:12:38',NULL),(86,481,'/api/v1/reconciliations/{id}','GET','Get reconciliation details',1,'2025-10-07 11:12:38',NULL),(87,482,'/api/v1/reconciliations','POST','Create reconciliation',1,'2025-10-07 11:12:38',NULL),(88,483,'/api/v1/reconciliations/{id}','PUT','Update reconciliation',1,'2025-10-07 11:12:38',NULL),(89,484,'/api/v1/reconciliations/{id}','DELETE','Delete reconciliation',1,'2025-10-07 11:12:38',NULL),(90,485,'/api/v1/reconciliations/auto-reconcile','POST','Perform auto reconciliation',1,'2025-10-07 11:12:38',NULL),(91,486,'/api/v1/reconciliations/manual-reconcile','POST','Perform manual reconciliation',1,'2025-10-07 11:12:38',NULL),(92,487,'/api/v1/reconciliations/{id}/validate','POST','Validate reconciliation',1,'2025-10-07 11:12:38',NULL),(93,488,'/api/v1/reconciliations/{id}/approve','POST','Approve reconciliation',1,'2025-10-07 11:12:38',NULL),(94,489,'/api/v1/reconciliations/{id}/reject','POST','Reject reconciliation',1,'2025-10-07 11:12:38',NULL),(95,490,'/api/v1/reconciliations/reports/summary','GET','Generate reconciliation summary',1,'2025-10-07 11:12:38',NULL),(96,491,'/api/v1/reconciliations/reports/detailed','GET','Generate detailed reconciliation report',1,'2025-10-07 11:12:38',NULL),(97,492,'/api/v1/reconciliations/export','GET','Export reconciliation data',1,'2025-10-07 11:12:38',NULL),(98,493,'/api/v1/reconciliations/analytics','GET','View reconciliation analytics',1,'2025-10-07 11:12:38',NULL),(99,494,'/api/v1/reconciliations/bank-statements/upload','POST','Upload bank statement',1,'2025-10-07 11:12:38',NULL),(100,495,'/api/v1/reconciliations/bank-statements/{id}/parse','POST','Parse bank statement',1,'2025-10-07 11:12:38',NULL),(101,496,'/api/v1/reconciliations/bank-statements/{id}/validate','POST','Validate bank statement',1,'2025-10-07 11:12:38',NULL),(102,497,'/api/system/info','GET','Get system information',1,'2025-10-07 11:12:38',NULL),(103,498,'/api/system/logs','GET','Get system logs',1,'2025-10-07 11:12:38',NULL),(104,499,'/api/system/logs/errors','GET','Get error logs',1,'2025-10-07 11:12:38',NULL),(105,500,'/api/system/logs/download','GET','Download system logs',1,'2025-10-07 11:12:38',NULL),(106,501,'/api/system/config','GET','Get system configuration',1,'2025-10-07 11:12:38',NULL),(107,502,'/api/system/config','PUT','Update system configuration',1,'2025-10-07 11:12:38',NULL),(108,503,'/api/system/config/reset','POST','Reset system configuration',1,'2025-10-07 11:12:38',NULL),(109,504,'/api/system/database/backup','POST','Perform database backup',1,'2025-10-07 11:12:38',NULL),(110,505,'/api/system/database/cleanup','POST','Perform database cleanup',1,'2025-10-07 11:12:38',NULL),(111,506,'/api/system/database/stats','GET','View database statistics',1,'2025-10-07 11:12:38',NULL),(112,507,'/api/system/database/optimize','POST','Optimize database',1,'2025-10-07 11:12:38',NULL),(113,508,'/api/system/cache/clear','POST','Clear system cache',1,'2025-10-07 11:12:38',NULL),(114,509,'/api/system/services/restart','POST','Restart system services',1,'2025-10-07 11:12:38',NULL),(115,510,'/api/system/metrics','GET','View system metrics',1,'2025-10-07 11:12:38',NULL),(116,511,'/api/system/reports/export','GET','Export system report',1,'2025-10-07 11:12:38',NULL),(117,512,'/api/admin/files','GET','List all uploaded files',1,'2025-10-07 11:12:38',NULL),(118,513,'/api/admin/files/{id}','DELETE','Delete any file',1,'2025-10-07 11:12:38',NULL),(119,514,'/api/admin/files/{id}/download','GET','Download any file',1,'2025-10-07 11:12:38',NULL),(120,515,'/api/notifications/send','POST','Send user notification',1,'2025-10-07 11:12:38',NULL),(121,516,'/api/notifications/bulk-send','POST','Send bulk notifications',1,'2025-10-07 11:12:38',NULL),(122,517,'/api/notifications/history','GET','View notification history',1,'2025-10-07 11:12:38',NULL),(123,518,'/api/notifications/settings','PUT','Configure notification settings',1,'2025-10-07 11:12:38',NULL),(124,519,'/api/dashboard/admin','GET','View admin dashboard',1,'2025-10-07 11:12:38',NULL),(125,520,'/api/dashboard/user','GET','View user dashboard',1,'2025-10-07 11:12:38',NULL),(126,521,'/api/dashboard/export','GET','Export dashboard data',1,'2025-10-07 11:12:38',NULL),(127,522,'/api/audit/trail','GET','View audit trail',1,'2025-10-07 11:12:38',NULL),(128,523,'/api/audit/export','GET','Export audit data',1,'2025-10-07 11:12:38',NULL),(129,524,'/api/audit/compliance-report','GET','Generate compliance report',1,'2025-10-07 11:12:38',NULL),(130,525,'/api/audit/user-activity','GET','View user activity logs',1,'2025-10-07 11:12:38',NULL);
/*!40000 ALTER TABLE `permission_api_endpoints` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `module` varchar(50) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=526 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES (396,'LOGIN_USER','Allow user to login to the system','AUTH','2025-10-07 11:12:38',NULL),(397,'LOGOUT_USER','Allow user to logout from the system','AUTH','2025-10-07 11:12:38',NULL),(398,'REFRESH_TOKEN','Allow user to refresh authentication token','AUTH','2025-10-07 11:12:38',NULL),(399,'GET_PROFILE','Allow user to view their own profile','AUTH','2025-10-07 11:12:38',NULL),(400,'UPDATE_PROFILE','Allow user to update their own profile','AUTH','2025-10-07 11:12:38',NULL),(401,'CHANGE_PASSWORD','Allow user to change their own password','AUTH','2025-10-07 11:12:38',NULL),(402,'LIST_ALL_USERS','View list of all system users','USER_MANAGEMENT','2025-10-07 11:12:38',NULL),(403,'GET_USER_DETAILS','View specific user details','USER_MANAGEMENT','2025-10-07 11:12:38',NULL),(404,'CREATE_NEW_USER','Create new user account','USER_MANAGEMENT','2025-10-07 11:12:38',NULL),(405,'UPDATE_USER_INFO','Update user information','USER_MANAGEMENT','2025-10-07 11:12:38',NULL),(406,'DELETE_USER_ACCOUNT','Delete user account','USER_MANAGEMENT','2025-10-07 11:12:38',NULL),(407,'ACTIVATE_USER','Activate user account','USER_MANAGEMENT','2025-10-07 11:12:38',NULL),(408,'DEACTIVATE_USER','Deactivate user account','USER_MANAGEMENT','2025-10-07 11:12:38',NULL),(409,'RESET_USER_PASSWORD','Reset user password','USER_MANAGEMENT','2025-10-07 11:12:38',NULL),(410,'LIST_ALL_ROLES','View list of all roles','ROLE_MANAGEMENT','2025-10-07 11:12:38',NULL),(411,'GET_ROLE_DETAILS','View specific role details','ROLE_MANAGEMENT','2025-10-07 11:12:38',NULL),(412,'CREATE_NEW_ROLE','Create new role','ROLE_MANAGEMENT','2025-10-07 11:12:38',NULL),(413,'UPDATE_ROLE_INFO','Update role information','ROLE_MANAGEMENT','2025-10-07 11:12:38',NULL),(414,'DELETE_ROLE','Delete role','ROLE_MANAGEMENT','2025-10-07 11:12:38',NULL),(415,'ASSIGN_ROLE_TO_USER','Assign role to user','ROLE_MANAGEMENT','2025-10-07 11:12:38',NULL),(416,'REMOVE_ROLE_FROM_USER','Remove role from user','ROLE_MANAGEMENT','2025-10-07 11:12:38',NULL),(417,'LIST_ALL_PERMISSIONS','View list of all permissions','PERMISSION_MANAGEMENT','2025-10-07 11:12:38',NULL),(418,'GET_PERMISSION_DETAILS','View specific permission details','PERMISSION_MANAGEMENT','2025-10-07 11:12:38',NULL),(419,'CREATE_NEW_PERMISSION','Create new permission','PERMISSION_MANAGEMENT','2025-10-07 11:12:38',NULL),(420,'UPDATE_PERMISSION_INFO','Update permission information','PERMISSION_MANAGEMENT','2025-10-07 11:12:38',NULL),(421,'DELETE_PERMISSION','Delete permission','PERMISSION_MANAGEMENT','2025-10-07 11:12:38',NULL),(422,'ASSIGN_PERMISSION_TO_ROLE','Assign permission to role','PERMISSION_MANAGEMENT','2025-10-07 11:12:38',NULL),(423,'REMOVE_PERMISSION_FROM_ROLE','Remove permission from role','PERMISSION_MANAGEMENT','2025-10-07 11:12:38',NULL),(424,'LIST_WORKER_PAYMENTS','View list of worker payments','WORKER','2025-10-07 11:12:38',NULL),(425,'GET_WORKER_PAYMENT_DETAILS','View specific worker payment details','WORKER','2025-10-07 11:12:38',NULL),(426,'CREATE_WORKER_PAYMENT','Create new worker payment record','WORKER','2025-10-07 11:12:38',NULL),(427,'UPDATE_WORKER_PAYMENT','Update worker payment information','WORKER','2025-10-07 11:12:38',NULL),(428,'DELETE_WORKER_PAYMENT','Delete worker payment record','WORKER','2025-10-07 11:12:38',NULL),(429,'LIST_UPLOADED_FILES','View list of uploaded worker data files','WORKER','2025-10-07 11:12:38',NULL),(430,'GET_FILE_SUMMARY','View uploaded file summary','WORKER','2025-10-07 11:12:38',NULL),(431,'UPLOAD_WORKER_FILE','Upload worker data file','WORKER','2025-10-07 11:12:38',NULL),(432,'VALIDATE_WORKER_FILE','Validate uploaded worker file','WORKER','2025-10-07 11:12:38',NULL),(433,'DELETE_UPLOADED_FILE','Delete uploaded worker data file','WORKER','2025-10-07 11:12:38',NULL),(434,'DOWNLOAD_WORKER_FILE','Download worker data file','WORKER','2025-10-07 11:12:38',NULL),(435,'GENERATE_WORKER_PAYMENT_BATCH','Generate batch of worker payments','WORKER','2025-10-07 11:12:38',NULL),(436,'APPROVE_WORKER_PAYMENT','Approve specific worker payment','WORKER','2025-10-07 11:12:38',NULL),(437,'REJECT_WORKER_PAYMENT','Reject specific worker payment','WORKER','2025-10-07 11:12:38',NULL),(438,'BULK_APPROVE_WORKER_PAYMENTS','Bulk approve worker payments','WORKER','2025-10-07 11:12:38',NULL),(439,'BULK_REJECT_WORKER_PAYMENTS','Bulk reject worker payments','WORKER','2025-10-07 11:12:38',NULL),(440,'GENERATE_WORKER_PAYMENT_REPORT','Generate worker payment reports','WORKER','2025-10-07 11:12:38',NULL),(441,'EXPORT_WORKER_PAYMENT_DATA','Export worker payment data','WORKER','2025-10-07 11:12:38',NULL),(442,'LIST_PAYMENT_QUEUE','View payment processing queue','PAYMENT','2025-10-07 11:12:38',NULL),(443,'GET_PAYMENT_STATUS','View specific payment status','PAYMENT','2025-10-07 11:12:38',NULL),(444,'PROCESS_PAYMENT','Process individual payment','PAYMENT','2025-10-07 11:12:38',NULL),(445,'BATCH_PROCESS_PAYMENTS','Process multiple payments in batch','PAYMENT','2025-10-07 11:12:38',NULL),(446,'RETRY_FAILED_PAYMENT','Retry failed payment processing','PAYMENT','2025-10-07 11:12:38',NULL),(447,'CANCEL_PAYMENT','Cancel payment processing','PAYMENT','2025-10-07 11:12:38',NULL),(448,'APPROVE_PAYMENT_REQUEST','Approve payment request','PAYMENT','2025-10-07 11:12:38',NULL),(449,'REJECT_PAYMENT_REQUEST','Reject payment request','PAYMENT','2025-10-07 11:12:38',NULL),(450,'BULK_APPROVE_PAYMENTS','Bulk approve payment requests','PAYMENT','2025-10-07 11:12:38',NULL),(451,'BULK_REJECT_PAYMENTS','Bulk reject payment requests','PAYMENT','2025-10-07 11:12:38',NULL),(452,'GENERATE_PAYMENT_SUMMARY_REPORT','Generate payment summary report','PAYMENT','2025-10-07 11:12:38',NULL),(453,'GENERATE_PAYMENT_DETAIL_REPORT','Generate detailed payment report','PAYMENT','2025-10-07 11:12:38',NULL),(454,'EXPORT_PAYMENT_DATA','Export payment processing data','PAYMENT','2025-10-07 11:12:38',NULL),(455,'VIEW_PAYMENT_ANALYTICS','View payment processing analytics','PAYMENT','2025-10-07 11:12:38',NULL),(456,'LIST_EMPLOYER_RECEIPTS','View list of employer receipts','EMPLOYER','2025-10-07 11:12:38',NULL),(457,'GET_EMPLOYER_RECEIPT_DETAILS','View specific employer receipt details','EMPLOYER','2025-10-07 11:12:38',NULL),(458,'CREATE_EMPLOYER_RECEIPT','Create new employer receipt record','EMPLOYER','2025-10-07 11:12:38',NULL),(459,'UPDATE_EMPLOYER_RECEIPT','Update employer receipt information','EMPLOYER','2025-10-07 11:12:38',NULL),(460,'DELETE_EMPLOYER_RECEIPT','Delete employer receipt record','EMPLOYER','2025-10-07 11:12:38',NULL),(461,'VALIDATE_EMPLOYER_RECEIPT','Validate employer receipt data','EMPLOYER','2025-10-07 11:12:38',NULL),(462,'APPROVE_EMPLOYER_RECEIPT','Approve employer receipt','EMPLOYER','2025-10-07 11:12:38',NULL),(463,'REJECT_EMPLOYER_RECEIPT','Reject employer receipt','EMPLOYER','2025-10-07 11:12:38',NULL),(464,'SEND_RECEIPT_TO_BOARD','Send employer receipt to board for approval','EMPLOYER','2025-10-07 11:12:38',NULL),(465,'GENERATE_EMPLOYER_RECEIPT_REPORT','Generate employer receipt reports','EMPLOYER','2025-10-07 11:12:38',NULL),(466,'EXPORT_EMPLOYER_RECEIPT_DATA','Export employer receipt data','EMPLOYER','2025-10-07 11:12:38',NULL),(467,'LIST_BOARD_RECEIPTS','View list of board receipts','BOARD','2025-10-07 11:12:38',NULL),(468,'GET_BOARD_RECEIPT_DETAILS','View specific board receipt details','BOARD','2025-10-07 11:12:38',NULL),(469,'CREATE_BOARD_RECEIPT','Create new board receipt record','BOARD','2025-10-07 11:12:38',NULL),(470,'UPDATE_BOARD_RECEIPT','Update board receipt information','BOARD','2025-10-07 11:12:38',NULL),(471,'DELETE_BOARD_RECEIPT','Delete board receipt record','BOARD','2025-10-07 11:12:38',NULL),(472,'APPROVE_BOARD_RECEIPT','Approve board receipt','BOARD','2025-10-07 11:12:38',NULL),(473,'REJECT_BOARD_RECEIPT','Reject board receipt','BOARD','2025-10-07 11:12:38',NULL),(474,'BULK_APPROVE_BOARD_RECEIPTS','Bulk approve board receipts','BOARD','2025-10-07 11:12:38',NULL),(475,'BULK_REJECT_BOARD_RECEIPTS','Bulk reject board receipts','BOARD','2025-10-07 11:12:38',NULL),(476,'RETURN_RECEIPT_TO_EMPLOYER','Return receipt to employer for correction','BOARD','2025-10-07 11:12:38',NULL),(477,'GENERATE_BOARD_RECEIPT_REPORT','Generate board receipt reports','BOARD','2025-10-07 11:12:38',NULL),(478,'EXPORT_BOARD_RECEIPT_DATA','Export board receipt data','BOARD','2025-10-07 11:12:38',NULL),(479,'VIEW_BOARD_ANALYTICS','View board receipt analytics','BOARD','2025-10-07 11:12:38',NULL),(480,'LIST_RECONCILIATIONS','View list of reconciliation records','RECONCILIATION','2025-10-07 11:12:38',NULL),(481,'GET_RECONCILIATION_DETAILS','View specific reconciliation details','RECONCILIATION','2025-10-07 11:12:38',NULL),(482,'CREATE_RECONCILIATION','Create new reconciliation record','RECONCILIATION','2025-10-07 11:12:38',NULL),(483,'UPDATE_RECONCILIATION','Update reconciliation information','RECONCILIATION','2025-10-07 11:12:38',NULL),(484,'DELETE_RECONCILIATION','Delete reconciliation record','RECONCILIATION','2025-10-07 11:12:38',NULL),(485,'PERFORM_AUTO_RECONCILIATION','Perform automatic reconciliation','RECONCILIATION','2025-10-07 11:12:38',NULL),(486,'PERFORM_MANUAL_RECONCILIATION','Perform manual reconciliation','RECONCILIATION','2025-10-07 11:12:38',NULL),(487,'VALIDATE_RECONCILIATION','Validate reconciliation results','RECONCILIATION','2025-10-07 11:12:38',NULL),(488,'APPROVE_RECONCILIATION','Approve reconciliation results','RECONCILIATION','2025-10-07 11:12:38',NULL),(489,'REJECT_RECONCILIATION','Reject reconciliation results','RECONCILIATION','2025-10-07 11:12:38',NULL),(490,'GENERATE_RECONCILIATION_SUMMARY','Generate reconciliation summary report','RECONCILIATION','2025-10-07 11:12:38',NULL),(491,'GENERATE_RECONCILIATION_DETAIL','Generate detailed reconciliation report','RECONCILIATION','2025-10-07 11:12:38',NULL),(492,'EXPORT_RECONCILIATION_DATA','Export reconciliation data','RECONCILIATION','2025-10-07 11:12:38',NULL),(493,'VIEW_RECONCILIATION_ANALYTICS','View reconciliation analytics','RECONCILIATION','2025-10-07 11:12:38',NULL),(494,'UPLOAD_BANK_STATEMENT','Upload bank statement file','RECONCILIATION','2025-10-07 11:12:38',NULL),(495,'PARSE_BANK_STATEMENT','Parse uploaded bank statement','RECONCILIATION','2025-10-07 11:12:38',NULL),(496,'VALIDATE_BANK_STATEMENT','Validate bank statement data','RECONCILIATION','2025-10-07 11:12:38',NULL),(497,'VIEW_SYSTEM_INFO','View system information and health','SYSTEM','2025-10-07 11:12:38',NULL),(498,'VIEW_SYSTEM_LOGS','View system logs and audit trails','SYSTEM','2025-10-07 11:12:38',NULL),(499,'VIEW_ERROR_LOGS','View system error logs','SYSTEM','2025-10-07 11:12:38',NULL),(500,'DOWNLOAD_SYSTEM_LOGS','Download system log files','SYSTEM','2025-10-07 11:12:38',NULL),(501,'GET_SYSTEM_CONFIG','View system configuration','SYSTEM','2025-10-07 11:12:38',NULL),(502,'UPDATE_SYSTEM_CONFIG','Update system configuration','SYSTEM','2025-10-07 11:12:38',NULL),(503,'RESET_SYSTEM_CONFIG','Reset system configuration to defaults','SYSTEM','2025-10-07 11:12:38',NULL),(504,'PERFORM_DATABASE_BACKUP','Perform database backup','SYSTEM','2025-10-07 11:12:38',NULL),(505,'PERFORM_DATABASE_CLEANUP','Perform database cleanup operations','SYSTEM','2025-10-07 11:12:38',NULL),(506,'VIEW_DATABASE_STATS','View database statistics','SYSTEM','2025-10-07 11:12:38',NULL),(507,'OPTIMIZE_DATABASE','Optimize database performance','SYSTEM','2025-10-07 11:12:38',NULL),(508,'CLEAR_CACHE','Clear system cache','SYSTEM','2025-10-07 11:12:38',NULL),(509,'RESTART_SERVICES','Restart system services','SYSTEM','2025-10-07 11:12:38',NULL),(510,'VIEW_SYSTEM_METRICS','View system performance metrics','SYSTEM','2025-10-07 11:12:38',NULL),(511,'EXPORT_SYSTEM_REPORT','Export comprehensive system report','SYSTEM','2025-10-07 11:12:38',NULL),(512,'LIST_UPLOADED_FILES_ADMIN','View all uploaded files (admin)','SYSTEM','2025-10-07 11:12:38',NULL),(513,'DELETE_ANY_FILE','Delete any uploaded file (admin)','SYSTEM','2025-10-07 11:12:38',NULL),(514,'DOWNLOAD_ANY_FILE','Download any uploaded file (admin)','SYSTEM','2025-10-07 11:12:38',NULL),(515,'SEND_USER_NOTIFICATION','Send notification to specific user','NOTIFICATION','2025-10-07 11:12:38',NULL),(516,'SEND_BULK_NOTIFICATION','Send bulk notifications','NOTIFICATION','2025-10-07 11:12:38',NULL),(517,'VIEW_NOTIFICATION_HISTORY','View notification history','NOTIFICATION','2025-10-07 11:12:38',NULL),(518,'CONFIGURE_NOTIFICATION_SETTINGS','Configure notification settings','NOTIFICATION','2025-10-07 11:12:38',NULL),(519,'VIEW_ADMIN_DASHBOARD','View administrative dashboard','DASHBOARD','2025-10-07 11:12:38',NULL),(520,'VIEW_USER_DASHBOARD','View user-specific dashboard','DASHBOARD','2025-10-07 11:12:38',NULL),(521,'EXPORT_DASHBOARD_DATA','Export dashboard data','DASHBOARD','2025-10-07 11:12:38',NULL),(522,'VIEW_AUDIT_TRAIL','View system audit trail','AUDIT','2025-10-07 11:12:38',NULL),(523,'EXPORT_AUDIT_DATA','Export audit data for compliance','AUDIT','2025-10-07 11:12:38',NULL),(524,'GENERATE_COMPLIANCE_REPORT','Generate compliance reports','AUDIT','2025-10-07 11:12:38',NULL),(525,'VIEW_USER_ACTIVITY','View user activity logs','AUDIT','2025-10-07 11:12:38',NULL);
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_component_permissions`
--

DROP TABLE IF EXISTS `role_component_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_component_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `role_id` bigint NOT NULL COMMENT 'Reference to roles table',
  `component_permission_id` bigint NOT NULL COMMENT 'Reference to component_permissions table',
  `is_active` tinyint(1) DEFAULT '1' COMMENT 'Whether this role-permission assignment is active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_role_component_permission` (`role_id`,`component_permission_id`),
  KEY `idx_role_id` (`role_id`),
  KEY `idx_component_permission_id` (`component_permission_id`),
  KEY `idx_active` (`is_active`),
  CONSTRAINT `role_component_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_component_permissions_ibfk_2` FOREIGN KEY (`component_permission_id`) REFERENCES `component_permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Assignment of component permissions to roles';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_component_permissions`
--

LOCK TABLES `role_component_permissions` WRITE;
/*!40000 ALTER TABLE `role_component_permissions` DISABLE KEYS */;
INSERT INTO `role_component_permissions` VALUES (1,1,33,1,'2025-10-06 14:53:13','2025-10-06 14:53:13'),(2,1,36,1,'2025-10-06 14:53:13','2025-10-06 14:53:13'),(3,1,10,1,'2025-10-06 14:53:13','2025-10-06 14:53:13'),(4,1,50,1,'2025-10-06 14:53:13','2025-10-06 14:53:13'),(5,1,1,1,'2025-10-06 14:53:13','2025-10-06 14:53:13'),(6,1,34,1,'2025-10-06 14:53:13','2025-10-06 14:53:13'),(7,1,23,1,'2025-10-06 14:53:13','2025-10-06 14:53:13'),(8,1,40,1,'2025-10-06 14:53:13','2025-10-06 14:53:13'),(9,1,37,1,'2025-10-06 14:53:13','2025-10-06 14:53:13'),(10,1,9,1,'2025-10-06 14:53:13','2025-10-06 14:53:13'),(11,1,35,1,'2025-10-06 14:53:13','2025-10-06 14:53:13'),(12,1,16,1,'2025-10-06 14:53:13','2025-10-06 14:53:13'),(13,1,24,1,'2025-10-06 14:53:13','2025-10-06 14:53:13'),(14,1,38,1,'2025-10-06 14:53:13','2025-10-06 14:53:13'),(15,1,5,1,'2025-10-06 14:53:13','2025-10-06 14:53:13'),(16,1,51,1,'2025-10-06 14:53:13','2025-10-06 14:53:13'),(17,1,41,1,'2025-10-06 14:53:13','2025-10-06 14:53:13'),(18,1,6,1,'2025-10-06 14:53:13','2025-10-06 14:53:13'),(19,1,52,1,'2025-10-06 14:53:13','2025-10-06 14:53:13'),(20,1,42,1,'2025-10-06 14:53:13','2025-10-06 14:53:13'),(21,1,11,1,'2025-10-06 14:53:13','2025-10-06 14:53:13'),(22,1,30,1,'2025-10-06 14:53:13','2025-10-06 14:53:13'),(23,1,43,1,'2025-10-06 14:53:13','2025-10-06 14:53:13'),(24,1,4,1,'2025-10-06 14:53:13','2025-10-06 14:53:13'),(25,1,17,1,'2025-10-06 14:53:13','2025-10-06 14:53:13'),(26,1,25,1,'2025-10-06 14:53:13','2025-10-06 14:53:13'),(27,1,47,1,'2025-10-06 14:53:13','2025-10-06 14:53:13'),(28,1,3,1,'2025-10-06 14:53:13','2025-10-06 14:53:13'),(29,1,18,1,'2025-10-06 14:53:13','2025-10-06 14:53:13'),(30,1,31,1,'2025-10-06 14:53:13','2025-10-06 14:53:13'),(31,1,26,1,'2025-10-06 14:53:13','2025-10-06 14:53:13'),(32,1,48,1,'2025-10-06 14:53:13','2025-10-06 14:53:13'),(33,1,2,1,'2025-10-06 14:53:13','2025-10-06 14:53:13'),(34,1,32,1,'2025-10-06 14:53:13','2025-10-06 14:53:13'),(35,1,27,1,'2025-10-06 14:53:13','2025-10-06 14:53:13'),(36,1,44,1,'2025-10-06 14:53:13','2025-10-06 14:53:13'),(37,1,7,1,'2025-10-06 14:53:13','2025-10-06 14:53:13'),(65,1,8,1,'2025-10-06 14:53:39','2025-10-06 14:53:39'),(66,1,19,1,'2025-10-06 16:30:06','2025-10-06 16:30:06'),(67,1,39,1,'2025-10-06 16:30:06','2025-10-06 16:30:06');
/*!40000 ALTER TABLE `role_component_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permissions` (
  `role_id` bigint NOT NULL,
  `permission_id` bigint NOT NULL,
  PRIMARY KEY (`role_id`,`permission_id`),
  KEY `permission_id` (`permission_id`),
  CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permissions`
--

LOCK TABLES `role_permissions` WRITE;
/*!40000 ALTER TABLE `role_permissions` DISABLE KEYS */;
INSERT INTO `role_permissions` VALUES (1,396),(2,396),(3,396),(4,396),(5,396),(6,396),(7,396),(8,396),(9,396),(1,397),(2,397),(3,397),(4,397),(5,397),(6,397),(7,397),(8,397),(9,397),(1,398),(2,398),(3,398),(4,398),(5,398),(6,398),(7,398),(8,398),(9,398),(1,399),(2,399),(3,399),(4,399),(5,399),(6,399),(7,399),(8,399),(9,399),(10,399),(1,400),(2,400),(3,400),(4,400),(5,400),(6,400),(7,400),(8,400),(10,400),(1,401),(2,401),(3,401),(4,401),(5,401),(6,401),(7,401),(8,401),(9,401),(10,401),(1,402),(2,402),(9,402),(1,403),(2,403),(9,403),(1,404),(2,404),(1,405),(2,405),(1,406),(2,406),(1,407),(2,407),(1,408),(2,408),(1,409),(2,409),(1,410),(2,410),(9,410),(1,411),(2,411),(9,411),(1,412),(2,412),(1,413),(2,413),(1,414),(2,414),(1,415),(2,415),(1,416),(2,416),(1,417),(2,417),(9,417),(1,418),(2,418),(9,418),(1,419),(2,419),(1,420),(2,420),(1,421),(2,421),(1,422),(2,422),(1,423),(2,423),(1,424),(3,424),(9,424),(1,425),(3,425),(9,425),(1,426),(3,426),(1,427),(3,427),(1,428),(1,429),(3,429),(9,429),(1,430),(3,430),(9,430),(1,431),(3,431),(1,432),(3,432),(1,433),(1,434),(3,434),(1,435),(3,435),(1,436),(3,436),(1,437),(3,437),(1,438),(1,439),(1,440),(3,440),(1,441),(3,441),(1,442),(4,442),(9,442),(1,443),(4,443),(9,443),(1,444),(4,444),(1,445),(4,445),(1,446),(4,446),(1,447),(4,447),(1,448),(4,448),(1,449),(4,449),(1,450),(4,450),(1,451),(4,451),(1,452),(4,452),(1,453),(4,453),(1,454),(4,454),(1,455),(4,455),(9,455),(1,456),(5,456),(9,456),(1,457),(5,457),(9,457),(1,458),(5,458),(1,459),(5,459),(1,460),(5,460),(1,461),(5,461),(1,462),(5,462),(1,463),(5,463),(1,464),(5,464),(1,465),(5,465),(1,466),(5,466),(1,467),(6,467),(9,467),(1,468),(6,468),(9,468),(1,469),(6,469),(1,470),(6,470),(1,471),(6,471),(1,472),(6,472),(1,473),(6,473),(1,474),(6,474),(1,475),(6,475),(1,476),(6,476),(1,477),(6,477),(1,478),(6,478),(1,479),(6,479),(9,479),(1,480),(7,480),(9,480),(1,481),(7,481),(9,481),(1,482),(7,482),(1,483),(7,483),(1,484),(7,484),(1,485),(7,485),(1,486),(7,486),(1,487),(7,487),(1,488),(7,488),(1,489),(7,489),(1,490),(7,490),(1,491),(7,491),(1,492),(7,492),(1,493),(7,493),(9,493),(1,494),(7,494),(1,495),(7,495),(1,496),(7,496),(1,497),(8,497),(9,497),(1,498),(8,498),(9,498),(1,499),(8,499),(9,499),(1,500),(8,500),(1,501),(8,501),(9,501),(1,502),(8,502),(1,503),(8,503),(1,504),(8,504),(1,505),(8,505),(1,506),(8,506),(9,506),(1,507),(8,507),(1,508),(8,508),(1,509),(8,509),(1,510),(8,510),(9,510),(1,511),(8,511),(1,512),(8,512),(9,512),(1,513),(8,513),(1,514),(8,514),(1,515),(8,515),(1,516),(8,516),(1,517),(8,517),(9,517),(1,518),(8,518),(1,519),(3,519),(4,519),(5,519),(6,519),(7,519),(9,519),(10,519),(1,520),(3,520),(4,520),(5,520),(6,520),(7,520),(9,520),(10,520),(1,521),(3,521),(4,521),(5,521),(6,521),(7,521),(9,521),(1,522),(9,522),(1,523),(9,523),(1,524),(9,524),(1,525),(9,525);
/*!40000 ALTER TABLE `role_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'SUPER_ADMIN','Super Administrator with all system permissions','2025-10-07 11:12:38',NULL),(2,'USER_MANAGER','User and Role Management Administrator','2025-10-07 11:12:38',NULL),(3,'WORKER_DATA_OPERATOR','Worker Data Management Operator','2025-10-07 11:12:38',NULL),(4,'PAYMENT_PROCESSOR','Payment Processing Specialist','2025-10-07 11:12:38',NULL),(5,'EMPLOYER_COORDINATOR','Employer Receipt Coordinator','2025-10-07 11:12:38',NULL),(6,'BOARD_APPROVER','Board Receipt Approver','2025-10-07 11:12:38',NULL),(7,'RECONCILIATION_SPECIALIST','Reconciliation Operations Specialist','2025-10-07 11:12:38',NULL),(8,'SYSTEM_ADMINISTRATOR','System Configuration and Maintenance Administrator','2025-10-07 11:12:38',NULL),(9,'AUDITOR','System Auditor and Compliance Officer','2025-10-07 11:12:38',NULL),(10,'READONLY_USER','Read-only access to basic information','2025-10-07 11:12:38',NULL);
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ui_components`
--

DROP TABLE IF EXISTS `ui_components`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ui_components` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `component_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Unique identifier for the component (e.g., user-management)',
  `display_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Human-readable name for the component',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'Description of what the component does',
  `category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Category for grouping (e.g., Administration, Reconciliation)',
  `route` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Frontend route path for the component',
  `icon` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Icon representation (emoji or icon class)',
  `display_order` int DEFAULT '0' COMMENT 'Order for displaying in navigation',
  `is_active` tinyint(1) DEFAULT '1' COMMENT 'Whether the component is active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `component_key` (`component_key`),
  KEY `idx_component_key` (`component_key`),
  KEY `idx_category` (`category`),
  KEY `idx_active_order` (`is_active`,`display_order`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='UI Components that can have permissions assigned';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ui_components`
--

LOCK TABLES `ui_components` WRITE;
/*!40000 ALTER TABLE `ui_components` DISABLE KEYS */;
INSERT INTO `ui_components` VALUES (1,'dashboard','Dashboard','Main dashboard with overview and statistics','General','/dashboard','',1,1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(2,'user-management','User Management','Manage system users, roles, and permissions','Administration','/admin/users','',10,1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(3,'system-settings','System Settings','Configure system-wide settings and parameters','Administration','/admin/settings','',20,1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(4,'system-logs','System Logs','View and analyze system logs and audit trails','Administration','/admin/logs','',30,1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(5,'payment-processing','Payment Processing','Process, validate, and manage payments','Reconciliation','/payments','',40,1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(6,'reconciliation-dashboard','Reconciliation Dashboard','View reconciliation status, reports, and analytics','Reconciliation','/reconciliation','',50,1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(7,'worker-payments','Worker Payments','View and manage worker payment data and records','Worker','/worker/payments','',60,1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(8,'worker-upload','Worker Data Upload','Upload and process worker payment files','Worker','/worker/upload','',70,1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(9,'employer-receipts','Employer Receipts','View, validate, and manage employer receipts','Employer','/employer/receipts','',80,1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(10,'board-receipts','Board Receipts','View, review, and approve board receipts','Board','/board/receipts','',90,1,'2025-10-06 14:52:42','2025-10-06 14:52:42'),(11,'reports','Reports','Generate and view various system reports','Reporting','/reports','',100,1,'2025-10-06 14:52:42','2025-10-06 14:52:42');
/*!40000 ALTER TABLE `ui_components` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `uploaded_files`
--

DROP TABLE IF EXISTS `uploaded_files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uploaded_files` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stored_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_hash` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `upload_date` datetime NOT NULL,
  `uploaded_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_records` int NOT NULL DEFAULT '0',
  `success_count` int NOT NULL DEFAULT '0',
  `failure_count` int NOT NULL DEFAULT '0',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_reference_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `file_ref_nmbr` (`file_reference_number`),
  KEY `idx_file_type` (`file_type`),
  KEY `idx_upload_date` (`upload_date`),
  KEY `idx_status` (`status`),
  KEY `idx_uploaded_by` (`uploaded_by`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `uploaded_files`
--

LOCK TABLES `uploaded_files` WRITE;
/*!40000 ALTER TABLE `uploaded_files` DISABLE KEYS */;
INSERT INTO `uploaded_files` VALUES (1,'Sample_file.csv','/Users/rahulcharvekar/Documents/Repos/ManpowerManagement/PaymentReconciliation/uploads/dev/workerpayments/4ab8fe28-0752-4b3a-bbd7-5670f53eec81_Sample_file.csv','fa96d8794f59c644580858a17626d6fd85c91917a7370a692ab005c3b5657887','workerpayments','2025-10-07 14:47:17',NULL,12,12,0,'VALIDATED','REQ-20251007-201716-837');
/*!40000 ALTER TABLE `uploaded_files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `user_id` bigint NOT NULL,
  `role_id` bigint NOT NULL,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (1,1),(11,1),(2,2),(3,3),(4,4),(5,5),(6,6),(7,7),(8,8),(9,9),(10,10);
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USER',
  `is_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `is_account_non_expired` tinyint(1) NOT NULL DEFAULT '1',
  `is_account_non_locked` tinyint(1) NOT NULL DEFAULT '1',
  `is_credentials_non_expired` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login` timestamp NULL DEFAULT NULL,
  `legacy_role` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `permission_version` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_username` (`username`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'superadmin','$2a$10$Wq5sE7cyP0Gug9b7yaoc4eqHigsjrm76nWK/rM1QJ/y2gTN/a0NYG','superadmin@company.com','Super Administrator','ADMIN',1,1,1,1,'2025-10-07 11:13:32','2025-10-08 12:31:59','2025-10-08 12:31:59',NULL,1),(2,'usermanager','$2a$10$Wq5sE7cyP0Gug9b7yaoc4eqHigsjrm76nWK/rM1QJ/y2gTN/a0NYG','usermanager@company.com','User Manager','USER',1,1,1,1,'2025-10-07 11:13:32','2025-10-07 12:57:12',NULL,NULL,1),(3,'workeroperator','$2a$10$Wq5sE7cyP0Gug9b7yaoc4eqHigsjrm76nWK/rM1QJ/y2gTN/a0NYG','workeroperator@company.com','Worker Data Operator','USER',1,1,1,1,'2025-10-07 11:13:32','2025-10-08 15:49:16','2025-10-08 15:49:16',NULL,1),(4,'paymentprocessor','$2a$10$Wq5sE7cyP0Gug9b7yaoc4eqHigsjrm76nWK/rM1QJ/y2gTN/a0NYG','paymentprocessor@company.com','Payment Processor','USER',1,1,1,1,'2025-10-07 11:13:32','2025-10-07 12:57:12',NULL,NULL,1),(5,'employercoord','$2a$10$Wq5sE7cyP0Gug9b7yaoc4eqHigsjrm76nWK/rM1QJ/y2gTN/a0NYG','employercoord@company.com','Employer Coordinator','USER',1,1,1,1,'2025-10-07 11:13:32','2025-10-07 12:57:12',NULL,NULL,1),(6,'boardapprover','$2a$10$Wq5sE7cyP0Gug9b7yaoc4eqHigsjrm76nWK/rM1QJ/y2gTN/a0NYG','boardapprover@company.com','Board Approver','USER',1,1,1,1,'2025-10-07 11:13:32','2025-10-07 12:57:12',NULL,NULL,1),(7,'reconspecialist','$2a$10$Wq5sE7cyP0Gug9b7yaoc4eqHigsjrm76nWK/rM1QJ/y2gTN/a0NYG','reconspecialist@company.com','Reconciliation Specialist','USER',1,1,1,1,'2025-10-07 11:13:32','2025-10-07 12:57:12',NULL,NULL,1),(8,'sysadmin','$2a$10$Wq5sE7cyP0Gug9b7yaoc4eqHigsjrm76nWK/rM1QJ/y2gTN/a0NYG','sysadmin@company.com','System Administrator','ADMIN',1,1,1,1,'2025-10-07 11:13:32','2025-10-07 13:16:28','2025-10-07 13:16:28',NULL,1),(9,'auditor','$2a$10$Wq5sE7cyP0Gug9b7yaoc4eqHigsjrm76nWK/rM1QJ/y2gTN/a0NYG','auditor@company.com','System Auditor','USER',1,1,1,1,'2025-10-07 11:13:32','2025-10-07 12:57:12',NULL,NULL,1),(10,'readonly','$2a$10$Wq5sE7cyP0Gug9b7yaoc4eqHigsjrm76nWK/rM1QJ/y2gTN/a0NYG','readonly@company.com','Read Only User','USER',1,1,1,1,'2025-10-07 11:13:32','2025-10-07 12:57:12',NULL,NULL,1),(11,'admin','$2a$10$Wq5sE7cyP0Gug9b7yaoc4eqHigsjrm76nWK/rM1QJ/y2gTN/a0NYG','admin@paymentreconciliation.com','System Administrator','ADMIN',1,1,1,1,'2025-10-07 11:15:31','2025-10-07 12:57:22','2025-10-07 12:57:22',NULL,1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `worker_master`
--

DROP TABLE IF EXISTS `worker_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `worker_master` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `worker_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `worker_reference` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `registration_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `worker_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `father_name` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `aadhar` varchar(16) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pan` varchar(16) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_account` varchar(34) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ifsc_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_number` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `emergency_contact_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_contact_phone` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `worker_id` (`worker_id`),
  UNIQUE KEY `worker_reference` (`worker_reference`),
  UNIQUE KEY `registration_id` (`registration_id`),
  UNIQUE KEY `aadhar` (`aadhar`),
  KEY `idx_worker_id` (`worker_id`),
  KEY `idx_worker_reference` (`worker_reference`),
  KEY `idx_registration_id` (`registration_id`),
  KEY `idx_aadhar` (`aadhar`),
  KEY `idx_pan` (`pan`),
  KEY `idx_status` (`status`),
  KEY `idx_phone_number` (`phone_number`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `worker_master`
--

LOCK TABLES `worker_master` WRITE;
/*!40000 ALTER TABLE `worker_master` DISABLE KEYS */;
INSERT INTO `worker_master` VALUES (1,'WRK001','MH001WRK001','REG001MH2024','Rajesh Kumar Sharma','Ram Kumar Sharma','1985-03-15','Male','123456789012','ABCPK1234A','1234567890123456','State Bank of India','SBIN0001234','9876543210','rajesh.sharma@email.com','123, Shivaji Nagar, Mumbai - 400001','Sunita Sharma','9876543211','ACTIVE','2025-10-07 11:09:54','2025-10-07 11:09:54'),(2,'WRK002','MH002WRK002','REG002MH2024','Suresh Patil','Ganesh Patil','1990-07-22','Male','234567890123','DEFPK5678B','2345678901234567','Bank of Maharashtra','MAHB0001234','8765432109','suresh.patil@email.com','456, Pune Camp, Pune - 411001','Lata Patil','8765432108','ACTIVE','2025-10-07 11:09:54','2025-10-07 11:09:54'),(3,'WRK003','MH003WRK003','REG003MH2024','Priya Devi','Mohan Singh','1988-12-10','Female','345678901234','GHIPK9012C','3456789012345678','HDFC Bank','HDFC0001234','7654321098','priya.devi@email.com','789, Nashik Road, Nashik - 422005','Mohan Singh','7654321097','ACTIVE','2025-10-07 11:09:54','2025-10-07 11:09:54'),(4,'WRK004','KA001WRK004','REG004KA2024','Venkatesh Reddy','Krishnamurthy Reddy','1987-05-18','Male','456789012345','JKLPK3456D','4567890123456789','Canara Bank','CNRB0001234','6543210987','venkatesh.reddy@email.com','321, Brigade Road, Bangalore - 560025','Lakshmi Reddy','6543210986','ACTIVE','2025-10-07 11:09:54','2025-10-07 11:09:54'),(5,'WRK005','KA002WRK005','REG005KA2024','Anjali Nair','Suresh Nair','1992-09-25','Female','567890123456','MNOPK7890E','5678901234567890','Karnataka Bank','KARB0001234','5432109876','anjali.nair@email.com','654, Malleshwaram, Bangalore - 560003','Suresh Nair','5432109875','ACTIVE','2025-10-07 11:09:54','2025-10-07 11:09:54'),(6,'WRK006','TN001WRK006','REG006TN2024','Murugan Pillai','Ramasamy Pillai','1983-11-08','Male','678901234567','PQRPK1234F','6789012345678901','Indian Bank','IDIB0001234','4321098765','murugan.pillai@email.com','987, T Nagar, Chennai - 600017','Kamala Pillai','4321098764','ACTIVE','2025-10-07 11:09:54','2025-10-07 11:09:54'),(7,'WRK007','TN002WRK007','REG007TN2024','Kavitha Krishnan','Krishnan Iyer','1991-04-14','Female','789012345678','STUVK5678G','7890123456789012','City Union Bank','CIUB0001234','3210987654','kavitha.krishnan@email.com','147, Anna Nagar, Chennai - 600040','Krishnan Iyer','3210987653','ACTIVE','2025-10-07 11:09:54','2025-10-07 11:09:54'),(8,'WRK008','GJ001WRK008','REG008GJ2024','Amit Patel','Bharat Patel','1986-08-30','Male','890123456789','WXYPK9012H','8901234567890123','Bank of Baroda','BARB0001234','2109876543','amit.patel@email.com','258, Navrangpura, Ahmedabad - 380009','Nisha Patel','2109876542','ACTIVE','2025-10-07 11:09:54','2025-10-07 11:09:54'),(9,'WRK009','GJ002WRK009','REG009GJ2024','Priyanka Shah','Jayesh Shah','1989-01-20','Female','901234567890','ABCPK3456I','9012345678901234','State Bank of India','SBIN0005678','1098765432','priyanka.shah@email.com','369, Satellite, Ahmedabad - 380015','Jayesh Shah','1098765431','ACTIVE','2025-10-07 11:09:54','2025-10-07 11:09:54'),(10,'WRK010','UP001WRK010','REG010UP2024','Vinod Singh','Ram Singh','1984-06-12','Male','012345678901','DEFPK7890J','0123456789012345','Punjab National Bank','PUNB0001234','9087654321','vinod.singh@email.com','741, Hazratganj, Lucknow - 226001','Sunita Singh','9087654320','ACTIVE','2025-10-07 11:09:54','2025-10-07 11:09:54'),(11,'WRK011','UP002WRK011','REG011UP2024','Geeta Yadav','Ramesh Yadav','1993-10-05','Female','123450678912','GHIPK1234K','1234506789123456','Union Bank of India','UBIN0001234','8976543210','geeta.yadav@email.com','852, Gomti Nagar, Lucknow - 226010','Ramesh Yadav','8976543209','ACTIVE','2025-10-07 11:09:54','2025-10-07 11:09:54'),(12,'WRK012','WB001WRK012','REG012WB2024','Subhash Chatterjee','Bimal Chatterjee','1982-02-28','Male','234561789023','JKLPK5678L','2345617890234567','UCO Bank','UCBA0001234','7865432109','subhash.chatterjee@email.com','963, Salt Lake, Kolkata - 700064','Mala Chatterjee','7865432108','ACTIVE','2025-10-07 11:09:54','2025-10-07 11:09:54'),(13,'WRK013','WB002WRK013','REG013WB2024','Ruma Das','Gopal Das','1990-12-17','Female','345672890134','MNOPK9012M','3456728901345678','Allahabad Bank','ALLA0001234','6754321098','ruma.das@email.com','159, Howrah, Kolkata - 711101','Gopal Das','6754321097','ACTIVE','2025-10-07 11:09:54','2025-10-07 11:09:54'),(14,'WRK014','RJ001WRK014','REG014RJ2024','Mohan Sharma','Devi Lal Sharma','1988-07-03','Male','456783901245','PQRPK3456N','4567839012456789','Bank of Rajasthan','BRAJ0001234','5643210987','mohan.sharma@email.com','357, Johari Bazaar, Jaipur - 302003','Kamla Sharma','5643210986','ACTIVE','2025-10-07 11:09:54','2025-10-07 11:09:54'),(15,'WRK015','RJ002WRK015','REG015RJ2024','Sunita Meena','Babu Lal Meena','1994-03-11','Female','567894012356','STUVK7890O','5678940123567890','Punjab National Bank','PUNB0005678','4532109876','sunita.meena@email.com','468, Malviya Nagar, Jaipur - 302017','Babu Lal Meena','4532109875','ACTIVE','2025-10-07 11:09:54','2025-10-07 11:09:54'),(16,'WRK016','AP001WRK016','REG016AP2024','Rama Krishna','Venkateswara Rao','1985-09-16','Male','678905123467','WXYPK1234P','6789051234678901','State Bank of Hyderabad','SBHY0001234','3421098765','rama.krishna@email.com','579, Jubilee Hills, Hyderabad - 500033','Sita Krishna','3421098764','ACTIVE','2025-10-07 11:09:54','2025-10-07 11:09:54'),(17,'WRK017','TS001WRK017','REG017TS2024','Srinivas Rao','Narayana Rao','1987-11-22','Male','789016234578','ABCPK5678Q','7890162345789012','Andhra Bank','ANDB0001234','2310987654','srinivas.rao@email.com','680, Banjara Hills, Hyderabad - 500034','Padma Rao','2310987653','ACTIVE','2025-10-07 11:09:54','2025-10-07 11:09:54'),(18,'WRK018','PB001WRK018','REG018PB2024','Harpreet Singh','Gurmeet Singh','1986-04-09','Male','890127345689','DEFPK9012R','8901273456890123','Punjab National Bank','PUNB0009012','1209876543','harpreet.singh@email.com','791, Model Town, Chandigarh - 160022','Simran Kaur','1209876542','ACTIVE','2025-10-07 11:09:54','2025-10-07 11:09:54'),(19,'WRK019','HR001WRK019','REG019HR2024','Deepak Kumar','Suresh Kumar','1989-08-25','Male','901238456790','GHIPK3456S','9012384567901234','State Bank of India','SBIN0009012','0198765432','deepak.kumar@email.com','802, Sector-17, Gurgaon - 122001','Pooja Kumar','0198765431','ACTIVE','2025-10-07 11:09:54','2025-10-07 11:09:54'),(20,'WRK020','DL001WRK020','REG020DL2024','Anita Gupta','Rajesh Gupta','1991-06-13','Female','012349567801','JKLPK7890T','0123495678012345','HDFC Bank','HDFC0009012','9087654321','anita.gupta@email.com','913, Connaught Place, New Delhi - 110001','Rajesh Gupta','9087654320','ACTIVE','2025-10-07 11:09:54','2025-10-07 11:09:54');
/*!40000 ALTER TABLE `worker_master` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `worker_payment_receipts`
--

DROP TABLE IF EXISTS `worker_payment_receipts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `worker_payment_receipts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `receipt_number` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employer_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `toli_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL,
  `total_records` int NOT NULL,
  `total_amount` decimal(15,2) NOT NULL,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `receipt_number` (`receipt_number`),
  KEY `idx_receipt_number` (`receipt_number`),
  KEY `idx_employer_id` (`employer_id`),
  KEY `idx_toli_id` (`toli_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `worker_payment_receipts`
--

LOCK TABLES `worker_payment_receipts` WRITE;
/*!40000 ALTER TABLE `worker_payment_receipts` DISABLE KEYS */;
INSERT INTO `worker_payment_receipts` VALUES (1,'RCP-20251007-201746-391','EMP_TECHCORP_LTD','TOLI_ENGINEERING','2025-10-07 14:47:47',12,12612.00,'VALIDATED');
/*!40000 ALTER TABLE `worker_payment_receipts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `worker_payments`
--

DROP TABLE IF EXISTS `worker_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `worker_payments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `worker_reference` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `registration_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `worker_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employer_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `toli_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `toli` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `aadhar` varchar(16) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pan` varchar(16) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bank_account` varchar(34) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_amount` decimal(15,2) NOT NULL,
  `file_id` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `request_reference_number` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'UPLOADED',
  `receipt_number` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `uploaded_file_ref` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_worker_reference` (`worker_reference`),
  KEY `idx_registration_id` (`registration_id`),
  KEY `idx_employer_id` (`employer_id`),
  KEY `idx_toli_id` (`toli_id`),
  KEY `idx_status` (`status`),
  KEY `idx_receipt_number` (`receipt_number`),
  KEY `idx_request_reference` (`request_reference_number`),
  KEY `idx_file_id` (`file_id`),
  KEY `idx_uploaded_file_ref` (`uploaded_file_ref`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_status_created_at` (`status`,`created_at`),
  KEY `idx_receipt_created_at` (`receipt_number`,`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `worker_payments`
--

LOCK TABLES `worker_payments` WRITE;
/*!40000 ALTER TABLE `worker_payments` DISABLE KEYS */;
INSERT INTO `worker_payments` VALUES (1,'WRK001','REG001','Rajesh Kumar Sharma','EMP001','TOLI001','LNT Mumbai Construction Toli','123456789012','ABCDE1234F','1234567890123456',15000.00,NULL,'REQ2024001','PENDING',NULL,'2024-09-15 10:00:00',NULL),(2,'WRK002','REG002','Suresh Patil','EMP001','TOLI001','LNT Mumbai Construction Toli','234567890123','BCDEF2345G','2345678901234567',16500.00,NULL,'REQ2024002','APPROVED',NULL,'2024-09-15 10:05:00',NULL),(3,'WRK003','REG003','Priya Devi','EMP002','TOLI002','SP Mumbai Residential Toli','345678901234','CDEFG3456H','3456789012345678',14000.00,NULL,'REQ2024003','PROCESSED',NULL,'2024-09-16 09:30:00',NULL),(4,'WRK004','REG004','Venkatesh Reddy','EMP003','TOLI040','Multi-Employer Delhi Infrastructure Hub','456789012345','DEFGH4567I','4567890123456789',17000.00,NULL,'REQ2024004','PENDING',NULL,'2024-09-17 11:20:00',NULL),(5,'WRK005','REG005','Anjali Nair','EMP003','TOLI040','Multi-Employer Delhi Infrastructure Hub','567890123456','EFGHI5678J','5678901234567890',15500.00,NULL,'REQ2024005','REJECTED',NULL,'2024-09-17 11:25:00',NULL),(6,'WRK006','REG006','Murugan Pillai','EMP004','TOLI006','SP Hyderabad Commercial Toli','678901234567','FGHIJ6789K','6789012345678901',18000.00,NULL,'REQ2024006','APPROVED',NULL,'2024-09-18 14:10:00',NULL),(7,'WRK007','REG007','Kavitha Krishnan','EMP005','TOLI007','HCC Mumbai Marine Drive Toli','789012345678','GHIJK7890L','7890123456789012',16000.00,NULL,'REQ2024007','PROCESSED',NULL,'2024-09-19 08:45:00',NULL),(8,'WRK001','WRK001','John Smith','EMP_TECHCORP_LTD','TOLI_ENGINEERING','Engineering','','','1234567890123456',1000.00,'1','WRK-1E4EBE82668D','PENDING','RCP-20251007-201746-391','2025-10-07 14:47:47',NULL),(9,'WRK002','WRK002','Sarah Johnson','EMP_DATASOFT_INC','TOLI_QA','Quality Assurance','','','2345678901234567',825.00,'1','WRK-7F1507D9F9C5','PENDING','RCP-20251007-201746-391','2025-10-07 14:47:47',NULL),(10,'WRK003','WRK003','Michael Brown','EMP_WEBSOLUTIONS','TOLI_DESIGN','Design','','','3456789012345678',783.75,'1','WRK-A3FB2FDF1471','PENDING','RCP-20251007-201746-391','2025-10-07 14:47:47',NULL),(11,'WRK004','WRK004','Emily Davis','EMP_CLOUDTECH','TOLI_DEVOPS','DevOps','','','4567890123456789',1190.00,'1','WRK-E836162A3C29','PENDING','RCP-20251007-201746-391','2025-10-07 14:47:47',NULL),(12,'WRK005','WRK005','David Wilson','EMP_FINANCEAPP','TOLI_BACKEND','Backend','','','5678901234567890',1240.00,'1','WRK-59290708F811','PENDING','RCP-20251007-201746-391','2025-10-07 14:47:47',NULL),(13,'WRK006','WRK006','Lisa Anderson','EMP_STARTUPX','TOLI_FRONTEND','Frontend','','','6789012345678901',682.00,'1','WRK-B1E309B9AF66','PENDING','RCP-20251007-201746-391','2025-10-07 14:47:47',NULL),(14,'WRK007','WRK007','Robert Miller','EMP_ECOMCORP','TOLI_MARKETING','Marketing','','','7890123456789012',600.00,'1','WRK-3710648BF716','PENDING','RCP-20251007-201746-391','2025-10-07 14:47:47',NULL),(15,'WRK008','WRK008','Jennifer Taylor','EMP_HEALTHTECH','TOLI_PRODUCT','Product','','','8901234567890123',1443.75,'1','WRK-B87BED5DECD0','PENDING','RCP-20251007-201746-391','2025-10-07 14:47:47',NULL),(16,'WRK009','WRK009','James Garcia','EMP_GAMESTUDIO','TOLI_ART','Art','','','9012345678901234',945.00,'1','WRK-101F8B12CD2F','PENDING','RCP-20251007-201746-391','2025-10-07 14:47:47',NULL),(17,'WRK010','WRK010','Anna Martinez','EMP_AITECH','TOLI_ML','Machine Learning','','','0123456789012345',1487.50,'1','WRK-ED59FA7C7927','PENDING','RCP-20251007-201746-391','2025-10-07 14:47:47',NULL),(18,'WRK011','WRK011','Christopher Lee','EMP_BLOCKCHAIN_CO','TOLI_BLOCKCHAIN','Blockchain','','','1234567890123457',1440.00,'1','WRK-9F944042A36F','PENDING','RCP-20251007-201746-391','2025-10-07 14:47:47',NULL),(19,'WRK012','WRK012','Maria Rodriguez','EMP_CYBERSEC','TOLI_SECURITY','Security','','','2345678901234568',975.00,'1','WRK-E9CFC1500BF2','PENDING','RCP-20251007-201746-391','2025-10-07 14:47:47',NULL),(20,'WRK012','WRK012','Maria Rodriguez','EMP_CYBERSEC','TOLI_SECURITY','Security','','','2345678901234568',975.00,'1','WRK-E9CFC1500BF2','PAYMENT_INITIATED','RCP-20251007-201746-391','2025-10-07 14:47:47',NULL),(21,'WRK011','WRK011','Christopher Lee','EMP_BLOCKCHAIN_CO','TOLI_BLOCKCHAIN','Blockchain','','','1234567890123457',1440.00,'1','WRK-9F944042A36F','PAYMENT_INITIATED','RCP-20251007-201746-391','2025-10-07 14:47:47',NULL),(22,'WRK010','WRK010','Anna Martinez','EMP_AITECH','TOLI_ML','Machine Learning','','','0123456789012345',1487.50,'1','WRK-ED59FA7C7927','PAYMENT_INITIATED','RCP-20251007-201746-391','2025-10-07 14:47:47',NULL),(23,'WRK009','WRK009','James Garcia','EMP_GAMESTUDIO','TOLI_ART','Art','','','9012345678901234',945.00,'1','WRK-101F8B12CD2F','PAYMENT_INITIATED','RCP-20251007-201746-391','2025-10-07 14:47:47',NULL),(24,'WRK008','WRK008','Jennifer Taylor','EMP_HEALTHTECH','TOLI_PRODUCT','Product','','','8901234567890123',1443.75,'1','WRK-B87BED5DECD0','PAYMENT_INITIATED','RCP-20251007-201746-391','2025-10-07 14:47:47',NULL),(25,'WRK007','WRK007','Robert Miller','EMP_ECOMCORP','TOLI_MARKETING','Marketing','','','7890123456789012',600.00,'1','WRK-3710648BF716','PAYMENT_INITIATED','RCP-20251007-201746-391','2025-10-07 14:47:47',NULL),(26,'WRK006','WRK006','Lisa Anderson','EMP_STARTUPX','TOLI_FRONTEND','Frontend','','','6789012345678901',682.00,'1','WRK-B1E309B9AF66','PAYMENT_INITIATED','RCP-20251007-201746-391','2025-10-07 14:47:47',NULL),(27,'WRK005','WRK005','David Wilson','EMP_FINANCEAPP','TOLI_BACKEND','Backend','','','5678901234567890',1240.00,'1','WRK-59290708F811','PAYMENT_INITIATED','RCP-20251007-201746-391','2025-10-07 14:47:47',NULL),(28,'WRK004','WRK004','Emily Davis','EMP_CLOUDTECH','TOLI_DEVOPS','DevOps','','','4567890123456789',1190.00,'1','WRK-E836162A3C29','PAYMENT_INITIATED','RCP-20251007-201746-391','2025-10-07 14:47:47',NULL),(29,'WRK003','WRK003','Michael Brown','EMP_WEBSOLUTIONS','TOLI_DESIGN','Design','','','3456789012345678',783.75,'1','WRK-A3FB2FDF1471','PAYMENT_INITIATED','RCP-20251007-201746-391','2025-10-07 14:47:47',NULL),(30,'WRK002','WRK002','Sarah Johnson','EMP_DATASOFT_INC','TOLI_QA','Quality Assurance','','','2345678901234567',825.00,'1','WRK-7F1507D9F9C5','PAYMENT_INITIATED','RCP-20251007-201746-391','2025-10-07 14:47:47',NULL),(31,'WRK001','WRK001','John Smith','EMP_TECHCORP_LTD','TOLI_ENGINEERING','Engineering','','','1234567890123456',1000.00,'1','WRK-1E4EBE82668D','PAYMENT_INITIATED','RCP-20251007-201746-391','2025-10-07 14:47:47',NULL);
/*!40000 ALTER TABLE `worker_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `worker_uploaded_data`
--

DROP TABLE IF EXISTS `worker_uploaded_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `worker_uploaded_data` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `file_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `row_num` int NOT NULL,
  `worker_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `worker_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `employer_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `toli_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `position` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `work_date` date DEFAULT NULL,
  `hours_worked` decimal(5,2) DEFAULT NULL,
  `hourly_rate` decimal(10,2) DEFAULT NULL,
  `payment_amount` decimal(15,2) DEFAULT NULL,
  `bank_account` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_number` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'UPLOADED',
  `rejection_reason` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT NULL,
  `validated_at` datetime DEFAULT NULL,
  `processed_at` datetime DEFAULT NULL,
  `receipt_number` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_file_id` (`file_id`),
  KEY `idx_file_id_status` (`file_id`,`status`),
  KEY `idx_employer_id` (`employer_id`),
  KEY `idx_toli_id` (`toli_id`),
  KEY `idx_status` (`status`),
  KEY `idx_row_number` (`file_id`,`row_num`),
  KEY `idx_receipt_number` (`receipt_number`),
  KEY `idx_uploaded_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `worker_uploaded_data`
--

LOCK TABLES `worker_uploaded_data` WRITE;
/*!40000 ALTER TABLE `worker_uploaded_data` DISABLE KEYS */;
INSERT INTO `worker_uploaded_data` VALUES (1,'1',1,'WRK001','John Smith','EMP_TECHCORP_LTD','TOLI_ENGINEERING','TechCorp Ltd','Engineering','Software Developer','2025-10-01',8.00,125.00,1000.00,'1234567890123456','+91-9876543210','john.smith@techcorp.com','123 Tech Street, Mumbai, Maharashtra 400001','REQUEST_GENERATED',NULL,'2025-10-07 14:47:17','2025-10-07 14:47:32','2025-10-07 14:47:47','RCP-20251007-201746-391'),(2,'1',2,'WRK002','Sarah Johnson','EMP_DATASOFT_INC','TOLI_QA','DataSoft Inc','Quality Assurance','QA Engineer','2025-10-01',7.50,110.00,825.00,'2345678901234567','+91-9876543211','sarah.j@datasoft.com','456 Quality Lane, Pune, Maharashtra 411001','REQUEST_GENERATED',NULL,'2025-10-07 14:47:17','2025-10-07 14:47:32','2025-10-07 14:47:47','RCP-20251007-201746-391'),(3,'1',3,'WRK003','Michael Brown','EMP_WEBSOLUTIONS','TOLI_DESIGN','WebSolutions','Design','UI Designer','2025-10-01',8.25,95.00,783.75,'3456789012345678','+91-9876543212','michael.brown@websol.com','789 Design Avenue, Bangalore, Karnataka 560001','REQUEST_GENERATED',NULL,'2025-10-07 14:47:17','2025-10-07 14:47:32','2025-10-07 14:47:47','RCP-20251007-201746-391'),(4,'1',4,'WRK004','Emily Davis','EMP_CLOUDTECH','TOLI_DEVOPS','CloudTech','DevOps','DevOps Engineer','2025-10-01',8.50,140.00,1190.00,'4567890123456789','+91-9876543213','emily.d@cloudtech.com','321 Cloud Plaza, Hyderabad, Telangana 500001','REQUEST_GENERATED',NULL,'2025-10-07 14:47:17','2025-10-07 14:47:32','2025-10-07 14:47:47','RCP-20251007-201746-391'),(5,'1',5,'WRK005','David Wilson','EMP_FINANCEAPP','TOLI_BACKEND','FinanceApp','Backend','Senior Developer','2025-10-01',8.00,155.00,1240.00,'5678901234567890','+91-9876543214','david.wilson@finapp.com','654 Finance Tower, Chennai, Tamil Nadu 600001','REQUEST_GENERATED',NULL,'2025-10-07 14:47:17','2025-10-07 14:47:32','2025-10-07 14:47:47','RCP-20251007-201746-391'),(6,'1',6,'WRK006','Lisa Anderson','EMP_STARTUPX','TOLI_FRONTEND','StartupX','Frontend','React Developer','2025-10-01',7.75,88.00,682.00,'6789012345678901','+91-9876543215','lisa.a@startupx.com','987 Startup Hub, Gurgaon, Haryana 122001','REQUEST_GENERATED',NULL,'2025-10-07 14:47:17','2025-10-07 14:47:32','2025-10-07 14:47:47','RCP-20251007-201746-391'),(7,'1',7,'WRK007','Robert Miller','EMP_ECOMCORP','TOLI_MARKETING','EcomCorp','Marketing','Digital Marketer','2025-10-01',8.00,75.00,600.00,'7890123456789012','+91-9876543216','robert.m@ecomcorp.com','147 Marketing Street, Noida, Uttar Pradesh 201301','REQUEST_GENERATED',NULL,'2025-10-07 14:47:17','2025-10-07 14:47:32','2025-10-07 14:47:47','RCP-20251007-201746-391'),(8,'1',8,'WRK008','Jennifer Taylor','EMP_HEALTHTECH','TOLI_PRODUCT','HealthTech','Product','Product Manager','2025-10-01',8.75,165.00,1443.75,'8901234567890123','+91-9876543217','jennifer.t@healthtech.com','258 Health Avenue, Kolkata, West Bengal 700001','REQUEST_GENERATED',NULL,'2025-10-07 14:47:17','2025-10-07 14:47:32','2025-10-07 14:47:47','RCP-20251007-201746-391'),(9,'1',9,'WRK009','James Garcia','EMP_GAMESTUDIO','TOLI_ART','GameStudio','Art','3D Artist','2025-10-01',9.00,105.00,945.00,'9012345678901234','+91-9876543218','james.g@gamestudio.com','369 Game Plaza, Kochi, Kerala 682001','REQUEST_GENERATED',NULL,'2025-10-07 14:47:17','2025-10-07 14:47:32','2025-10-07 14:47:47','RCP-20251007-201746-391'),(10,'1',10,'WRK010','Anna Martinez','EMP_AITECH','TOLI_ML','AI Tech Solutions','Machine Learning','ML Engineer','2025-10-01',8.50,175.00,1487.50,'0123456789012345','+91-9876543219','anna.martinez@aitech.com','741 AI Boulevard, Bangalore, Karnataka 560002','REQUEST_GENERATED',NULL,'2025-10-07 14:47:17','2025-10-07 14:47:32','2025-10-07 14:47:47','RCP-20251007-201746-391'),(11,'1',11,'WRK011','Christopher Lee','EMP_BLOCKCHAIN_CO','TOLI_BLOCKCHAIN','Blockchain Co','Blockchain','Blockchain Developer','2025-10-01',8.00,180.00,1440.00,'1234567890123457','+91-9876543220','chris.lee@blockchain.com','852 Crypto Street, Mumbai, Maharashtra 400002','REQUEST_GENERATED',NULL,'2025-10-07 14:47:17','2025-10-07 14:47:32','2025-10-07 14:47:47','RCP-20251007-201746-391'),(12,'1',12,'WRK012','Maria Rodriguez','EMP_CYBERSEC','TOLI_SECURITY','CyberSec Corp','Security','Security Analyst','2025-10-01',7.50,130.00,975.00,'2345678901234568','+91-9876543221','maria.r@cybersec.com','963 Security Plaza, Delhi, Delhi 110001','REQUEST_GENERATED',NULL,'2025-10-07 14:47:17','2025-10-07 14:47:32','2025-10-07 14:47:47','RCP-20251007-201746-391');
/*!40000 ALTER TABLE `worker_uploaded_data` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-09  4:25:42
