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
-- Table structure for table `api_rate_limits`
--

DROP TABLE IF EXISTS `api_rate_limits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `api_rate_limits` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_type` enum('WORKER','EMPLOYER','BOARD','ADMIN') COLLATE utf8mb4_unicode_ci NOT NULL,
  `endpoint` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `request_count` int DEFAULT '0',
  `window_start` datetime NOT NULL,
  `window_end` datetime NOT NULL,
  `is_blocked` tinyint(1) DEFAULT '0',
  `blocked_until` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_rate_limit_user_endpoint` (`user_id`,`user_type`,`endpoint`,`window_start`),
  KEY `idx_rate_limits_user` (`user_id`,`user_type`),
  KEY `idx_rate_limits_window` (`window_start`,`window_end`),
  KEY `idx_rate_limits_blocked` (`is_blocked`,`blocked_until`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `api_rate_limits`
--

LOCK TABLES `api_rate_limits` WRITE;
/*!40000 ALTER TABLE `api_rate_limits` DISABLE KEYS */;
/*!40000 ALTER TABLE `api_rate_limits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_event`
--

DROP TABLE IF EXISTS `audit_event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_event` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `occurred_at` datetime(6) NOT NULL,
  `trace_id` varchar(64) NOT NULL,
  `user_id` varchar(128) NOT NULL,
  `action` varchar(128) NOT NULL,
  `resource_type` varchar(64) NOT NULL,
  `resource_id` varchar(128) DEFAULT NULL,
  `outcome` varchar(16) NOT NULL,
  `client_ip` varchar(64) DEFAULT NULL,
  `user_agent` varchar(256) DEFAULT NULL,
  `details` json DEFAULT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `prev_hash` varchar(64) NOT NULL,
  `hash` varchar(64) NOT NULL,
  `response_hash` varchar(64) DEFAULT NULL,
  `referer` varchar(256) DEFAULT NULL,
  `client_source` varchar(64) DEFAULT NULL,
  `requested_with` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_audit_event` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_event`
--

LOCK TABLES `audit_event` WRITE;
/*!40000 ALTER TABLE `audit_event` DISABLE KEYS */;
INSERT INTO `audit_event` VALUES (1,'2025-10-11 10:06:01.103915','ce09eb4a-83d0-4969-a98d-ea30e2614aa6','admin','VALIDATE_UPLOADED_DATA','WORKER_UPLOADED_DATA',NULL,'SUCCESS','0:0:0:0:0:0:0:1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',NULL,'[\"1\"]',NULL,'0','f773c010c0fc0b010bc680837785b4df5291ee79fb7c362cad011f79a10eb2ea','f75adb860cab71ccdbf5a5ff69ff4ff8d7f61795fe57c49ba3e4f22990798e62',NULL,NULL,NULL),(2,'2025-10-11 10:06:20.624408','38039f3d-49ba-4822-b8f1-9b417c9fadfe','admin','VALIDATE_UPLOADED_DATA','WORKER_UPLOADED_DATA',NULL,'SUCCESS','0:0:0:0:0:0:0:1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',NULL,'[\"2\"]',NULL,'0','542615a08eba3be9613201ce14407b27321c9c7398d32c86794355d3a5676837','fac441ebf8ff77620dbd18062c6aa0b8f45a8e2f7bd63fc534a54f315622f70a',NULL,NULL,NULL);
/*!40000 ALTER TABLE `audit_event` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_log`
--

