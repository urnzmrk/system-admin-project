-- MySQL dump 10.13  Distrib 8.4.11, for Linux (x86_64)
--
-- Host: localhost    Database: systemdb
-- ------------------------------------------------------
-- Server version	8.4.11

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
-- Table structure for table `topics`
--

DROP TABLE IF EXISTS `topics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `topics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `order_number` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `file_data` longblob,
  `file_name` varchar(255) DEFAULT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `image_data` mediumblob,
  `image_name` varchar(255) DEFAULT NULL,
  `image_type` varchar(100) DEFAULT NULL,
  `slides_json` longtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=151 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `topics`
--

LOCK TABLES `topics` WRITE;
/*!40000 ALTER TABLE `topics` DISABLE KEYS */;
INSERT INTO `topics` VALUES (121,'HISTORY AND EVOLUTION OF UNIX, GNU & LINUX','Complete lesson covering history and evolution of unix, gnu & linux.',1,'2026-10-21 22:53:28','2026-10-21 22:53:28',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(122,'OPERATING SYSTEM, LINUX PLATFORM & SYSTEM FOUNDATIONS','Complete lesson covering operating system, linux platform & system foundations.',2,'2026-10-21 22:53:28','2026-10-21 22:53:28',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(123,'LINUX KERNEL EVOLUTION, MAJOR RELEASES & PLATFORM CAPABILITIES','Complete lesson covering linux kernel evolution, major releases & platform capabilities.',3,'2026-10-21 22:53:28','2026-10-21 22:53:28',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(124,'KERNEL ARCHITECTURE, SYSTEM LAYERS, RESOURCE MANAGEMENT & KERNEL TYPES','Complete lesson covering kernel architecture, system layers, resource management & kernel types.',4,'2026-10-21 22:53:28','2026-10-21 22:53:28',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(125,'GNU/LINUX, OPEN SOURCE SOFTWARE, LICENSING & SOFTWARE FREEDOM','Complete lesson covering gnu/linux, open source software, licensing & software freedom.',5,'2026-10-21 22:53:28','2026-10-21 22:53:28',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(126,'LINUX DISTRIBUTIONS, FAMILIES, PLATFORMS & ECOSYSTEM','Complete lesson covering linux distributions, families, platforms & ecosystem.',6,'2026-10-21 22:53:28','2026-10-21 22:53:28',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(127,'LINUX USER ENVIRONMENTS: DESKTOPS, DISPLAY SERVERS & DISPLAY MANAGERS','Complete lesson covering linux user environments: desktops, display servers & display managers.',7,'2026-10-21 22:53:28','2026-10-21 22:53:28',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(128,'LINUX INSTALLATION, BOOT ARCHITECTURE, BOOT LOADERS & SYSTEM REQUIREMENTS','Complete lesson covering linux installation, boot architecture, boot loaders & system requirements.',8,'2026-10-21 22:53:28','2026-10-21 22:53:28',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(129,'LINUX STORAGE, FILESYSTEMS, JOURNALING & DATA ORGANIZATION','Complete lesson covering linux storage, filesystems, journaling & data organization.',9,'2026-10-21 22:53:28','2026-10-21 22:53:28',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(130,'LINUX DIRECTORY HIERARCHY, SYSTEM PATHS & FILE ORGANIZATION','Complete lesson covering linux directory hierarchy, system paths & file organization.',10,'2026-10-21 22:53:28','2026-10-21 22:53:28',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(131,'LINUX SHELLS, TERMINAL ENVIRONMENT & COMMAND-LINE INTERACTION','Complete lesson covering linux shells, terminal environment & command-line interaction.',11,'2026-10-21 22:53:28','2026-10-21 22:53:28',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(132,'LINUX NAVIGATION, PATHS, DIRECTORIES & BASIC FILESYSTEM OPERATIONS','Complete lesson covering linux navigation, paths, directories & basic filesystem operations.',12,'2026-10-21 22:53:28','2026-10-21 22:53:28',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(133,'LINUX FILE OPERATIONS, CONTENT VIEWING, OUTPUT & TEXT HANDLING','Complete lesson covering linux file operations, content viewing, output & text handling.',13,'2026-10-21 22:53:28','2026-10-21 22:53:28',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(134,'LINUX USERS, GROUPS, ACCOUNTS & IDENTITY ADMINISTRATION','Complete lesson covering linux users, groups, accounts & identity administration.',14,'2026-10-21 22:53:28','2026-10-21 22:53:28',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(135,'LINUX SEARCH, FILTERS, UTILITIES, ARCHIVING, COMPRESSION & LINKS','Complete lesson covering linux search, filters, utilities, archiving, compression & links.',15,'2026-10-21 22:53:28','2026-10-21 22:53:28',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(136,'LINUX NETWORKING COMMANDS, CONNECTIVITY, NAME RESOLUTION & REMOTE ACCESS','Complete lesson covering linux networking commands, connectivity, name resolution & remote access.',16,'2026-10-21 22:53:28','2026-10-21 22:53:28',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(137,'LINUX PERMISSIONS, OWNERSHIP, ACCESS MODES & FILE SECURITY','Complete lesson covering linux permissions, ownership, access modes & file security.',17,'2026-10-21 22:53:28','2026-10-21 22:53:28',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(138,'ADMINISTRATIVE PRIVILEGES, SUDO, ROOT ACCESS & SECURE PRIVILEGE MANAGEMENT','Complete lesson covering administrative privileges, sudo, root access & secure privilege management.',18,'2026-10-21 22:53:28','2026-10-21 22:53:28',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(139,'LINUX SERVER INSTALLATION, HOST IDENTITY, IP CONFIGURATION & NETWORK SETUP','Complete lesson covering linux server installation, host identity, ip configuration & network setup.',19,'2026-10-21 22:53:28','2026-10-21 22:53:28',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(140,'SERVER FUNDAMENTALS, CLIENT-SERVER COMPUTING & NETWORK SERVER ARCHITECTURE','Complete lesson covering server fundamentals, client-server computing & network server architecture.',20,'2026-10-21 22:53:28','2026-10-21 22:53:28',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(141,'SERVER TYPES, ROLES, SERVICES, PLATFORMS & ENTERPRISE SERVER CONCEPTS','Complete lesson covering server types, roles, services, platforms & enterprise server concepts.',21,'2026-10-21 22:53:28','2026-10-21 22:53:28',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(142,'SOFTWARE INSTALLATION, PACKAGE MANAGEMENT, REPOSITORIES & APPLICATION DEPLOYMENT','Complete lesson covering software installation, package management, repositories & application deployment.',22,'2026-10-21 22:53:28','2026-10-21 22:53:28',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(143,'WEB SERVERS, APACHE, LAMP STACK & BASIC WEB APPLICATION HOSTING','Complete lesson covering web servers, apache, lamp stack & basic web application hosting.',23,'2026-10-21 22:53:28','2026-10-21 22:53:28',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(144,'NETWORK SERVICES: SSH, FTP, DHCP & LINUX SERVICE MANAGEMENT','Complete lesson covering network services: ssh, ftp, dhcp & linux service management.',24,'2026-10-21 22:53:28','2026-10-21 22:53:28',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(145,'CYBERSECURITY, ETHICAL HACKING, HACKER CLASSIFICATIONS & ATTACK TARGETS','Complete lesson covering cybersecurity, ethical hacking, hacker classifications & attack targets.',25,'2026-10-21 22:53:28','2026-10-21 22:53:28',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(146,'ETHICAL HACKING LIFECYCLE, PHASES, PENETRATION TESTING METHODOLOGY & REPORTING','Complete lesson covering ethical hacking lifecycle, phases, penetration testing methodology & reporting.',26,'2026-10-21 22:53:28','2026-10-21 22:53:28',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(147,'RECONNAISSANCE, FOOTPRINTING, FINGERPRINTING & TARGET PROFILING','Complete lesson covering reconnaissance, footprinting, fingerprinting & target profiling.',27,'2026-10-21 22:53:28','2026-10-21 22:53:28',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(148,'INFORMATION GATHERING, NETWORK DISCOVERY, OSINT & VULNERABILITY ASSESSMENT TOOLS','Complete lesson covering information gathering, network discovery, osint & vulnerability assessment tools.',28,'2026-10-21 22:53:28','2026-10-21 22:53:28',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(149,'EXPLOITATION, WEB PENETRATION TESTING, KALI LINUX & SECURITY TOOLSETS','Complete lesson covering exploitation, web penetration testing, kali linux & security toolsets.',29,'2026-10-21 22:53:28','2026-10-21 22:53:28',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(150,'ETHICAL HACKING LABS, LINUX SERVER HARDENING & DEFENSIVE SECURITY PRACTICES','Complete lesson covering ethical hacking labs, linux server hardening & defensive security practices.',30,'2026-10-21 22:53:28','2026-10-21 22:53:28',NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `topics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subtopics`
--

DROP TABLE IF EXISTS `subtopics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subtopics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `topic_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` longtext,
  `order_number` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `image_data` mediumblob,
  `image_name` varchar(255) DEFAULT NULL,
  `image_type` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_subtopics_topic` (`topic_id`),
  CONSTRAINT `fk_subtopics_topic` FOREIGN KEY (`topic_id`) REFERENCES `topics` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=169 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subtopics`
--

LOCK TABLES `subtopics` WRITE;
/*!40000 ALTER TABLE `subtopics` DISABLE KEYS */;
/*!40000 ALTER TABLE `subtopics` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-21 23:11:04
