-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: cpsc4910-f25.cobd8enwsupz.us-east-1.rds.amazonaws.com    Database: Team04_DB
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '';

--
-- Table structure for table `About`
--

DROP TABLE IF EXISTS `About`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `About` (
  `abt_id` int NOT NULL AUTO_INCREMENT,
  `abt_teamnumber` varchar(64) DEFAULT NULL,
  `abt_version` varchar(64) NOT NULL,
  `abt_releasedate` datetime DEFAULT NULL,
  `abt_productname` varchar(64) DEFAULT NULL,
  `abt_productdesc` varchar(256) DEFAULT NULL,
  PRIMARY KEY (`abt_id`,`abt_version`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='"abt_" prefix, stores the About data for different versions of the system such as version number, date released etc.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Applications`
--

DROP TABLE IF EXISTS `Applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Applications` (
  `app_id` int NOT NULL AUTO_INCREMENT,
  `app_driver` int NOT NULL,
  `app_org` int NOT NULL,
  `app_sponsor` int DEFAULT '0',
  `app_status` varchar(45) DEFAULT NULL,
  `app_note` varchar(256) DEFAULT NULL,
  `app_datecreated` datetime DEFAULT NULL,
  `app_dateupdated` datetime DEFAULT NULL,
  `app_isdeleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`app_id`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='"app_" prefix, used for application/decision audit logs';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Catalog_Rules`
--

DROP TABLE IF EXISTS `Catalog_Rules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Catalog_Rules` (
  `cat_id` int NOT NULL AUTO_INCREMENT,
  `cat_org` int NOT NULL,
  `cat_type` varchar(45) NOT NULL,
  `cat_value` varchar(256) NOT NULL,
  `cat_isdeleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`cat_id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='"cat_" prefix, all fields for orgs'' for catalog rules';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Notifications`
--

DROP TABLE IF EXISTS `Notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Notifications` (
  `not_id` int NOT NULL AUTO_INCREMENT,
  `not_message` varchar(45) DEFAULT NULL,
  `not_userid` int DEFAULT NULL,
  `not_date` varchar(45) DEFAULT NULL,
  `not_isread` int DEFAULT NULL,
  `not_subject` varchar(45) DEFAULT NULL,
  `not_isdeleted` int DEFAULT NULL,
  PRIMARY KEY (`not_id`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Order_Items`
--

DROP TABLE IF EXISTS `Order_Items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Order_Items` (
  `itm_id` int NOT NULL AUTO_INCREMENT,
  `itm_orderid` int DEFAULT NULL,
  `itm_pointcost` int DEFAULT NULL,
  `itm_usdcost` decimal(15,2) DEFAULT NULL,
  `itm_productid` int DEFAULT NULL,
  `itm_name` varchar(256) DEFAULT NULL,
  `itm_desc` varchar(2084) DEFAULT NULL,
  `itm_image` text,
  `itm_isdeleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`itm_id`)
) ENGINE=InnoDB AUTO_INCREMENT=99 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='"itm_" prefix, stores items linked to orders. Prices, names, descs, etc. are snapshots that stay the s';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Orders`
--

DROP TABLE IF EXISTS `Orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Orders` (
  `ord_id` int NOT NULL AUTO_INCREMENT,
  `ord_userid` int DEFAULT NULL,
  `ord_orgid` int DEFAULT NULL,
  `ord_placedby` int DEFAULT NULL,
  `ord_status` varchar(45) DEFAULT NULL,
  `ord_confirmeddate` datetime DEFAULT NULL,
  `ord_fulfilleddate` datetime DEFAULT NULL,
  `ord_cancelleddate` datetime DEFAULT NULL,
  `ord_totalusd` decimal(15,2) DEFAULT NULL,
  `ord_totalpoints` int DEFAULT NULL,
  `ord_isdeleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`ord_id`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='"ord_" prefix, for storing full orders data. Items are separate';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Organizations`
--

DROP TABLE IF EXISTS `Organizations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Organizations` (
  `org_id` int NOT NULL AUTO_INCREMENT,
  `org_name` varchar(128) DEFAULT NULL,
  `org_conversionrate` decimal(10,4) DEFAULT '0.0100',
  `org_isdeleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`org_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='"org_" prefix';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Point_Rules`
--

DROP TABLE IF EXISTS `Point_Rules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Point_Rules` (
  `rul_id` int NOT NULL AUTO_INCREMENT,
  `rul_organization` int DEFAULT NULL,
  `rul_reason` varchar(256) DEFAULT NULL,
  `rul_pointdelta` int DEFAULT '0',
  `rul_isdeleted` tinyint DEFAULT '0',
  PRIMARY KEY (`rul_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='"rul_" prefix, used to store all rules and their deltas for organizations';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Point_Transactions`
--

DROP TABLE IF EXISTS `Point_Transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Point_Transactions` (
  `ptr_id` int NOT NULL AUTO_INCREMENT,
  `ptr_driverid` int DEFAULT NULL,
  `ptr_pointdelta` int DEFAULT NULL,
  `ptr_newbalance` int DEFAULT NULL,
  `ptr_reason` varchar(128) DEFAULT NULL,
  `ptr_sponsorid` int DEFAULT NULL,
  `ptr_org` int DEFAULT NULL,
  `ptr_date` datetime DEFAULT NULL,
  `ptr_isdeleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`ptr_id`)
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='"ptr" prefix, for storing each up or down in points and the associated reason';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Security_Questions`
--

DROP TABLE IF EXISTS `Security_Questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Security_Questions` (
  `sqs_question` varchar(256) NOT NULL,
  PRIMARY KEY (`sqs_question`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Sponsorships`
--

DROP TABLE IF EXISTS `Sponsorships`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Sponsorships` (
  `spo_id` int NOT NULL AUTO_INCREMENT,
  `spo_user` int NOT NULL,
  `spo_org` int NOT NULL,
  `spo_pointbalance` int NOT NULL DEFAULT '0',
  `spo_isdeleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`spo_id`)
) ENGINE=InnoDB AUTO_INCREMENT=97 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='"spo_" prefix, relationship between drivers and sponsor orgs';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `usr_id` int NOT NULL AUTO_INCREMENT,
  `usr_email` varchar(256) DEFAULT NULL,
  `usr_passwordhash` varchar(256) DEFAULT NULL,
  `usr_role` varchar(64) DEFAULT NULL,
  `usr_loginattempts` int DEFAULT '0',
  `usr_securityquestion` varchar(256) DEFAULT NULL,
  `usr_securityanswer` varchar(256) DEFAULT NULL,
  `usr_address` varchar(256) DEFAULT NULL,
  `usr_firstname` varchar(64) DEFAULT NULL,
  `usr_lastname` varchar(64) DEFAULT NULL,
  `usr_employeeid` varchar(64) DEFAULT NULL,
  `usr_phone` varchar(45) DEFAULT NULL,
  `usr_license` varchar(45) DEFAULT NULL,
  `usr_lastlogin` datetime DEFAULT NULL,
  `usr_isdeleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`usr_id`)
) ENGINE=InnoDB AUTO_INCREMENT=94 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='"usr_" prefix, usr_isdeleted is true for deleted users and false OW. ';
/*!40101 SET character_set_client = @saved_cs_client */;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-30 23:32:32