DROP TABLE IF EXISTS `audit_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_log` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `table_name` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `record_id` bigint NOT NULL,
  `operation_type` enum('INSERT','UPDATE','DELETE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `changed_by` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `changed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `idx_audit_log_table_record` (`table_name`,`record_id`),
  KEY `idx_audit_log_changed_by` (`changed_by`),
  KEY `idx_audit_log_changed_at` (`changed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_log`
--

LOCK TABLES `audit_log` WRITE;
/*!40000 ALTER TABLE `audit_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `authorization_audit`
--

DROP TABLE IF EXISTS `authorization_audit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `authorization_audit` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `endpoint_key` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `http_method` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `request_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `required_capability` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `decision` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_decision` (`decision`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `authorization_audit`
--

LOCK TABLES `authorization_audit` WRITE;
/*!40000 ALTER TABLE `authorization_audit` DISABLE KEYS */;
/*!40000 ALTER TABLE `authorization_audit` ENABLE KEYS */;
UNLOCK TABLES;

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
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `board_master`
--

LOCK TABLES `board_master` WRITE;
/*!40000 ALTER TABLE `board_master` DISABLE KEYS */;
INSERT INTO `board_master` VALUES (1,'BRD001','Maharashtra State Building and Construction Workers Welfare Board','MSBCWB','Maharashtra','Mumbai','Mantralaya, Mumbai - 400032','Rajesh Kumar','rajesh.kumar@msbcwb.gov.in','022-22022001','ACTIVE','2025-10-09 15:23:20','2025-10-09 15:23:20'),(2,'BRD002','Karnataka Building and Other Construction Workers Welfare Board','KBOCWB','Karnataka','Bangalore','Vidhana Soudha, Bangalore - 560001','Suresh Reddy','suresh.reddy@kbocwb.gov.in','080-22250001','ACTIVE','2025-10-09 15:23:20','2025-10-09 15:23:20'),(3,'BRD003','Tamil Nadu Building and Construction Workers Welfare Board','TNBCWB','Tamil Nadu','Chennai','Secretariat, Chennai - 600009','Murugan Subramanian','murugan.s@tnbcwb.gov.in','044-22353000','ACTIVE','2025-10-09 15:23:20','2025-10-09 15:23:20'),(4,'BRD004','Gujarat Building and Other Construction Workers Welfare Board','GBOCWB','Gujarat','Gandhinagar','Block No. 16, Sachivalaya, Gandhinagar - 382010','Jayesh Patel','jayesh.patel@gbocwb.gov.in','079-23250000','ACTIVE','2025-10-09 15:23:20','2025-10-09 15:23:20'),(5,'BRD005','Uttar Pradesh Building and Construction Workers Welfare Board','UPBCWB','Uttar Pradesh','Lucknow','Vibhuti Khand, Gomti Nagar, Lucknow - 226010','Arun Verma','arun.verma@upbcwb.gov.in','0522-2306000','ACTIVE','2025-10-09 15:23:20','2025-10-09 15:23:20');
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
  `status` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `maker` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checker` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `receipt_date` date NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_board_id` (`board_id`),
  KEY `idx_employer_id` (`employer_id`),
  KEY `idx_toli_id` (`toli_id`),
  KEY `idx_status` (`status`),
  KEY `idx_utr_number` (`utr_number`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `board_receipts`
--

LOCK TABLES `board_receipts` WRITE;
/*!40000 ALTER TABLE `board_receipts` DISABLE KEYS */;
INSERT INTO `board_receipts` VALUES (1,'BOARD_BRD-20251011-009','BRD-20251011-009','EMP-20251011-221714-114','EMP123','TOLI456',4365.00,'','PENDING','AA',NULL,'2025-10-11'),(2,'BOARD_BRD-20251011-009','BRD-20251011-009','EMP-20251011-221714-114','EMP123','TOLI456',4365.00,'TXNREF','VERIFIED','AA','AA','2025-10-11'),(3,'BOARD_BRD-20251011-918','BRD-20251011-918','EMP-20251011-221714-114','EMP123','TOLI456',4365.00,'','PENDING','AA',NULL,'2025-10-11');
/*!40000 ALTER TABLE `board_receipts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `capabilities`
--

DROP TABLE IF EXISTS `capabilities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `capabilities` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `module` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `resource` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_name` (`name`),
  KEY `idx_module` (`module`),
  KEY `idx_action` (`action`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `capabilities`
--

LOCK TABLES `capabilities` WRITE;
/*!40000 ALTER TABLE `capabilities` DISABLE KEYS */;
INSERT INTO `capabilities` VALUES (1,'AUTH_LOGIN','User login capability','AUTH','LOGIN','USER',1,'2025-10-12 08:58:29','2025-10-12 08:58:29'),(2,'AUTH_LOGOUT','User logout capability','AUTH','LOGOUT','USER',1,'2025-10-12 08:58:29','2025-10-12 08:58:29'),(3,'AUTH_PROFILE_READ','Read user profile','AUTH','READ','PROFILE',1,'2025-10-12 08:58:29','2025-10-12 08:58:29'),(4,'AUTH_PROFILE_UPDATE','Update user profile','AUTH','UPDATE','PROFILE',1,'2025-10-12 08:58:29','2025-10-12 08:58:29'),(5,'USER_MANAGE','Full user management','USER_MANAGEMENT','MANAGE','USER',1,'2025-10-12 08:58:29','2025-10-12 08:58:29'),(6,'USER_CREATE','Create users','USER_MANAGEMENT','CREATE','USER',1,'2025-10-12 08:58:29','2025-10-12 08:58:29'),(7,'USER_READ','Read user data','USER_MANAGEMENT','READ','USER',1,'2025-10-12 08:58:29','2025-10-12 08:58:29'),(8,'USER_UPDATE','Update users','USER_MANAGEMENT','UPDATE','USER',1,'2025-10-12 08:58:29','2025-10-12 08:58:29'),(9,'USER_DELETE','Delete users','USER_MANAGEMENT','DELETE','USER',1,'2025-10-12 08:58:29','2025-10-12 08:58:29'),(10,'ROLE_MANAGE','Full role management','ROLE_MANAGEMENT','MANAGE','ROLE',1,'2025-10-12 08:58:29','2025-10-12 08:58:29'),(11,'ROLE_CREATE','Create roles','ROLE_MANAGEMENT','CREATE','ROLE',1,'2025-10-12 08:58:29','2025-10-12 08:58:29'),(12,'ROLE_READ','Read role data','ROLE_MANAGEMENT','READ','ROLE',1,'2025-10-12 08:58:29','2025-10-12 08:58:29'),(13,'ROLE_UPDATE','Update roles','ROLE_MANAGEMENT','UPDATE','ROLE',1,'2025-10-12 08:58:29','2025-10-12 08:58:29'),(14,'ROLE_DELETE','Delete roles','ROLE_MANAGEMENT','DELETE','ROLE',1,'2025-10-12 08:58:29','2025-10-12 08:58:29'),(15,'CAPABILITY_MANAGE','Full capability management','CAPABILITY_MANAGEMENT','MANAGE','CAPABILITY',1,'2025-10-12 08:58:29','2025-10-12 08:58:29'),(16,'CAPABILITY_CREATE','Create capabilities','CAPABILITY_MANAGEMENT','CREATE','CAPABILITY',1,'2025-10-12 08:58:29','2025-10-12 08:58:29'),(17,'CAPABILITY_READ','Read capability data','CAPABILITY_MANAGEMENT','READ','CAPABILITY',1,'2025-10-12 08:58:29','2025-10-12 08:58:29'),(18,'CAPABILITY_UPDATE','Update capabilities','CAPABILITY_MANAGEMENT','UPDATE','CAPABILITY',1,'2025-10-12 08:58:29','2025-10-12 08:58:29'),(19,'CAPABILITY_DELETE','Delete capabilities','CAPABILITY_MANAGEMENT','DELETE','CAPABILITY',1,'2025-10-12 08:58:29','2025-10-12 08:58:29'),(20,'POLICY_MANAGE','Full policy management','POLICY_MANAGEMENT','MANAGE','POLICY',1,'2025-10-12 08:58:29','2025-10-12 08:58:29'),(21,'POLICY_CREATE','Create policies','POLICY_MANAGEMENT','CREATE','POLICY',1,'2025-10-12 08:58:29','2025-10-12 08:58:29'),(22,'POLICY_READ','Read policy data','POLICY_MANAGEMENT','READ','POLICY',1,'2025-10-12 08:58:29','2025-10-12 08:58:29'),(23,'POLICY_UPDATE','Update policies','POLICY_MANAGEMENT','UPDATE','POLICY',1,'2025-10-12 08:58:29','2025-10-12 08:58:29'),(24,'POLICY_DELETE','Delete policies','POLICY_MANAGEMENT','DELETE','POLICY',1,'2025-10-12 08:58:29','2025-10-12 08:58:29'),(25,'ENDPOINT_MANAGE','Full endpoint management','ENDPOINT_MANAGEMENT','MANAGE','ENDPOINT',1,'2025-10-12 08:58:29','2025-10-12 08:58:29'),(26,'ENDPOINT_CREATE','Create endpoints','ENDPOINT_MANAGEMENT','CREATE','ENDPOINT',1,'2025-10-12 08:58:29','2025-10-12 08:58:29'),(27,'ENDPOINT_READ','Read endpoint data','ENDPOINT_MANAGEMENT','READ','ENDPOINT',1,'2025-10-12 08:58:29','2025-10-12 08:58:29'),(28,'ENDPOINT_UPDATE','Update endpoints','ENDPOINT_MANAGEMENT','UPDATE','ENDPOINT',1,'2025-10-12 08:58:29','2025-10-12 08:58:29'),(29,'ENDPOINT_DELETE','Delete endpoints','ENDPOINT_MANAGEMENT','DELETE','ENDPOINT',1,'2025-10-12 08:58:29','2025-10-12 08:58:29'),(30,'UI_PAGE_MANAGE','Full UI page management','UI_MANAGEMENT','MANAGE','PAGE',1,'2025-10-12 08:58:29','2025-10-12 08:58:29'),(31,'UI_PAGE_CREATE','Create UI pages','UI_MANAGEMENT','CREATE','PAGE',1,'2025-10-12 08:58:29','2025-10-12 08:58:29'),(32,'UI_PAGE_READ','Read UI page data','UI_MANAGEMENT','READ','PAGE',1,'2025-10-12 08:58:29','2025-10-12 08:58:29'),(33,'UI_PAGE_UPDATE','Update UI pages','UI_MANAGEMENT','UPDATE','PAGE',1,'2025-10-12 08:58:29','2025-10-12 08:58:29'),(34,'UI_PAGE_DELETE','Delete UI pages','UI_MANAGEMENT','DELETE','PAGE',1,'2025-10-12 08:58:29','2025-10-12 08:58:29'),(35,'PAGE_ACTION_MANAGE','Full page action management','UI_MANAGEMENT','MANAGE','ACTION',1,'2025-10-12 08:58:29','2025-10-12 08:58:29'),(36,'PAGE_ACTION_CREATE','Create page actions','UI_MANAGEMENT','CREATE','ACTION',1,'2025-10-12 08:58:29','2025-10-12 08:58:29'),(37,'PAGE_ACTION_READ','Read page action data','UI_MANAGEMENT','READ','ACTION',1,'2025-10-12 08:58:29','2025-10-12 08:58:29'),(38,'PAGE_ACTION_UPDATE','Update page actions','UI_MANAGEMENT','UPDATE','ACTION',1,'2025-10-12 08:58:29','2025-10-12 08:58:29'),(39,'PAGE_ACTION_DELETE','Delete page actions','UI_MANAGEMENT','DELETE','ACTION',1,'2025-10-12 08:58:29','2025-10-12 08:58:29'),(40,'SYSTEM_MAINTENANCE','System maintenance operations','SYSTEM','MAINTENANCE','SYSTEM',1,'2025-10-12 08:58:29','2025-10-12 08:58:29'),(41,'SYSTEM_CONFIG_READ','Read system configuration','SYSTEM','READ','CONFIG',1,'2025-10-12 08:58:29','2025-10-12 08:58:29'),(42,'SYSTEM_CONFIG_UPDATE','Update system configuration','SYSTEM','UPDATE','CONFIG',1,'2025-10-12 08:58:29','2025-10-12 08:58:29'),(43,'SYSTEM_LOGS_READ','Read system logs','SYSTEM','READ','LOGS',1,'2025-10-12 08:58:29','2025-10-12 08:58:29'),(44,'SYSTEM_BACKUP','System backup operations','SYSTEM','BACKUP','SYSTEM',1,'2025-10-12 08:58:29','2025-10-12 08:58:29');
/*!40000 ALTER TABLE `capabilities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `capabilities_backup`
--

DROP TABLE IF EXISTS `capabilities_backup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `capabilities_backup` (
  `id` bigint NOT NULL DEFAULT '0',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `module` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `resource` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `capabilities_backup`
--

LOCK TABLES `capabilities_backup` WRITE;
/*!40000 ALTER TABLE `capabilities_backup` DISABLE KEYS */;
INSERT INTO `capabilities_backup` VALUES (1,'AUTH.LOGIN','User can login to the system','AUTH','LOGIN','AUTH',1,'2025-10-09 15:41:59',NULL),(2,'AUTH.LOGOUT','User can logout from the system','AUTH','LOGOUT','AUTH',1,'2025-10-09 15:41:59',NULL),(3,'AUTH.REFRESH_TOKEN','User can refresh authentication token','AUTH','REFRESH_TOKEN','AUTH',1,'2025-10-09 15:41:59',NULL),(4,'AUTH.VIEW_PROFILE','User can view their own profile','AUTH','VIEW_PROFILE','AUTH',1,'2025-10-09 15:41:59',NULL),(5,'AUTH.UPDATE_PROFILE','User can update their own profile','AUTH','UPDATE_PROFILE','AUTH',1,'2025-10-09 15:41:59',NULL),(6,'AUTH.CHANGE_PASSWORD','User can change their password','AUTH','CHANGE_PASSWORD','AUTH',1,'2025-10-09 15:41:59',NULL),(7,'USER_MANAGEMENT.LIST','View list of all users','USER_MANAGEMENT','LIST','USER',1,'2025-10-09 15:41:59',NULL),(8,'USER_MANAGEMENT.READ','View specific user details','USER_MANAGEMENT','READ','USER',1,'2025-10-09 15:41:59',NULL),(9,'USER_MANAGEMENT.CREATE','Create new user accounts','USER_MANAGEMENT','CREATE','USER',1,'2025-10-09 15:41:59',NULL),(10,'USER_MANAGEMENT.UPDATE','Update user information','USER_MANAGEMENT','UPDATE','USER',1,'2025-10-09 15:41:59',NULL),(11,'USER_MANAGEMENT.DELETE','Delete user accounts','USER_MANAGEMENT','DELETE','USER',1,'2025-10-09 15:41:59',NULL),(12,'USER_MANAGEMENT.ACTIVATE','Activate/deactivate users','USER_MANAGEMENT','ACTIVATE','USER',1,'2025-10-09 15:41:59',NULL),(13,'ROLE_MANAGEMENT.LIST','View list of all roles','ROLE_MANAGEMENT','LIST','ROLE',1,'2025-10-09 15:41:59',NULL),(14,'ROLE_MANAGEMENT.READ','View specific role details','ROLE_MANAGEMENT','READ','ROLE',1,'2025-10-09 15:41:59',NULL),(15,'ROLE_MANAGEMENT.CREATE','Create new roles','ROLE_MANAGEMENT','CREATE','ROLE',1,'2025-10-09 15:41:59',NULL),(16,'ROLE_MANAGEMENT.UPDATE','Update role information','ROLE_MANAGEMENT','UPDATE','ROLE',1,'2025-10-09 15:41:59',NULL),(17,'ROLE_MANAGEMENT.DELETE','Delete roles','ROLE_MANAGEMENT','DELETE','ROLE',1,'2025-10-09 15:41:59',NULL),(18,'ROLE_MANAGEMENT.ASSIGN_USERS','Assign roles to users','ROLE_MANAGEMENT','ASSIGN_USERS','ROLE',1,'2025-10-09 15:41:59',NULL),(19,'PERMISSION_MANAGEMENT.LIST','View capabilities and policies','PERMISSION_MANAGEMENT','LIST','PERMISSION',1,'2025-10-09 15:41:59',NULL),(20,'PERMISSION_MANAGEMENT.READ','View capability/policy details','PERMISSION_MANAGEMENT','READ','PERMISSION',1,'2025-10-09 15:41:59',NULL),(21,'PERMISSION_MANAGEMENT.CREATE','Create capabilities/policies','PERMISSION_MANAGEMENT','CREATE','PERMISSION',1,'2025-10-09 15:41:59',NULL),(22,'PERMISSION_MANAGEMENT.UPDATE','Update capabilities/policies','PERMISSION_MANAGEMENT','UPDATE','PERMISSION',1,'2025-10-09 15:41:59',NULL),(23,'PERMISSION_MANAGEMENT.DELETE','Delete capabilities/policies','PERMISSION_MANAGEMENT','DELETE','PERMISSION',1,'2025-10-09 15:41:59',NULL),(24,'WORKER.LIST','View list of worker data','WORKER','LIST','WORKER',1,'2025-10-09 15:41:59',NULL),(25,'WORKER.READ','View worker details','WORKER','READ','WORKER',1,'2025-10-09 15:41:59',NULL),(26,'WORKER.CREATE','Upload/create worker data','WORKER','CREATE','WORKER',1,'2025-10-09 15:41:59',NULL),(27,'WORKER.UPDATE','Update worker information','WORKER','UPDATE','WORKER',1,'2025-10-09 15:41:59',NULL),(28,'WORKER.DELETE','Delete worker data','WORKER','DELETE','WORKER',1,'2025-10-09 15:41:59',NULL),(29,'WORKER.VALIDATE','Validate worker data entries','WORKER','VALIDATE','WORKER',1,'2025-10-09 15:41:59',NULL),(30,'WORKER.GENERATE_PAYMENTS','Generate payment requests','WORKER','GENERATE_PAYMENTS','WORKER',1,'2025-10-09 15:41:59',NULL),(31,'WORKER.DOWNLOAD','Download worker data','WORKER','DOWNLOAD','WORKER',1,'2025-10-09 15:41:59',NULL),(32,'PAYMENT.LIST','View list of payments','PAYMENT','LIST','PAYMENT',1,'2025-10-09 15:41:59',NULL),(33,'PAYMENT.READ','View payment details','PAYMENT','READ','PAYMENT',1,'2025-10-09 15:41:59',NULL),(34,'PAYMENT.CREATE','Create payment requests','PAYMENT','CREATE','PAYMENT',1,'2025-10-09 15:41:59',NULL),(35,'PAYMENT.UPDATE','Update payment information','PAYMENT','UPDATE','PAYMENT',1,'2025-10-09 15:41:59',NULL),(36,'PAYMENT.DELETE','Delete payments','PAYMENT','DELETE','PAYMENT',1,'2025-10-09 15:41:59',NULL),(37,'PAYMENT.PROCESS','Process payment requests','PAYMENT','PROCESS','PAYMENT',1,'2025-10-09 15:41:59',NULL),(38,'PAYMENT.APPROVE','Approve payment requests','PAYMENT','APPROVE','PAYMENT',1,'2025-10-09 15:41:59',NULL),(39,'PAYMENT.REJECT','Reject payment requests','PAYMENT','REJECT','PAYMENT',1,'2025-10-09 15:41:59',NULL),(40,'PAYMENT.GENERATE_REPORTS','Generate payment reports','PAYMENT','GENERATE_REPORTS','PAYMENT',1,'2025-10-09 15:41:59',NULL),(41,'EMPLOYER.LIST','View list of employers','EMPLOYER','LIST','EMPLOYER',1,'2025-10-09 15:41:59',NULL),(42,'EMPLOYER.READ','View employer details','EMPLOYER','READ','EMPLOYER',1,'2025-10-09 15:41:59',NULL),(43,'EMPLOYER.CREATE','Create employer records','EMPLOYER','CREATE','EMPLOYER',1,'2025-10-09 15:41:59',NULL),(44,'EMPLOYER.UPDATE','Update employer information','EMPLOYER','UPDATE','EMPLOYER',1,'2025-10-09 15:41:59',NULL),(45,'EMPLOYER.DELETE','Delete employer records','EMPLOYER','DELETE','EMPLOYER',1,'2025-10-09 15:41:59',NULL),(46,'EMPLOYER.VIEW_RECEIPTS','View employer payment receipts','EMPLOYER','VIEW_RECEIPTS','EMPLOYER',1,'2025-10-09 15:41:59',NULL),(47,'EMPLOYER.VALIDATE_RECEIPTS','Validate employer receipts','EMPLOYER','VALIDATE_RECEIPTS','EMPLOYER',1,'2025-10-09 15:41:59',NULL),(48,'EMPLOYER.SEND_TO_BOARD','Send receipts to board','EMPLOYER','SEND_TO_BOARD','EMPLOYER',1,'2025-10-09 15:41:59',NULL),(49,'BOARD.LIST','View list of board items','BOARD','LIST','BOARD',1,'2025-10-09 15:41:59',NULL),(50,'BOARD.READ','View board item details','BOARD','READ','BOARD',1,'2025-10-09 15:41:59',NULL),(51,'BOARD.VIEW_RECEIPTS','View board receipts','BOARD','VIEW_RECEIPTS','BOARD',1,'2025-10-09 15:41:59',NULL),(52,'BOARD.APPROVE','Approve board receipts','BOARD','APPROVE','BOARD',1,'2025-10-09 15:41:59',NULL),(53,'BOARD.REJECT','Reject board receipts','BOARD','REJECT','BOARD',1,'2025-10-09 15:41:59',NULL),(54,'BOARD.GENERATE_REPORTS','Generate board reports','BOARD','GENERATE_REPORTS','BOARD',1,'2025-10-09 15:41:59',NULL),(55,'RECONCILIATION.LIST','View reconciliation data','RECONCILIATION','LIST','RECONCILIATION',1,'2025-10-09 15:41:59',NULL),(56,'RECONCILIATION.READ','View reconciliation details','RECONCILIATION','READ','RECONCILIATION',1,'2025-10-09 15:41:59',NULL),(57,'RECONCILIATION.PERFORM','Perform payment reconciliation','RECONCILIATION','PERFORM','RECONCILIATION',1,'2025-10-09 15:41:59',NULL),(58,'RECONCILIATION.GENERATE_REPORTS','Generate reconciliation reports','RECONCILIATION','GENERATE_REPORTS','RECONCILIATION',1,'2025-10-09 15:41:59',NULL),(59,'DASHBOARD.VIEW','View dashboard','DASHBOARD','VIEW','DASHBOARD',1,'2025-10-09 15:41:59',NULL),(60,'DASHBOARD.VIEW_STATS','View dashboard statistics','DASHBOARD','VIEW_STATS','DASHBOARD',1,'2025-10-09 15:41:59',NULL),(61,'AUDIT.VIEW_LOGS','View system audit logs','AUDIT','VIEW_LOGS','AUDIT',1,'2025-10-09 15:41:59',NULL),(62,'AUDIT.VIEW_AUTH_LOGS','View authorization audit logs','AUDIT','VIEW_AUTH_LOGS','AUDIT',1,'2025-10-09 15:41:59',NULL),(63,'AUDIT.EXPORT','Export audit logs','AUDIT','EXPORT','AUDIT',1,'2025-10-09 15:41:59',NULL),(64,'SYSTEM.MAINTENANCE','Perform system maintenance','SYSTEM','MAINTENANCE','SYSTEM',1,'2025-10-09 15:41:59',NULL),(65,'SYSTEM.DATABASE_CLEANUP','Perform database cleanup','SYSTEM','DATABASE_CLEANUP','SYSTEM',1,'2025-10-09 15:41:59',NULL),(66,'SYSTEM.VIEW_CONFIG','View system configuration','SYSTEM','VIEW_CONFIG','SYSTEM',1,'2025-10-09 15:41:59',NULL),(67,'SYSTEM.UPDATE_CONFIG','Update system configuration','SYSTEM','UPDATE_CONFIG','SYSTEM',1,'2025-10-09 15:41:59',NULL);
/*!40000 ALTER TABLE `capabilities_backup` ENABLE KEYS */;
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
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employer_master`
--

LOCK TABLES `employer_master` WRITE;
/*!40000 ALTER TABLE `employer_master` DISABLE KEYS */;
INSERT INTO `employer_master` VALUES (1,'EMP001','Larsen & Toubro Limited','LNT','U99999MH1946PLC004768','AAACL0204C','27AAACL0204C1ZF','L&T House, Ballard Estate, Mumbai - 400001','Anil Kumar','anil.kumar@lnt.com','022-67525656','ACTIVE','2025-10-09 15:23:20','2025-10-09 15:23:20'),(2,'EMP002','Shapoorji Pallonji and Company Pvt Ltd','SPCPL','U45200MH1865PTC000638','AAACP0208B','27AAACP0208B1ZG','SP House, 41/44 Minoo Desai Marg, Mumbai - 400005','Ravi Menon','ravi.menon@shapoorji.com','022-66794444','ACTIVE','2025-10-09 15:23:20','2025-10-09 15:23:20'),(3,'EMP003','Tata Projects Limited','TPL','U45201TG1979PLC002594','AAACT2335E','36AAACT2335E1ZY','TATA Projects House, Hyderabad - 500034','Srinivas Rao','srinivas.rao@tataprojects.com','040-44366666','ACTIVE','2025-10-09 15:23:20','2025-10-09 15:23:20'),(4,'EMP004','Godrej Construction','GC','U45200MH1980PTC023093','AAACG0007A','27AAACG0007A1ZC','Godrej One, Pirojshanagar, Mumbai - 400079','Priya Shah','priya.shah@godrej.com','022-62424200','ACTIVE','2025-10-09 15:23:20','2025-10-09 15:23:20'),(5,'EMP005','Prestige Group','PG','U70109KA1986PLC007629','AABCP7433P','29AABCP7433P1ZH','Prestige Falcon Tower, Bangalore - 560001','Vijay Kumar','vijay.kumar@prestigegroup.com','080-25591080','ACTIVE','2025-10-09 15:23:20','2025-10-09 15:23:20');
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
  `validated_at` timestamp NOT NULL,
  `total_records` int NOT NULL,
  `total_amount` decimal(15,2) NOT NULL,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employer_receipt_number` (`employer_receipt_number`),
  KEY `idx_employer_receipt_number` (`employer_receipt_number`),
  KEY `idx_worker_receipt_number` (`worker_receipt_number`),
  KEY `idx_employer_id` (`employer_id`),
  KEY `idx_toli_id` (`toli_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employer_payment_receipts`
--

LOCK TABLES `employer_payment_receipts` WRITE;
/*!40000 ALTER TABLE `employer_payment_receipts` DISABLE KEYS */;
INSERT INTO `employer_payment_receipts` VALUES (1,'EMP-20251011-221714-114','RCP-20251011-221244-522','EMP123','TOLI456','TXNREF','AA','2025-10-11 17:12:43',20,4365.00,'SEND TO BOARD');
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
  UNIQUE KEY `uk_employer_toli` (`employer_id`,`toli_id`),
  KEY `idx_employer_id` (`employer_id`),
  KEY `idx_toli_id` (`toli_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employer_toli_relation`
--

LOCK TABLES `employer_toli_relation` WRITE;
/*!40000 ALTER TABLE `employer_toli_relation` DISABLE KEYS */;
INSERT INTO `employer_toli_relation` VALUES (1,'EMP001','TOLI001','LNT Mumbai Construction Toli','LNT-MUM-001','Bandra Kurla Complex, Mumbai','Suresh Patil','9876543210','ACTIVE','2025-10-09 15:23:20','2025-10-09 15:23:20'),(2,'EMP001','TOLI002','LNT Pune Infrastructure Toli','LNT-PUN-002','Hinjewadi, Pune','Rajesh Kumar','9876543211','ACTIVE','2025-10-09 15:23:20','2025-10-09 15:23:20'),(3,'EMP001','TOLI003','LNT Chennai Metro Toli','LNT-CHE-003','Guindy, Chennai','Murugan Rajan','9876543212','ACTIVE','2025-10-09 15:23:20','2025-10-09 15:23:20'),(4,'EMP002','TOLI004','SP Mumbai Residential Toli','SP-MUM-004','Worli, Mumbai','Anil Menon','9876543213','ACTIVE','2025-10-09 15:23:20','2025-10-09 15:23:20'),(5,'EMP002','TOLI005','SP Bangalore Tech Park Toli','SP-BLR-005','Electronic City, Bangalore','Vijay Kumar','9876543214','ACTIVE','2025-10-09 15:23:20','2025-10-09 15:23:20'),(6,'EMP003','TOLI006','Tata Hyderabad Infrastructure Toli','TATA-HYD-006','HITEC City, Hyderabad','Srinivas Rao','9876543215','ACTIVE','2025-10-09 15:23:20','2025-10-09 15:23:20'),(7,'EMP003','TOLI007','Tata Mumbai Metro Toli','TATA-MUM-007','Colaba, Mumbai','Prakash Joshi','9876543216','ACTIVE','2025-10-09 15:23:20','2025-10-09 15:23:20'),(8,'EMP004','TOLI008','Godrej Mumbai Residential Toli','GC-MUM-008','Vikhroli, Mumbai','Ramesh Patil','9876543217','ACTIVE','2025-10-09 15:23:20','2025-10-09 15:23:20'),(9,'EMP004','TOLI009','Godrej Pune Commercial Toli','GC-PUN-009','Kharadi, Pune','Sunil Deshmukh','9876543218','ACTIVE','2025-10-09 15:23:20','2025-10-09 15:23:20'),(10,'EMP005','TOLI010','Prestige Bangalore Residential Toli','PG-BLR-010','Whitefield, Bangalore','Mohan Kumar','9876543219','ACTIVE','2025-10-09 15:23:20','2025-10-09 15:23:20');
/*!40000 ALTER TABLE `employer_toli_relation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `endpoint_policies`
--

DROP TABLE IF EXISTS `endpoint_policies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `endpoint_policies` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `endpoint_id` bigint NOT NULL,
  `policy_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_endpoint_policy` (`endpoint_id`,`policy_id`),
  KEY `fk_endpoint_policies_policy` (`policy_id`),
  CONSTRAINT `fk_endpoint_policies_endpoint` FOREIGN KEY (`endpoint_id`) REFERENCES `endpoints` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_endpoint_policies_policy` FOREIGN KEY (`policy_id`) REFERENCES `policies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `endpoint_policies`
--

LOCK TABLES `endpoint_policies` WRITE;
/*!40000 ALTER TABLE `endpoint_policies` DISABLE KEYS */;
/*!40000 ALTER TABLE `endpoint_policies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `endpoint_policies_backup`
--

DROP TABLE IF EXISTS `endpoint_policies_backup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `endpoint_policies_backup` (
  `id` bigint NOT NULL DEFAULT '0',
  `endpoint_id` bigint NOT NULL,
  `policy_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `endpoint_policies_backup`
--

LOCK TABLES `endpoint_policies_backup` WRITE;
/*!40000 ALTER TABLE `endpoint_policies_backup` DISABLE KEYS */;
INSERT INTO `endpoint_policies_backup` VALUES (134,1,1),(1,1,2),(135,2,1),(2,2,2),(136,3,1),(3,3,2),(137,4,1),(4,4,2),(138,5,1),(5,5,2),(139,6,1),(6,6,2),(158,7,1),(7,7,2),(95,8,1),(8,8,9),(96,9,1),(9,9,9),(97,10,1),(10,10,9),(98,11,1),(11,11,9),(99,12,1),(12,12,9),(100,13,1),(13,13,9),(101,14,1),(14,14,9),(110,15,1),(15,15,9),(111,16,1),(16,16,9),(112,17,1),(17,17,9),(113,18,1),(18,18,9),(114,19,1),(19,19,9),(159,20,1),(20,20,9),(115,21,1),(21,21,9),(160,22,1),(22,22,9),(117,23,1),(30,23,3),(118,24,1),(31,24,3),(120,25,1),(32,25,3),(161,26,1),(33,26,3),(121,27,1),(34,27,3),(122,28,1),(35,28,3),(162,29,1),(36,29,3),(119,30,1),(37,30,3),(163,31,1),(45,31,4),(164,32,1),(46,32,4),(165,33,1),(47,33,4),(166,34,1),(48,34,4),(167,35,1),(49,35,4),(168,36,1),(50,36,4),(169,37,1),(51,37,4),(170,38,1),(52,38,4),(171,39,1),(53,39,4),(172,40,1),(60,40,5),(173,41,1),(61,41,5),(174,42,1),(62,42,5),(175,43,1),(63,43,5),(176,44,1),(64,44,5),(177,45,1),(65,45,5),(178,46,1),(66,46,5),(179,47,1),(67,47,5),(180,48,1),(75,48,6),(181,49,1),(76,49,6),(182,50,1),(77,50,6),(183,51,1),(78,51,6),(184,52,1),(79,52,6),(185,53,1),(82,53,7),(186,54,1),(83,54,7),(187,55,1),(84,55,7),(188,56,1),(85,56,7),(124,57,1),(89,57,8),(125,58,1),(90,58,8),(127,59,1),(92,59,10),(128,60,1),(93,60,10),(129,61,1),(94,61,10),(189,182,1),(190,183,1);
/*!40000 ALTER TABLE `endpoint_policies_backup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `endpoints`
--

DROP TABLE IF EXISTS `endpoints`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `endpoints` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `service` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `version` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `method` varchar(8) COLLATE utf8mb4_unicode_ci NOT NULL,
  `path` varchar(256) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_service_version_method_path` (`service`,`version`,`method`,`path`),
  KEY `idx_service` (`service`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `endpoints`
--

LOCK TABLES `endpoints` WRITE;
/*!40000 ALTER TABLE `endpoints` DISABLE KEYS */;
/*!40000 ALTER TABLE `endpoints` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `endpoints_backup`
--

DROP TABLE IF EXISTS `endpoints_backup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `endpoints_backup` (
  `id` bigint NOT NULL DEFAULT '0',
  `service` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `version` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `method` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `path` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `endpoints_backup`
--

LOCK TABLES `endpoints_backup` WRITE;
/*!40000 ALTER TABLE `endpoints_backup` DISABLE KEYS */;
INSERT INTO `endpoints_backup` VALUES (1,'auth','v1','POST','/api/auth/login','User login',1,'2025-10-09 15:36:47',NULL),(2,'auth','v1','POST','/api/auth/logout','User logout',1,'2025-10-09 15:36:47',NULL),(3,'auth','v1','POST','/api/auth/refresh','Refresh authentication token',1,'2025-10-09 15:36:47',NULL),(4,'auth','v1','GET','/api/auth/me','Get current user profile',1,'2025-10-09 15:36:47',NULL),(5,'auth','v1','PUT','/api/auth/me','Update current user profile',1,'2025-10-09 15:36:47',NULL),(6,'auth','v1','PUT','/api/auth/change-password','Change user password',1,'2025-10-09 15:36:47',NULL),(7,'auth','v1','GET','/api/auth/ui-config','Get UI configuration',1,'2025-10-09 15:36:47',NULL),(8,'user','v1','GET','/api/auth/users','List all users',1,'2025-10-09 15:36:47',NULL),(9,'user','v1','GET','/api/auth/users/{id}','Get user by ID',1,'2025-10-09 15:36:47',NULL),(10,'user','v1','POST','/api/auth/register','Create new user',1,'2025-10-09 15:36:47',NULL),(11,'user','v1','PUT','/api/auth/users/{id}','Update user',1,'2025-10-09 15:36:47',NULL),(12,'user','v1','DELETE','/api/auth/users/{id}','Delete user',1,'2025-10-09 15:36:47',NULL),(13,'user','v1','PATCH','/api/auth/users/{id}/activate','Activate user',1,'2025-10-09 15:36:47',NULL),(14,'user','v1','PATCH','/api/auth/users/{id}/deactivate','Deactivate user',1,'2025-10-09 15:36:47',NULL),(15,'role','v1','GET','/api/admin/roles','List all roles',1,'2025-10-09 15:36:47',NULL),(16,'role','v1','GET','/api/admin/roles/{id}','Get role by ID',1,'2025-10-09 15:36:47',NULL),(17,'role','v1','POST','/api/admin/roles','Create new role',1,'2025-10-09 15:36:47',NULL),(18,'role','v1','PUT','/api/admin/roles/{id}','Update role',1,'2025-10-09 15:36:47',NULL),(19,'role','v1','DELETE','/api/admin/roles/{id}','Delete role',1,'2025-10-09 15:36:47',NULL),(20,'role','v1','GET','/api/admin/roles/{id}/users','Get users in role',1,'2025-10-09 15:36:47',NULL),(21,'role','v1','POST','/api/admin/roles/{roleId}/users/{userId}','Assign user to role',1,'2025-10-09 15:36:47',NULL),(22,'role','v1','DELETE','/api/admin/roles/{roleId}/users/{userId}','Remove user from role',1,'2025-10-09 15:36:47',NULL),(23,'worker','v1','POST','/api/worker/uploaded-data/files/secure-summaries','List worker uploads',1,'2025-10-09 15:36:47','2025-10-12 06:28:49'),(24,'worker','v1','GET','/api/worker/uploaded-data/files/{id}','Get worker file details',1,'2025-10-09 15:36:47',NULL),(25,'worker','v1','POST','/api/worker/uploaded-data/upload','Upload worker data',1,'2025-10-09 15:36:47',NULL),(26,'worker','v1','PUT','/api/worker/uploaded-data/files/{id}','Update worker file',1,'2025-10-09 15:36:47',NULL),(27,'worker','v1','DELETE','/api/worker/uploaded-data/files/{id}','Delete worker file',1,'2025-10-09 15:36:47',NULL),(28,'worker','v1','POST','/api/worker/uploaded-data/files/{id}/validate','Validate worker data',1,'2025-10-09 15:36:47',NULL),(29,'worker','v1','POST','/api/worker/uploaded-data/generate-payments','Generate payment requests',1,'2025-10-09 15:36:47',NULL),(30,'worker','v1','GET','/api/worker/uploaded-data/download/{id}','Download worker data',1,'2025-10-09 15:36:47',NULL),(31,'payment','v1','GET','/api/payments','List payments',1,'2025-10-09 15:36:47',NULL),(32,'payment','v1','GET','/api/payments/{id}','Get payment details',1,'2025-10-09 15:36:47',NULL),(33,'payment','v1','POST','/api/payments','Create payment',1,'2025-10-09 15:36:47',NULL),(34,'payment','v1','PUT','/api/payments/{id}','Update payment',1,'2025-10-09 15:36:47',NULL),(35,'payment','v1','DELETE','/api/payments/{id}','Delete payment',1,'2025-10-09 15:36:47',NULL),(36,'payment','v1','POST','/api/payments/{id}/process','Process payment',1,'2025-10-09 15:36:47',NULL),(37,'payment','v1','POST','/api/payments/{id}/approve','Approve payment',1,'2025-10-09 15:36:47',NULL),(38,'payment','v1','POST','/api/payments/{id}/reject','Reject payment',1,'2025-10-09 15:36:47',NULL),(39,'payment','v1','GET','/api/payments/reports','Generate payment reports',1,'2025-10-09 15:36:47',NULL),(40,'employer','v1','GET','/api/employers','List employers',1,'2025-10-09 15:36:47',NULL),(41,'employer','v1','GET','/api/employers/{id}','Get employer details',1,'2025-10-09 15:36:47',NULL),(42,'employer','v1','POST','/api/employers','Create employer',1,'2025-10-09 15:36:47',NULL),(43,'employer','v1','PUT','/api/employers/{id}','Update employer',1,'2025-10-09 15:36:47',NULL),(44,'employer','v1','DELETE','/api/employers/{id}','Delete employer',1,'2025-10-09 15:36:47',NULL),(45,'employer','v1','GET','/api/employers/{id}/receipts','View employer receipts',1,'2025-10-09 15:36:47',NULL),(46,'employer','v1','POST','/api/employers/{id}/receipts/validate','Validate receipts',1,'2025-10-09 15:36:47',NULL),(47,'employer','v1','POST','/api/employers/{id}/receipts/send-to-board','Send to board',1,'2025-10-09 15:36:47',NULL),(48,'board','v1','GET','/api/board/receipts','List board receipts',1,'2025-10-09 15:36:47',NULL),(49,'board','v1','GET','/api/board/receipts/{id}','Get board receipt details',1,'2025-10-09 15:36:47',NULL),(50,'board','v1','POST','/api/board/receipts/{id}/approve','Approve board receipt',1,'2025-10-09 15:36:47',NULL),(51,'board','v1','POST','/api/board/receipts/{id}/reject','Reject board receipt',1,'2025-10-09 15:36:47',NULL),(52,'board','v1','GET','/api/board/reports','Generate board reports',1,'2025-10-09 15:36:47',NULL),(53,'reconciliation','v1','GET','/api/reconciliation','List reconciliations',1,'2025-10-09 15:36:47',NULL),(54,'reconciliation','v1','GET','/api/reconciliation/{id}','Get reconciliation details',1,'2025-10-09 15:36:47',NULL),(55,'reconciliation','v1','POST','/api/reconciliation/perform','Perform reconciliation',1,'2025-10-09 15:36:47',NULL),(56,'reconciliation','v1','GET','/api/reconciliation/reports','Generate reconciliation reports',1,'2025-10-09 15:36:47',NULL),(57,'dashboard','v1','GET','/api/dashboard','Get dashboard data',1,'2025-10-09 15:36:48',NULL),(58,'dashboard','v1','GET','/api/dashboard/stats','Get dashboard statistics',1,'2025-10-09 15:36:48',NULL),(59,'audit','v1','GET','/api/audit/logs','View audit logs',1,'2025-10-09 15:36:48',NULL),(60,'audit','v1','GET','/api/audit/auth-logs','View authorization logs',1,'2025-10-09 15:36:48',NULL),(61,'audit','v1','GET','/api/audit/export','Export audit logs',1,'2025-10-09 15:36:48',NULL),(182,'system','v1','GET','/api/system/config','Get system configuration',1,'2025-10-10 04:34:54',NULL),(183,'system','v1','PUT','/api/system/config','Update system configuration',1,'2025-10-10 04:34:54',NULL),(184,'employer','v1','GET','/api/v1/employer/list','List all employers',1,'2025-10-10 07:40:05',NULL),(185,'employer','v1','GET','/api/v1/employer/{id}','Get employer details',1,'2025-10-10 07:40:05',NULL),(186,'employer','v1','POST','/api/v1/employer/create','Create employer',1,'2025-10-10 07:40:05',NULL),(187,'employer','v1','PUT','/api/v1/employer/{id}','Update employer',1,'2025-10-10 07:40:05',NULL),(188,'employer','v1','DELETE','/api/v1/employer/{id}','Delete employer',1,'2025-10-10 07:40:05',NULL),(189,'employer','v1','GET','/api/v1/employer/{id}/receipts','View employer receipts',1,'2025-10-10 07:40:05',NULL),(190,'employer','v1','POST','/api/v1/employer/{id}/validate','Validate employer receipts',1,'2025-10-10 07:40:05',NULL),(191,'employer','v1','POST','/api/v1/employer/{id}/send-to-board','Send employer to board',1,'2025-10-10 07:40:05',NULL),(192,'board','v1','GET','/api/v1/board-receipts/{id}','Get board receipt by ID',1,'2025-10-10 07:40:18',NULL),(193,'board','v1','GET','/api/v1/board-receipts/board-ref/{boardRef}','Get board receipts by board ref',1,'2025-10-10 07:40:18',NULL),(194,'board','v1','GET','/api/v1/board-receipts/employer-ref/{employerRef}','Get board receipts by employer ref',1,'2025-10-10 07:40:18',NULL),(195,'board','v1','GET','/api/v1/board-receipts/status/{status}','Get board receipts by status',1,'2025-10-10 07:40:18',NULL),(196,'board','v1','POST','/api/v1/board-receipts/process','Process board receipts',1,'2025-10-10 07:40:18',NULL),(197,'board','v1','POST','/api/v1/board-receipts/secure','Get board receipts pagination session',1,'2025-10-10 07:40:18','2025-10-12 06:34:04'),(198,'board','v1','GET','/api/v1/board-receipts/by-session','Get board receipts by session',1,'2025-10-10 07:40:18',NULL),(199,'board','v1','PUT','/api/v1/board-receipts/{id}','Update board receipt',1,'2025-10-10 07:40:18',NULL),(200,'board','v1','DELETE','/api/v1/board-receipts/{id}','Delete board receipt',1,'2025-10-10 07:40:18',NULL),(201,'worker','v1','POST','/api/worker/uploaded-data/secure-paginated','List all workers (secure paginated)',1,'2025-10-10 08:22:33','2025-10-10 09:45:31');
/*!40000 ALTER TABLE `endpoints_backup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `file_processing_queue`
--

DROP TABLE IF EXISTS `file_processing_queue`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `file_processing_queue` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `file_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `uploaded_file_id` bigint DEFAULT NULL,
  `processing_status` enum('PENDING','IN_PROGRESS','COMPLETED','FAILED','CANCELLED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `priority` int DEFAULT '5',
  `retry_count` int DEFAULT '0',
  `max_retries` int DEFAULT '3',
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `processing_started_at` datetime DEFAULT NULL,
  `processing_completed_at` datetime DEFAULT NULL,
  `processed_by` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_file_queue_status` (`processing_status`),
  KEY `idx_file_queue_priority` (`priority`,`created_at`),
  KEY `idx_file_queue_file` (`file_id`),
  KEY `uploaded_file_id` (`uploaded_file_id`),
  CONSTRAINT `file_processing_queue_ibfk_1` FOREIGN KEY (`uploaded_file_id`) REFERENCES `uploaded_files` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `file_processing_queue`
--

LOCK TABLES `file_processing_queue` WRITE;
/*!40000 ALTER TABLE `file_processing_queue` DISABLE KEYS */;
/*!40000 ALTER TABLE `file_processing_queue` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_templates`
--

DROP TABLE IF EXISTS `notification_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_templates` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `template_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `template_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `template_type` enum('EMAIL','SMS','SYSTEM') COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject_template` text COLLATE utf8mb4_unicode_ci,
  `body_template` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `template_key` (`template_key`),
  KEY `idx_notification_templates_key` (`template_key`),
  KEY `idx_notification_templates_type` (`template_type`),
  KEY `idx_notification_templates_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_templates`
--

LOCK TABLES `notification_templates` WRITE;
/*!40000 ALTER TABLE `notification_templates` DISABLE KEYS */;
INSERT INTO `notification_templates` VALUES (1,'WORKER_PAYMENT_PROCESSED','Worker Payment Processed','EMAIL','Payment Processed - {{workerName}}','Dear {{workerName}},\n\nYour payment of {{amount}} has been processed successfully.\n\nTransaction Reference: {{transactionRef}}\nDate: {{processedDate}}\n\nThank you.',1,'SYSTEM','2025-10-09 07:27:45',NULL,'2025-10-09 07:27:45'),(2,'EMPLOYER_RECEIPT_VALIDATED','Employer Receipt Validated','EMAIL','Receipt Validated - {{receiptNumber}}','Dear {{employerName}},\n\nYour receipt {{receiptNumber}} has been validated successfully.\n\nAmount: {{amount}}\nValidated Date: {{validatedDate}}\n\nThank you.',1,'SYSTEM','2025-10-09 07:27:45',NULL,'2025-10-09 07:27:45'),(3,'FILE_PROCESSING_COMPLETED','File Processing Completed','SYSTEM','File Processing Status','File {{fileName}} processing completed.\nTotal Records: {{totalRecords}}\nSuccess: {{successCount}}\nFailures: {{failureCount}}',1,'SYSTEM','2025-10-09 07:27:45',NULL,'2025-10-09 07:27:45'),(4,'ACCOUNT_LOCKED','Account Locked','EMAIL','Account Security Alert','Dear User,\n\nYour account has been locked due to multiple failed login attempts.\nIt will be unlocked after {{lockDuration}} minutes.\n\nIf this was not you, please contact support.',1,'SYSTEM','2025-10-09 07:27:45',NULL,'2025-10-09 07:27:45');
/*!40000 ALTER TABLE `notification_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `page_actions`
--

DROP TABLE IF EXISTS `page_actions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `page_actions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `label` varchar(128) NOT NULL COMMENT 'Button/action label',
  `action` varchar(64) NOT NULL,
  `page_id` bigint NOT NULL,
  `display_order` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `endpoint_id` bigint DEFAULT NULL COMMENT 'The backend endpoint to call for this action',
  `icon` varchar(64) DEFAULT NULL COMMENT 'Action icon',
  `variant` varchar(32) DEFAULT 'default' COMMENT 'UI variant: primary, secondary, danger',
  `capability_id` bigint NOT NULL COMMENT 'Foreign key to capabilities table',
  PRIMARY KEY (`id`),
  KEY `idx_page_id` (`page_id`),
  KEY `idx_active` (`is_active`),
  KEY `idx_page_action_endpoint` (`endpoint_id`),
  KEY `idx_page_actions_endpoint` (`endpoint_id`),
  KEY `idx_page_actions_capability` (`capability_id`),
  CONSTRAINT `fk_page_action_endpoint` FOREIGN KEY (`endpoint_id`) REFERENCES `endpoints` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_page_actions_capability` FOREIGN KEY (`capability_id`) REFERENCES `capabilities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `page_actions_ibfk_1` FOREIGN KEY (`page_id`) REFERENCES `ui_pages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Actions available on UI pages';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `page_actions`
--

LOCK TABLES `page_actions` WRITE;
/*!40000 ALTER TABLE `page_actions` DISABLE KEYS */;
/*!40000 ALTER TABLE `page_actions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `page_actions_backup`
--

DROP TABLE IF EXISTS `page_actions_backup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `page_actions_backup` (
  `id` bigint NOT NULL DEFAULT '0',
  `label` varchar(128) NOT NULL COMMENT 'Button/action label',
  `action` varchar(64) NOT NULL,
  `page_id` bigint NOT NULL,
  `display_order` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `endpoint_id` bigint DEFAULT NULL COMMENT 'The backend endpoint to call for this action',
  `icon` varchar(64) DEFAULT NULL COMMENT 'Action icon',
  `variant` varchar(32) DEFAULT 'default' COMMENT 'UI variant: primary, secondary, danger',
  `capability_id` bigint NOT NULL COMMENT 'Foreign key to capabilities table'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `page_actions_backup`
--

LOCK TABLES `page_actions_backup` WRITE;
/*!40000 ALTER TABLE `page_actions_backup` DISABLE KEYS */;
INSERT INTO `page_actions_backup` VALUES (2,'Validate Data','VALIDATE',9,2,1,'2025-10-09 16:03:37','2025-10-10 04:09:23',23,NULL,'default',25),(7,'Approve','APPROVE',11,2,1,'2025-10-09 16:03:37','2025-10-10 06:33:14',37,NULL,'default',38),(8,'Reject','REJECT',11,3,1,'2025-10-09 16:03:37','2025-10-10 06:33:16',38,NULL,'default',39),(61,'USER_MANAGEMENT.ACTIVATE','USER_MANAGEMENT.ACTIVATE',14,99,1,'2025-10-10 06:33:02','2025-10-10 06:33:02',NULL,'star','primary',12),(62,'USER_MANAGEMENT.LIST','USER_MANAGEMENT.LIST',14,99,1,'2025-10-10 06:33:02','2025-10-10 06:33:02',NULL,'star','primary',7),(63,'USER_MANAGEMENT.READ','USER_MANAGEMENT.READ',14,99,1,'2025-10-10 06:33:02','2025-10-10 06:33:02',NULL,'star','primary',8),(82,'EMPLOYER.LIST','EMPLOYER.LIST',58,99,1,'2025-10-10 06:46:50','2025-10-10 07:01:44',NULL,'star','primary',41),(97,'BOARD.APPROVE','BOARD.APPROVE',65,0,1,'2025-10-10 07:20:11','2025-10-10 07:20:11',NULL,NULL,'default',52),(98,'BOARD.GENERATE_REPORTS','BOARD.GENERATE_REPORTS',65,0,1,'2025-10-10 07:20:11','2025-10-10 07:20:11',NULL,NULL,'default',54),(99,'BOARD.LIST','BOARD.LIST',65,0,1,'2025-10-10 07:20:11','2025-10-10 07:20:11',NULL,NULL,'default',49),(100,'BOARD.READ','BOARD.READ',65,0,1,'2025-10-10 07:20:11','2025-10-10 07:20:11',NULL,NULL,'default',50),(101,'BOARD.REJECT','BOARD.REJECT',65,0,1,'2025-10-10 07:20:11','2025-10-10 07:20:11',NULL,NULL,'default',53),(102,'BOARD.VIEW_RECEIPTS','BOARD.VIEW_RECEIPTS',65,0,1,'2025-10-10 07:20:11','2025-10-10 07:20:11',NULL,NULL,'default',51),(104,'EMPLOYER.CREATE','EMPLOYER.CREATE',58,2,1,'2025-10-10 07:24:41','2025-10-10 07:25:18',NULL,NULL,'default',43),(105,'EMPLOYER.DELETE','EMPLOYER.DELETE',58,4,1,'2025-10-10 07:24:41','2025-10-10 07:25:18',NULL,NULL,'default',45),(106,'EMPLOYER.READ','EMPLOYER.READ',58,1,1,'2025-10-10 07:24:41','2025-10-10 07:25:18',NULL,NULL,'default',42),(107,'EMPLOYER.SEND_TO_BOARD','EMPLOYER.SEND_TO_BOARD',58,0,1,'2025-10-10 07:24:41','2025-10-10 07:24:41',NULL,NULL,'default',48),(108,'EMPLOYER.UPDATE','EMPLOYER.UPDATE',58,3,1,'2025-10-10 07:24:41','2025-10-10 07:25:18',NULL,NULL,'default',44),(109,'EMPLOYER.VALIDATE_RECEIPTS','EMPLOYER.VALIDATE_RECEIPTS',58,0,1,'2025-10-10 07:24:41','2025-10-10 07:24:41',NULL,NULL,'default',47),(110,'EMPLOYER.VIEW_RECEIPTS','EMPLOYER.VIEW_RECEIPTS',58,0,1,'2025-10-10 07:24:41','2025-10-10 07:24:41',NULL,NULL,'default',46),(111,'Employer List','EMPLOYER.LIST',58,1,1,'2025-10-10 07:46:52','2025-10-10 07:46:52',184,NULL,'default',41),(112,'Employer Read','EMPLOYER.READ',58,2,1,'2025-10-10 07:46:52','2025-10-10 07:46:52',185,NULL,'default',42),(113,'Employer Create','EMPLOYER.CREATE',58,3,1,'2025-10-10 07:46:52','2025-10-10 07:46:52',186,NULL,'default',43),(114,'Employer Update','EMPLOYER.UPDATE',58,4,1,'2025-10-10 07:46:53','2025-10-10 07:46:53',187,NULL,'default',44),(115,'Employer Delete','EMPLOYER.DELETE',58,5,1,'2025-10-10 07:46:53','2025-10-10 07:46:53',188,NULL,'default',45),(116,'Employer View Receipts','EMPLOYER.VIEW_RECEIPTS',58,6,1,'2025-10-10 07:46:53','2025-10-10 07:46:53',189,NULL,'default',46),(117,'Employer Validate Receipts','EMPLOYER.VALIDATE_RECEIPTS',58,7,1,'2025-10-10 07:46:53','2025-10-10 07:46:53',190,NULL,'default',47),(118,'Employer Send To Board','EMPLOYER.SEND_TO_BOARD',58,8,1,'2025-10-10 07:46:54','2025-10-10 07:46:54',191,NULL,'default',48),(119,'Board Read','BOARD.READ',65,1,1,'2025-10-10 07:48:08','2025-10-10 07:48:08',192,NULL,'default',50),(120,'Board List','BOARD.LIST',65,2,1,'2025-10-10 07:48:08','2025-10-10 07:48:08',193,NULL,'default',49),(121,'Board Approve','BOARD.APPROVE',65,3,1,'2025-10-10 07:48:08','2025-10-10 07:48:08',196,NULL,'default',52),(122,'Board Reject','BOARD.REJECT',65,4,1,'2025-10-10 07:48:08','2025-10-10 07:48:08',196,NULL,'default',53),(123,'Board View Receipts','BOARD.VIEW_RECEIPTS',65,5,1,'2025-10-10 07:48:08','2025-10-10 07:48:08',194,NULL,'default',51),(124,'Board Generate Reports','BOARD.GENERATE_REPORTS',65,6,1,'2025-10-10 07:48:10','2025-10-10 07:48:10',198,NULL,'default',54),(125,'Worker List','WORKER.LIST',8,1,1,'2025-10-10 08:22:39','2025-10-10 08:22:39',201,NULL,'default',24);
/*!40000 ALTER TABLE `page_actions_backup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `policies`
--

DROP TABLE IF EXISTS `policies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `policies` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expression` json NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_name` (`name`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `policies`
--

LOCK TABLES `policies` WRITE;
/*!40000 ALTER TABLE `policies` DISABLE KEYS */;
/*!40000 ALTER TABLE `policies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `policies_backup`
--

DROP TABLE IF EXISTS `policies_backup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `policies_backup` (
  `id` bigint NOT NULL DEFAULT '0',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expression` json NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `policies_backup`
--

LOCK TABLES `policies_backup` WRITE;
/*!40000 ALTER TABLE `policies_backup` DISABLE KEYS */;
INSERT INTO `policies_backup` VALUES (1,'policy.admin.full_access','Admin role has full access to all capabilities','RBAC','{\"roles\": [\"ADMIN\"], \"conditions\": []}',1,'2025-10-09 16:03:36',NULL),(2,'policy.auth.common','All authenticated users can perform basic auth actions','RBAC','{\"roles\": [\"ADMIN\", \"RECONCILIATION_OFFICER\", \"WORKER\", \"EMPLOYER\", \"BOARD\"]}',1,'2025-10-09 16:03:36',NULL),(3,'policy.worker.full','Worker and Reconciliation Officer can manage worker data','RBAC','{\"roles\": [\"WORKER\", \"RECONCILIATION_OFFICER\"]}',1,'2025-10-09 16:03:36',NULL),(4,'policy.payment.full','Reconciliation Officer can manage all payment operations','RBAC','{\"roles\": [\"RECONCILIATION_OFFICER\"]}',1,'2025-10-09 16:03:36',NULL),(5,'policy.employer.full','Employer and Reconciliation Officer can manage employer data','RBAC','{\"roles\": [\"EMPLOYER\", \"RECONCILIATION_OFFICER\"]}',1,'2025-10-09 16:03:36',NULL),(6,'policy.board.full','Board and Reconciliation Officer can manage board operations','RBAC','{\"roles\": [\"BOARD\", \"RECONCILIATION_OFFICER\"]}',1,'2025-10-09 16:03:36',NULL),(7,'policy.reconciliation.full','Reconciliation Officer can perform all reconciliation operations','RBAC','{\"roles\": [\"RECONCILIATION_OFFICER\"]}',1,'2025-10-09 16:03:36',NULL),(8,'policy.dashboard.view','All authenticated users can view dashboard','RBAC','{\"roles\": [\"ADMIN\", \"RECONCILIATION_OFFICER\", \"WORKER\", \"EMPLOYER\", \"BOARD\"]}',1,'2025-10-09 16:03:37',NULL),(9,'policy.admin.user_management','Only Admin can manage users, roles, and permissions','RBAC','{\"roles\": [\"ADMIN\"]}',1,'2025-10-09 16:03:37',NULL),(10,'policy.audit.view','Admin and Reconciliation Officer can view audit logs','RBAC','{\"roles\": [\"ADMIN\", \"RECONCILIATION_OFFICER\"]}',1,'2025-10-09 16:03:37',NULL),(11,'policy.system.admin','Only Admin can perform system operations','RBAC','{\"roles\": [\"ADMIN\"]}',1,'2025-10-09 16:03:37',NULL);
/*!40000 ALTER TABLE `policies_backup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `policy_capabilities`
--

DROP TABLE IF EXISTS `policy_capabilities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `policy_capabilities` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `policy_id` bigint NOT NULL,
  `capability_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_policy_capability` (`policy_id`,`capability_id`),
  KEY `fk_policy_capabilities_capability` (`capability_id`),
  CONSTRAINT `fk_policy_capabilities_capability` FOREIGN KEY (`capability_id`) REFERENCES `capabilities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_policy_capabilities_policy` FOREIGN KEY (`policy_id`) REFERENCES `policies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `policy_capabilities`
--

LOCK TABLES `policy_capabilities` WRITE;
/*!40000 ALTER TABLE `policy_capabilities` DISABLE KEYS */;
/*!40000 ALTER TABLE `policy_capabilities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `policy_capabilities_backup`
--

DROP TABLE IF EXISTS `policy_capabilities_backup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `policy_capabilities_backup` (
  `id` bigint NOT NULL DEFAULT '0',
  `policy_id` bigint NOT NULL,
  `capability_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `policy_capabilities_backup`
--

LOCK TABLES `policy_capabilities_backup` WRITE;
/*!40000 ALTER TABLE `policy_capabilities_backup` DISABLE KEYS */;
INSERT INTO `policy_capabilities_backup` VALUES (4,1,1),(5,1,2),(6,1,3),(7,1,4),(8,1,5),(9,1,6),(54,1,7),(55,1,8),(56,1,9),(57,1,10),(58,1,11),(59,1,12),(44,1,13),(45,1,14),(46,1,15),(47,1,16),(48,1,17),(49,1,18),(35,1,19),(36,1,20),(37,1,21),(38,1,22),(39,1,23),(60,1,24),(61,1,25),(62,1,26),(63,1,27),(64,1,28),(65,1,29),(66,1,30),(67,1,31),(26,1,32),(27,1,33),(28,1,34),(29,1,35),(30,1,36),(31,1,37),(32,1,38),(33,1,39),(34,1,40),(18,1,41),(19,1,42),(20,1,43),(21,1,44),(22,1,45),(23,1,46),(24,1,47),(25,1,48),(10,1,49),(11,1,50),(12,1,51),(13,1,52),(14,1,53),(15,1,54),(40,1,55),(41,1,56),(42,1,57),(43,1,58),(16,1,59),(17,1,60),(1,1,61),(2,1,62),(3,1,63),(50,1,64),(51,1,65),(52,1,66),(53,1,67),(128,2,1),(129,2,2),(130,2,3),(131,2,4),(132,2,5),(133,2,6),(135,3,24),(136,3,25),(137,3,26),(138,3,27),(139,3,28),(140,3,29),(141,3,30),(142,3,31),(150,4,32),(151,4,33),(152,4,34),(153,4,35),(154,4,36),(155,4,37),(156,4,38),(157,4,39),(158,4,40),(165,5,41),(166,5,42),(167,5,43),(168,5,44),(169,5,45),(170,5,46),(171,5,47),(172,5,48),(180,6,49),(181,6,50),(182,6,51),(183,6,52),(184,6,53),(185,6,54),(187,7,55),(188,7,56),(189,7,57),(190,7,58),(194,8,59),(195,8,60),(208,9,7),(209,9,8),(210,9,9),(211,9,10),(212,9,11),(213,9,12),(202,9,13),(203,9,14),(204,9,15),(205,9,16),(206,9,17),(207,9,18),(197,9,19),(198,9,20),(199,9,21),(200,9,22),(201,9,23),(228,10,61),(229,10,62),(230,10,63),(231,11,64),(232,11,65),(233,11,66),(234,11,67);
/*!40000 ALTER TABLE `policy_capabilities_backup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL COMMENT 'Role name, e.g., ADMIN, WORKER',
  `description` varchar(255) DEFAULT NULL COMMENT 'Role description',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Whether this role is active',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='User roles';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'ADMIN','System Administrator with full access','2025-10-12 08:58:29','2025-10-12 08:58:29',1);
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles_backup`
--

DROP TABLE IF EXISTS `roles_backup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles_backup` (
  `id` bigint NOT NULL DEFAULT '0',
  `name` varchar(50) NOT NULL COMMENT 'Role name, e.g., ADMIN, WORKER',
  `description` varchar(255) DEFAULT NULL COMMENT 'Role description',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Whether this role is active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles_backup`
--

LOCK TABLES `roles_backup` WRITE;
/*!40000 ALTER TABLE `roles_backup` DISABLE KEYS */;
INSERT INTO `roles_backup` VALUES (1,'ADMIN','System Administrator with full access','2025-10-09 15:45:44','2025-10-09 15:45:44',1),(2,'RECONCILIATION_OFFICER','Payment Reconciliation Officer','2025-10-09 15:45:44','2025-10-09 15:45:44',1),(3,'WORKER','Worker role with worker-related access','2025-10-09 15:45:44','2025-10-09 15:45:44',1),(4,'EMPLOYER','Employer role with employer-related access','2025-10-09 15:45:44','2025-10-09 15:45:44',1),(5,'BOARD','Board member with approval authority','2025-10-09 15:45:44','2025-10-09 15:45:44',1);
/*!40000 ALTER TABLE `roles_backup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_config`
--

DROP TABLE IF EXISTS `system_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_config` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `config_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `config_value` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `config_type` enum('STRING','INTEGER','DECIMAL','BOOLEAN','JSON') COLLATE utf8mb4_unicode_ci DEFAULT 'STRING',
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_encrypted` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `config_key` (`config_key`),
  KEY `idx_system_config_key` (`config_key`),
  KEY `idx_system_config_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_config`
--

LOCK TABLES `system_config` WRITE;
/*!40000 ALTER TABLE `system_config` DISABLE KEYS */;
INSERT INTO `system_config` VALUES (1,'MAX_FILE_UPLOAD_SIZE_MB','50','INTEGER','Maximum file upload size in MB',0,1,'SYSTEM','2025-10-09 07:27:44',NULL,'2025-10-09 07:27:44'),(2,'MAX_RECORDS_PER_FILE','5000','INTEGER','Maximum records allowed per uploaded file',0,1,'SYSTEM','2025-10-09 07:27:44',NULL,'2025-10-09 07:27:44'),(3,'API_RATE_LIMIT_PER_MINUTE','100','INTEGER','Maximum API requests per minute per user',0,1,'SYSTEM','2025-10-09 07:27:44',NULL,'2025-10-09 07:27:44'),(4,'SESSION_TIMEOUT_HOURS','8','INTEGER','User session timeout in hours',0,1,'SYSTEM','2025-10-09 07:27:44',NULL,'2025-10-09 07:27:44'),(5,'PASSWORD_MIN_LENGTH','8','INTEGER','Minimum password length',0,1,'SYSTEM','2025-10-09 07:27:44',NULL,'2025-10-09 07:27:44'),(6,'MAX_LOGIN_ATTEMPTS','5','INTEGER','Maximum failed login attempts before account lock',0,1,'SYSTEM','2025-10-09 07:27:44',NULL,'2025-10-09 07:27:44'),(7,'ACCOUNT_LOCK_DURATION_MINUTES','30','INTEGER','Account lock duration in minutes after max failed attempts',0,1,'SYSTEM','2025-10-09 07:27:44',NULL,'2025-10-09 07:27:44'),(8,'ENABLE_EMAIL_NOTIFICATIONS','true','BOOLEAN','Enable email notifications for important events',0,1,'SYSTEM','2025-10-09 07:27:44',NULL,'2025-10-09 07:27:44'),(9,'ENABLE_SMS_NOTIFICATIONS','false','BOOLEAN','Enable SMS notifications for important events',0,1,'SYSTEM','2025-10-09 07:27:44',NULL,'2025-10-09 07:27:44'),(10,'MAINTENANCE_MODE','false','BOOLEAN','Enable maintenance mode to block user access',0,1,'SYSTEM','2025-10-09 07:27:44',NULL,'2025-10-09 07:27:44');
/*!40000 ALTER TABLE `system_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ui_pages`
--

DROP TABLE IF EXISTS `ui_pages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ui_pages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `page_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `route` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `module` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_id` bigint DEFAULT NULL,
  `display_order` int NOT NULL DEFAULT '0',
  `is_menu_item` tinyint(1) NOT NULL DEFAULT '1',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `required_capability` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `page_id` (`page_id`),
  KEY `idx_page_id` (`page_id`),
  KEY `idx_module` (`module`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ui_pages`
--

LOCK TABLES `ui_pages` WRITE;
/*!40000 ALTER TABLE `ui_pages` DISABLE KEYS */;
/*!40000 ALTER TABLE `ui_pages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ui_pages_backup`
--

DROP TABLE IF EXISTS `ui_pages_backup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ui_pages_backup` (
  `id` bigint NOT NULL DEFAULT '0',
  `page_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `route` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `module` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_id` bigint DEFAULT NULL,
  `display_order` int NOT NULL DEFAULT '0',
  `is_menu_item` tinyint(1) NOT NULL DEFAULT '1',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `required_capability` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ui_pages_backup`
--

LOCK TABLES `ui_pages_backup` WRITE;
/*!40000 ALTER TABLE `ui_pages_backup` DISABLE KEYS */;
INSERT INTO `ui_pages_backup` VALUES (1,'DASHBOARD','Dashboard','/dashboard','dashboard','DASHBOARD',NULL,1,1,1,NULL,'2025-10-09 15:36:48',NULL),(2,'WORKER','Workers','/workers','people','WORKER',NULL,2,1,1,NULL,'2025-10-09 15:36:48',NULL),(3,'PAYMENT','Payments','/payments','payments','PAYMENT',NULL,3,1,1,NULL,'2025-10-09 15:36:48',NULL),(4,'EMPLOYER','Employers','/employers','business','EMPLOYER',NULL,4,1,1,NULL,'2025-10-09 15:36:48',NULL),(5,'BOARD','Board','/board','approval','BOARD',NULL,5,1,1,NULL,'2025-10-09 15:36:48',NULL),(6,'RECONCILIATION','Reconciliation','/reconciliation','sync','RECONCILIATION',NULL,6,1,1,NULL,'2025-10-09 15:36:48',NULL),(7,'ADMIN','Administration','/admin','settings','SYSTEM',NULL,7,1,1,NULL,'2025-10-09 15:36:48',NULL),(8,'WORKER_LIST','Worker List','/workers/list','list','WORKER',2,1,1,1,NULL,'2025-10-09 15:36:48',NULL),(9,'WORKER_UPLOAD','Upload Workers','/workers/upload','upload','WORKER',2,2,1,1,NULL,'2025-10-09 15:36:48',NULL),(10,'WORKER_VALIDATE','Validate Data','/workers/validate','check','WORKER',2,3,1,1,NULL,'2025-10-09 15:36:48',NULL),(11,'PAYMENT_LIST','Payment List','/payments/list','list','PAYMENT',3,1,1,1,NULL,'2025-10-09 15:36:48',NULL),(12,'PAYMENT_PROCESS','Process Payments','/payments/process','process','PAYMENT',3,2,1,1,NULL,'2025-10-09 15:36:48',NULL),(13,'PAYMENT_REPORTS','Payment Reports','/payments/reports','report','PAYMENT',3,3,1,1,NULL,'2025-10-09 15:36:48',NULL),(14,'ADMIN_USERS','User Management','/admin/users','people','USER_MANAGEMENT',7,1,1,1,NULL,'2025-10-09 15:36:48',NULL),(15,'ADMIN_ROLES','Role Management','/admin/roles','shield','ROLE_MANAGEMENT',7,2,1,1,NULL,'2025-10-09 15:36:48',NULL),(16,'ADMIN_AUDIT','Audit Logs','/admin/audit','history','AUDIT',7,3,1,1,NULL,'2025-10-09 15:36:48',NULL),(17,'ADMIN_SYSTEM','System Settings','/admin/system','settings','SYSTEM',7,4,1,1,NULL,'2025-10-09 15:36:48',NULL),(54,'WORKERS','Workers','/workers','people','WORKER',NULL,2,1,1,NULL,'2025-10-10 07:00:34',NULL),(56,'PAYMENTS','Payments','/payments','payments','PAYMENT',NULL,3,1,1,NULL,'2025-10-10 07:00:34',NULL),(58,'EMPLOYER_LIST','Employer List','/employers/list','list','EMPLOYER',4,1,1,1,NULL,'2025-10-10 07:01:26','2025-10-10 07:31:26'),(65,'','Board Receipts','/board-receipts','receipt','board',5,1,1,1,NULL,'2025-10-10 07:14:26',NULL);
/*!40000 ALTER TABLE `ui_pages_backup` ENABLE KEYS */;
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
  `created_at` timestamp NOT NULL,
  `uploaded_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_records` int NOT NULL DEFAULT '0',
  `success_count` int NOT NULL DEFAULT '0',
  `failure_count` int NOT NULL DEFAULT '0',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_reference_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `file_reference_number` (`file_reference_number`),
  KEY `idx_fileType` (`file_type`),
  KEY `idx_uploadDate` (`created_at`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `uploaded_files`
--

LOCK TABLES `uploaded_files` WRITE;
/*!40000 ALTER TABLE `uploaded_files` DISABLE KEYS */;
INSERT INTO `uploaded_files` VALUES (2,'Valid_Sample_Upload1.csv','/Users/rahulcharvekar/Documents/Repos/ManpowerManagement/PaymentReconciliation/uploads/dev/workerpayments/a64b535a-def7-4db3-b852-02f56b29983b_Valid_Sample_Upload1.csv','82e48550f89dd4fdcaf323e714ae6beb6fa49426ce33711ec05ec660168a7f2d','workerpayments','2025-10-11 10:03:48',NULL,5,0,5,'COMPLETED','REQ-20251011-153348-283'),(3,'valid_worker_uploaded_data.csv','/Users/rahulcharvekar/Documents/Repos/ManpowerManagement/PaymentReconciliation/uploads/dev/workerpayments/20de390c-587a-4cd7-8ee6-d037b72651e4_valid_worker_uploaded_data.csv','dee3ef9b8473a77e1b9cd324ca7ca7f7e6f5d12faee5f611ca5eff0530866520','workerpayments','2025-10-11 14:14:27',NULL,0,0,0,'COMPLETED','REQ-20251011-194426-500'),(4,'valid_worker_uploaded_data1.csv','/Users/rahulcharvekar/Documents/Repos/ManpowerManagement/PaymentReconciliation/uploads/dev/workerpayments/ca3a2932-ccfb-4cd9-bd87-c734ce2665aa_valid_worker_uploaded_data1.csv','83031031b12bac4afbc3f94f14b6e2e717d076c242fc47cf56d8305f11e1f59f','workerpayments','2025-10-11 14:18:23',NULL,20,20,0,'COMPLETED','REQ-20251011-194823-483');
/*!40000 ALTER TABLE `uploaded_files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `role_id` bigint NOT NULL,
  `assigned_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_role` (`user_id`,`role_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (1,1,1,'2025-10-12 08:58:29');
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles_backup`
--

DROP TABLE IF EXISTS `user_roles_backup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles_backup` (
  `id` bigint NOT NULL DEFAULT '0',
  `user_id` bigint NOT NULL,
  `role_id` bigint NOT NULL,
  `assigned_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles_backup`
--

LOCK TABLES `user_roles_backup` WRITE;
/*!40000 ALTER TABLE `user_roles_backup` DISABLE KEYS */;
INSERT INTO `user_roles_backup` VALUES (1,1,1,'2025-10-10 09:07:54');
/*!40000 ALTER TABLE `user_roles_backup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_sessions`
--

DROP TABLE IF EXISTS `user_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_sessions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `session_id` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_type` enum('WORKER','EMPLOYER','BOARD','ADMIN') COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_accessed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` datetime NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `session_id` (`session_id`),
  KEY `idx_user_sessions_user` (`user_id`,`user_type`),
  KEY `idx_user_sessions_session` (`session_id`),
  KEY `idx_user_sessions_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_sessions`
--

LOCK TABLES `user_sessions` WRITE;
/*!40000 ALTER TABLE `user_sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_sessions` ENABLE KEYS */;
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
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'WORKER',
  `is_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `is_account_non_expired` tinyint(1) NOT NULL DEFAULT '1',
  `is_account_non_locked` tinyint(1) NOT NULL DEFAULT '1',
  `is_credentials_non_expired` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `last_login` timestamp NULL DEFAULT NULL,
  `permission_version` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_username` (`username`),
  KEY `idx_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','admin@example.com','$2b$10$ZuNPpWnsWE/DVaHFzPGnHuh0ANT7.ZlT8YeSCnY3W8pInAOKk/vwu','System Administrator','ADMIN',1,1,1,1,'2025-10-09 15:23:20','2025-10-12 06:54:40','2025-10-12 06:54:40',1);
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
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `worker_master`
--

LOCK TABLES `worker_master` WRITE;
/*!40000 ALTER TABLE `worker_master` DISABLE KEYS */;
INSERT INTO `worker_master` VALUES (1,'WRK001','MH001WRK001','REG001MH2024','Rajesh Kumar Sharma','Ram Kumar Sharma','1985-03-15','Male','123456789012','ABCPK1234A','1234567890123456','State Bank of India','SBIN0001234','9876543210','rajesh.sharma@email.com','123, Shivaji Nagar, Mumbai - 400001','Sunita Sharma','9876543211','ACTIVE','2025-10-09 15:23:20','2025-10-09 15:23:20'),(2,'WRK002','MH002WRK002','REG002MH2024','Suresh Patil','Ganesh Patil','1990-07-22','Male','234567890123','DEFPK5678B','2345678901234567','HDFC Bank','HDFC0001234','9876543212','suresh.patil@email.com','456, Andheri East, Mumbai - 400069','Manjula Patil','9876543213','ACTIVE','2025-10-09 15:23:20','2025-10-09 15:23:20'),(3,'WRK003','KA001WRK003','REG003KA2024','Priya Devi','Ramesh Devi','1988-11-10','Female','345678901234','GHIPK9012C','3456789012345678','ICICI Bank','ICIC0001234','9876543214','priya.devi@email.com','789, Koramangala, Bangalore - 560034','Lakshmi Devi','9876543215','ACTIVE','2025-10-09 15:23:20','2025-10-09 15:23:20'),(4,'WRK004','TN001WRK004','REG004TN2024','Murugan Rajan','Rajendran Murugan','1992-04-18','Male','456789012345','JKLPK3456D','4567890123456789','Canara Bank','CNRB0001234','9876543216','murugan.rajan@email.com','321, T Nagar, Chennai - 600017','Meena Murugan','9876543217','ACTIVE','2025-10-09 15:23:20','2025-10-09 15:23:20'),(5,'WRK005','GJ001WRK005','REG005GJ2024','Jayesh Patel','Ramesh Patel','1987-09-25','Male','567890123456','MNOPK7890E','5678901234567890','Bank of Baroda','BARB0001234','9876543218','jayesh.patel@email.com','654, Satellite, Ahmedabad - 380015','Nita Patel','9876543219','ACTIVE','2025-10-09 15:23:20','2025-10-09 15:23:20'),(6,'WRK006','UP001WRK006','REG006UP2024','Arun Verma','Rajesh Verma','1991-02-14','Male','678901234567','PQRPK1234F','6789012345678901','Punjab National Bank','PUNB0001234','9876543220','arun.verma@email.com','987, Gomti Nagar, Lucknow - 226010','Seema Verma','9876543221','ACTIVE','2025-10-09 15:23:20','2025-10-09 15:23:20'),(7,'WRK007','MH003WRK007','REG007MH2024','Santosh Kamble','Baburao Kamble','1989-06-30','Male','789012345678','STUVK5678G','7890123456789012','Union Bank of India','UBIN0001234','9876543222','santosh.kamble@email.com','135, Parel, Mumbai - 400012','Vaishali Kamble','9876543223','ACTIVE','2025-10-09 15:23:20','2025-10-09 15:23:20'),(8,'WRK008','KA002WRK008','REG008KA2024','Lakshmi Naidu','Krishna Naidu','1993-12-05','Female','890123456789','WXYPK9012H','8901234567890123','Axis Bank','UTIB0001234','9876543224','lakshmi.naidu@email.com','246, Whitefield, Bangalore - 560066','Ravi Naidu','9876543225','ACTIVE','2025-10-09 15:23:20','2025-10-09 15:23:20'),(9,'WRK009','TN002WRK009','REG009TN2024','Senthil Kumar','Venkatesh Kumar','1986-08-12','Male','901234567890','ZABPK3456I','9012345678901234','Indian Overseas Bank','IOBA0001234','9876543226','senthil.kumar@email.com','357, Adyar, Chennai - 600020','Kavitha Senthil','9876543227','ACTIVE','2025-10-09 15:23:20','2025-10-09 15:23:20'),(10,'WRK010','GJ002WRK010','REG010GJ2024','Nita Desai','Mahesh Desai','1994-01-20','Female','012345678901','BCDPK7890J','0123456789012345','Yes Bank','YESB0001234','9876543228','nita.desai@email.com','468, CG Road, Ahmedabad - 380009','Kiran Desai','9876543229','ACTIVE','2025-10-09 15:23:20','2025-10-09 15:23:20');
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
  `created_at` timestamp NOT NULL,
  `total_records` int NOT NULL,
  `total_amount` decimal(15,2) NOT NULL,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `receipt_number` (`receipt_number`),
  KEY `idx_receipt_number` (`receipt_number`),
  KEY `idx_employer_id` (`employer_id`),
  KEY `idx_toli_id` (`toli_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `worker_payment_receipts`
--

LOCK TABLES `worker_payment_receipts` WRITE;
/*!40000 ALTER TABLE `worker_payment_receipts` DISABLE KEYS */;
INSERT INTO `worker_payment_receipts` VALUES (1,'RCP-20251011-221244-522','EMP123','TOLI456','2025-10-11 16:42:44',20,4365.00,'VALIDATED');
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
  `uploaded_file_ref` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `request_reference_number` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'UPLOADED',
  `receipt_number` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_worker_reference` (`worker_reference`),
  KEY `idx_registration_id` (`registration_id`),
  KEY `idx_employer_id` (`employer_id`),
  KEY `idx_toli_id` (`toli_id`),
  KEY `idx_status` (`status`),
  KEY `idx_receipt_number` (`receipt_number`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `worker_payments`
--

LOCK TABLES `worker_payments` WRITE;
/*!40000 ALTER TABLE `worker_payments` DISABLE KEYS */;
INSERT INTO `worker_payments` VALUES (1,'W001','W001','John Doe','EMP123','TOLI456','HR','','','1234567890',200.00,'4',NULL,'WRK-BAAF5EC5E92B','VALIDATED','RCP-20251011-221244-522','2025-10-11 16:42:44'),(2,'W002','W002','Jane Smith','EMP124','TOLI457','Finance','','','2345678901',225.00,'4',NULL,'WRK-62431B7D481E','VALIDATED','RCP-20251011-221244-522','2025-10-11 16:42:44'),(3,'W003','W003','Bob Lee','EMP125','TOLI458','IT','','','3456789012',224.00,'4',NULL,'WRK-CB8ECD568EF1','VALIDATED','RCP-20251011-221244-522','2025-10-11 16:42:44'),(4,'W004','W004','Alice Kim','EMP126','TOLI459','Marketing','','','4567890123',210.00,'4',NULL,'WRK-967E2B51EF17','VALIDATED','RCP-20251011-221244-522','2025-10-11 16:42:44'),(5,'W005','W005','Tom Brown','EMP127','TOLI460','Operations','','','5678901234',256.00,'4',NULL,'WRK-86D156B279AF','VALIDATED','RCP-20251011-221244-522','2025-10-11 16:42:44'),(6,'W006','W006','Lisa White','EMP128','TOLI461','Legal','','','6789012345',280.00,'4',NULL,'WRK-EBB073D169E4','VALIDATED','RCP-20251011-221244-522','2025-10-11 16:42:44'),(7,'W007','W007','Mark Green','EMP129','TOLI462','Research','','','7890123456',304.00,'4',NULL,'WRK-025E36ED9117','VALIDATED','RCP-20251011-221244-522','2025-10-11 16:42:44'),(8,'W008','W008','Nina Black','EMP130','TOLI463','Admin','','','8901234567',143.00,'4',NULL,'WRK-B1F7C4D837F6','VALIDATED','RCP-20251011-221244-522','2025-10-11 16:42:44'),(9,'W009','W009','Sam Blue','EMP131','TOLI464','Editorial','','','9012345678',216.00,'4',NULL,'WRK-0D62713CD7E7','VALIDATED','RCP-20251011-221244-522','2025-10-11 16:42:44'),(10,'W010','W010','Olga Red','EMP132','TOLI465','Logistics','','','1234509876',168.00,'4',NULL,'WRK-542BB997F2B1','VALIDATED','RCP-20251011-221244-522','2025-10-11 16:42:44'),(11,'W011','W011','Paul Gray','EMP133','TOLI466','Production','','','2345610987',208.00,'4',NULL,'WRK-DB5F464D4377','VALIDATED','RCP-20251011-221244-522','2025-10-11 16:42:44'),(12,'W012','W012','Emma Violet','EMP134','TOLI467','Design','','','3456721098',217.50,'4',NULL,'WRK-C50AE38AEDB7','VALIDATED','RCP-20251011-221244-522','2025-10-11 16:42:44'),(13,'W013','W013','Leo Orange','EMP135','TOLI468','Security','','','4567832109',184.00,'4',NULL,'WRK-5A8637B991D7','VALIDATED','RCP-20251011-221244-522','2025-10-11 16:42:44'),(14,'W014','W014','Mia Indigo','EMP136','TOLI469','Sales','','','5678943210',126.00,'4',NULL,'WRK-4267306F4782','VALIDATED','RCP-20251011-221244-522','2025-10-11 16:42:44'),(15,'W015','W015','Noah Pink','EMP137','TOLI470','Support','','','6789054321',217.00,'4',NULL,'WRK-88D60C532CED','VALIDATED','RCP-20251011-221244-522','2025-10-11 16:42:44'),(16,'W016','W016','Ava Gold','EMP138','TOLI471','QA','','','7890165432',272.00,'4',NULL,'WRK-A968C116F83F','VALIDATED','RCP-20251011-221244-522','2025-10-11 16:42:44'),(17,'W017','W017','Jack Silver','EMP139','TOLI472','Development','','','8901276543',270.00,'4',NULL,'WRK-411DF067CE51','VALIDATED','RCP-20251011-221244-522','2025-10-11 16:42:44'),(18,'W018','W018','Sophia Bronze','EMP140','TOLI473','HR','','','9012387654',264.00,'4',NULL,'WRK-28F403761430','VALIDATED','RCP-20251011-221244-522','2025-10-11 16:42:44'),(19,'W019','W019','Henry Copper','EMP141','TOLI474','Finance','','','1234890765',240.50,'4',NULL,'WRK-0B2EAC2AF134','VALIDATED','RCP-20251011-221244-522','2025-10-11 16:42:44'),(20,'W020','W020','Grace Jade','EMP142','TOLI475','Admin','','','2345901876',140.00,'4',NULL,'WRK-682FD41D7AB7','VALIDATED','RCP-20251011-221244-522','2025-10-11 16:42:44'),(21,'W011','W011','Paul Gray','EMP133','TOLI466','Production','','','2345610987',208.00,'4',NULL,'WRK-DB5F464D4377','PAYMENT_INITIATED','RCP-20251011-221244-522','2025-10-11 16:42:44'),(22,'W020','W020','Grace Jade','EMP142','TOLI475','Admin','','','2345901876',140.00,'4',NULL,'WRK-682FD41D7AB7','PAYMENT_INITIATED','RCP-20251011-221244-522','2025-10-11 16:42:44'),(23,'W019','W019','Henry Copper','EMP141','TOLI474','Finance','','','1234890765',240.50,'4',NULL,'WRK-0B2EAC2AF134','PAYMENT_INITIATED','RCP-20251011-221244-522','2025-10-11 16:42:44'),(24,'W018','W018','Sophia Bronze','EMP140','TOLI473','HR','','','9012387654',264.00,'4',NULL,'WRK-28F403761430','PAYMENT_INITIATED','RCP-20251011-221244-522','2025-10-11 16:42:44'),(25,'W017','W017','Jack Silver','EMP139','TOLI472','Development','','','8901276543',270.00,'4',NULL,'WRK-411DF067CE51','PAYMENT_INITIATED','RCP-20251011-221244-522','2025-10-11 16:42:44'),(26,'W016','W016','Ava Gold','EMP138','TOLI471','QA','','','7890165432',272.00,'4',NULL,'WRK-A968C116F83F','PAYMENT_INITIATED','RCP-20251011-221244-522','2025-10-11 16:42:44'),(27,'W015','W015','Noah Pink','EMP137','TOLI470','Support','','','6789054321',217.00,'4',NULL,'WRK-88D60C532CED','PAYMENT_INITIATED','RCP-20251011-221244-522','2025-10-11 16:42:44'),(28,'W014','W014','Mia Indigo','EMP136','TOLI469','Sales','','','5678943210',126.00,'4',NULL,'WRK-4267306F4782','PAYMENT_INITIATED','RCP-20251011-221244-522','2025-10-11 16:42:44'),(29,'W013','W013','Leo Orange','EMP135','TOLI468','Security','','','4567832109',184.00,'4',NULL,'WRK-5A8637B991D7','PAYMENT_INITIATED','RCP-20251011-221244-522','2025-10-11 16:42:44'),(30,'W012','W012','Emma Violet','EMP134','TOLI467','Design','','','3456721098',217.50,'4',NULL,'WRK-C50AE38AEDB7','PAYMENT_INITIATED','RCP-20251011-221244-522','2025-10-11 16:42:44'),(31,'W001','W001','John Doe','EMP123','TOLI456','HR','','','1234567890',200.00,'4',NULL,'WRK-BAAF5EC5E92B','PAYMENT_INITIATED','RCP-20251011-221244-522','2025-10-11 16:42:44'),(32,'W010','W010','Olga Red','EMP132','TOLI465','Logistics','','','1234509876',168.00,'4',NULL,'WRK-542BB997F2B1','PAYMENT_INITIATED','RCP-20251011-221244-522','2025-10-11 16:42:44'),(33,'W009','W009','Sam Blue','EMP131','TOLI464','Editorial','','','9012345678',216.00,'4',NULL,'WRK-0D62713CD7E7','PAYMENT_INITIATED','RCP-20251011-221244-522','2025-10-11 16:42:44'),(34,'W008','W008','Nina Black','EMP130','TOLI463','Admin','','','8901234567',143.00,'4',NULL,'WRK-B1F7C4D837F6','PAYMENT_INITIATED','RCP-20251011-221244-522','2025-10-11 16:42:44'),(35,'W007','W007','Mark Green','EMP129','TOLI462','Research','','','7890123456',304.00,'4',NULL,'WRK-025E36ED9117','PAYMENT_INITIATED','RCP-20251011-221244-522','2025-10-11 16:42:44'),(36,'W006','W006','Lisa White','EMP128','TOLI461','Legal','','','6789012345',280.00,'4',NULL,'WRK-EBB073D169E4','PAYMENT_INITIATED','RCP-20251011-221244-522','2025-10-11 16:42:44'),(37,'W005','W005','Tom Brown','EMP127','TOLI460','Operations','','','5678901234',256.00,'4',NULL,'WRK-86D156B279AF','PAYMENT_INITIATED','RCP-20251011-221244-522','2025-10-11 16:42:44'),(38,'W004','W004','Alice Kim','EMP126','TOLI459','Marketing','','','4567890123',210.00,'4',NULL,'WRK-967E2B51EF17','PAYMENT_INITIATED','RCP-20251011-221244-522','2025-10-11 16:42:44'),(39,'W003','W003','Bob Lee','EMP125','TOLI458','IT','','','3456789012',224.00,'4',NULL,'WRK-CB8ECD568EF1','PAYMENT_INITIATED','RCP-20251011-221244-522','2025-10-11 16:42:44'),(40,'W002','W002','Jane Smith','EMP124','TOLI457','Finance','','','2345678901',225.00,'4',NULL,'WRK-62431B7D481E','PAYMENT_INITIATED','RCP-20251011-221244-522','2025-10-11 16:42:44');
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
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rejection_reason` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL,
  `validated_at` timestamp NULL DEFAULT NULL,
  `processed_at` timestamp NULL DEFAULT NULL,
  `receipt_number` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_file_id` (`file_id`),
  KEY `idx_employer_id` (`employer_id`),
  KEY `idx_toli_id` (`toli_id`),
  KEY `idx_status` (`status`),
  KEY `idx_receipt_number` (`receipt_number`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `worker_uploaded_data`
--

LOCK TABLES `worker_uploaded_data` WRITE;
/*!40000 ALTER TABLE `worker_uploaded_data` DISABLE KEYS */;
INSERT INTO `worker_uploaded_data` VALUES (1,'2',1,NULL,NULL,'DEFAULT_EMPLOYER','DEFAULT_TOLI',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'REJECTED','Worker ID is required. Worker name is required. Valid payment amount greater than 0 is required. Bank account is required. Work date is required.','2025-10-11 10:03:48',NULL,NULL,NULL),(2,'2',2,NULL,NULL,'DEFAULT_EMPLOYER','DEFAULT_TOLI',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'REJECTED','Worker ID is required. Worker name is required. Valid payment amount greater than 0 is required. Bank account is required. Work date is required.','2025-10-11 10:03:48',NULL,NULL,NULL),(3,'2',3,NULL,NULL,'DEFAULT_EMPLOYER','DEFAULT_TOLI',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'REJECTED','Worker ID is required. Worker name is required. Valid payment amount greater than 0 is required. Bank account is required. Work date is required.','2025-10-11 10:03:48',NULL,NULL,NULL),(4,'2',4,NULL,NULL,'DEFAULT_EMPLOYER','DEFAULT_TOLI',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'REJECTED','Worker ID is required. Worker name is required. Valid payment amount greater than 0 is required. Bank account is required. Work date is required.','2025-10-11 10:03:48',NULL,NULL,NULL),(5,'2',5,NULL,NULL,'DEFAULT_EMPLOYER','DEFAULT_TOLI',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'REJECTED','Worker ID is required. Worker name is required. Valid payment amount greater than 0 is required. Bank account is required. Work date is required.','2025-10-11 10:03:48',NULL,NULL,NULL),(6,'4',1,'W001','John Doe','EMP123','TOLI456','Acme Corp','HR','Manager','2025-10-10',8.00,25.00,200.00,'1234567890','9876543210','john.doe@example.com','123 Main St, City','REQUEST_GENERATED',NULL,'2025-10-11 14:18:23','2025-10-11 16:42:30','2025-10-11 16:42:44','RCP-20251011-221244-522'),(7,'4',2,'W002','Jane Smith','EMP124','TOLI457','Globex Inc','Finance','Analyst','2025-10-09',7.50,30.00,225.00,'2345678901','8765432109','jane.smith@example.com','456 Elm St, City','REQUEST_GENERATED',NULL,'2025-10-11 14:18:23','2025-10-11 16:42:30','2025-10-11 16:42:44','RCP-20251011-221244-522'),(8,'4',3,'W003','Bob Lee','EMP125','TOLI458','Initech','IT','Developer','2025-10-08',8.00,28.00,224.00,'3456789012','7654321098','bob.lee@example.com','789 Oak St, City','REQUEST_GENERATED',NULL,'2025-10-11 14:18:23','2025-10-11 16:42:30','2025-10-11 16:42:44','RCP-20251011-221244-522'),(9,'4',4,'W004','Alice Kim','EMP126','TOLI459','Initrode','Marketing','Executive','2025-10-07',6.00,35.00,210.00,'4567890123','6543210987','alice.kim@example.com','321 Pine St, City','REQUEST_GENERATED',NULL,'2025-10-11 14:18:23','2025-10-11 16:42:30','2025-10-11 16:42:44','RCP-20251011-221244-522'),(10,'4',5,'W005','Tom Brown','EMP127','TOLI460','Stark Industries','Operations','Supervisor','2025-10-06',8.00,32.00,256.00,'5678901234','5432109876','tom.brown@example.com','654 Cedar St, City','REQUEST_GENERATED',NULL,'2025-10-11 14:18:23','2025-10-11 16:42:30','2025-10-11 16:42:44','RCP-20251011-221244-522'),(11,'4',6,'W006','Lisa White','EMP128','TOLI461','Wayne Enterprises','Legal','Advisor','2025-10-05',7.00,40.00,280.00,'6789012345','4321098765','lisa.white@example.com','987 Birch St, City','REQUEST_GENERATED',NULL,'2025-10-11 14:18:23','2025-10-11 16:42:30','2025-10-11 16:42:44','RCP-20251011-221244-522'),(12,'4',7,'W007','Mark Green','EMP129','TOLI462','Oscorp','Research','Scientist','2025-10-04',8.00,38.00,304.00,'7890123456','3210987654','mark.green@example.com','159 Spruce St, City','REQUEST_GENERATED',NULL,'2025-10-11 14:18:23','2025-10-11 16:42:30','2025-10-11 16:42:44','RCP-20251011-221244-522'),(13,'4',8,'W008','Nina Black','EMP130','TOLI463','LexCorp','Admin','Assistant','2025-10-03',6.50,22.00,143.00,'8901234567','2109876543','nina.black@example.com','753 Willow St, City','REQUEST_GENERATED',NULL,'2025-10-11 14:18:23','2025-10-11 16:42:30','2025-10-11 16:42:44','RCP-20251011-221244-522'),(14,'4',9,'W009','Sam Blue','EMP131','TOLI464','Daily Planet','Editorial','Reporter','2025-10-02',8.00,27.00,216.00,'9012345678','1098765432','sam.blue@example.com','357 Maple St, City','REQUEST_GENERATED',NULL,'2025-10-11 14:18:23','2025-10-11 16:42:30','2025-10-11 16:42:44','RCP-20251011-221244-522'),(15,'4',10,'W010','Olga Red','EMP132','TOLI465','Planet Express','Logistics','Driver','2025-10-01',7.00,24.00,168.00,'1234509876','1987654321','olga.red@example.com','951 Aspen St, City','REQUEST_GENERATED',NULL,'2025-10-11 14:18:23','2025-10-11 16:42:30','2025-10-11 16:42:44','RCP-20251011-221244-522'),(16,'4',11,'W011','Paul Gray','EMP133','TOLI466','Wonka Industries','Production','Operator','2025-09-30',8.00,26.00,208.00,'2345610987','2876543210','paul.gray@example.com','852 Poplar St, City','REQUEST_GENERATED',NULL,'2025-10-11 14:18:23','2025-10-11 16:42:30','2025-10-11 16:42:44','RCP-20251011-221244-522'),(17,'4',12,'W012','Emma Violet','EMP134','TOLI467','Tyrell Corp','Design','Engineer','2025-09-29',7.50,29.00,217.50,'3456721098','3765432109','emma.violet@example.com','753 Chestnut St, City','REQUEST_GENERATED',NULL,'2025-10-11 14:18:23','2025-10-11 16:42:30','2025-10-11 16:42:44','RCP-20251011-221244-522'),(18,'4',13,'W013','Leo Orange','EMP135','TOLI468','Black Mesa','Security','Guard','2025-09-28',8.00,23.00,184.00,'4567832109','4654321098','leo.orange@example.com','159 Redwood St, City','REQUEST_GENERATED',NULL,'2025-10-11 14:18:23','2025-10-11 16:42:30','2025-10-11 16:42:44','RCP-20251011-221244-522'),(19,'4',14,'W014','Mia Indigo','EMP136','TOLI469','Blue Sun','Sales','Associate','2025-09-27',6.00,21.00,126.00,'5678943210','5543210987','mia.indigo@example.com','357 Sequoia St, City','REQUEST_GENERATED',NULL,'2025-10-11 14:18:23','2025-10-11 16:42:30','2025-10-11 16:42:44','RCP-20251011-221244-522'),(20,'4',15,'W015','Noah Pink','EMP137','TOLI470','Massive Dynamic','Support','Technician','2025-09-26',7.00,31.00,217.00,'6789054321','6432109876','noah.pink@example.com','951 Magnolia St, City','REQUEST_GENERATED',NULL,'2025-10-11 14:18:23','2025-10-11 16:42:30','2025-10-11 16:42:44','RCP-20251011-221244-522'),(21,'4',16,'W016','Ava Gold','EMP138','TOLI471','Monarch Solutions','QA','Tester','2025-09-25',8.00,34.00,272.00,'7890165432','7321098765','ava.gold@example.com','654 Palm St, City','REQUEST_GENERATED',NULL,'2025-10-11 14:18:23','2025-10-11 16:42:30','2025-10-11 16:42:44','RCP-20251011-221244-522'),(22,'4',17,'W017','Jack Silver','EMP139','TOLI472','Abstergo','Development','Lead','2025-09-24',7.50,36.00,270.00,'8901276543','8210987654','jack.silver@example.com','456 Cypress St, City','REQUEST_GENERATED',NULL,'2025-10-11 14:18:23','2025-10-11 16:42:30','2025-10-11 16:42:44','RCP-20251011-221244-522'),(23,'4',18,'W018','Sophia Bronze','EMP140','TOLI473','Shinra','HR','Recruiter','2025-09-23',8.00,33.00,264.00,'9012387654','9109876543','sophia.bronze@example.com','321 Alder St, City','REQUEST_GENERATED',NULL,'2025-10-11 14:18:23','2025-10-11 16:42:30','2025-10-11 16:42:44','RCP-20251011-221244-522'),(24,'4',19,'W019','Henry Copper','EMP141','TOLI474','Tricorp','Finance','Accountant','2025-09-22',6.50,37.00,240.50,'1234890765','1098765432','henry.copper@example.com','753 Fir St, City','REQUEST_GENERATED',NULL,'2025-10-11 14:18:23','2025-10-11 16:42:30','2025-10-11 16:42:44','RCP-20251011-221244-522'),(25,'4',20,'W020','Grace Jade','EMP142','TOLI475','Future Tech','Admin','Clerk','2025-09-21',7.00,20.00,140.00,'2345901876','2987654321','grace.jade@example.com','852 Walnut St, City','REQUEST_GENERATED',NULL,'2025-10-11 14:18:23','2025-10-11 16:42:30','2025-10-11 16:42:44','RCP-20251011-221244-522');
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

-- Dump completed on 2025-10-12  8:59:23
