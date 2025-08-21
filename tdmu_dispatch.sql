/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.8.2-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: tdmu_dispatch
-- ------------------------------------------------------
-- Server version	11.8.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `assignment`
--

DROP TABLE IF EXISTS `assignment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `assignment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `positionId` int(11) NOT NULL,
  `unitId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_b3ae3ab674b9ba61a5771e906da` (`userId`),
  KEY `FK_7cbc0dc57d5780bcd12c9bd399c` (`positionId`),
  KEY `FK_fed3575ea6a681f296b9eb97232` (`unitId`),
  CONSTRAINT `FK_7cbc0dc57d5780bcd12c9bd399c` FOREIGN KEY (`positionId`) REFERENCES `position` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_b3ae3ab674b9ba61a5771e906da` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_fed3575ea6a681f296b9eb97232` FOREIGN KEY (`unitId`) REFERENCES `unit` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assignment`
--

LOCK TABLES `assignment` WRITE;
/*!40000 ALTER TABLE `assignment` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `assignment` VALUES
(1,1,1,1),
(2,2,1,1),
(3,3,2,1),
(4,4,3,4),
(5,5,3,5),
(6,6,5,2),
(7,7,4,4);
/*!40000 ALTER TABLE `assignment` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `department`
--

DROP TABLE IF EXISTS `department`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `department` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `parentDepartmentId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_bbe097728367bd569b5db49db90` (`parentDepartmentId`),
  CONSTRAINT `FK_bbe097728367bd569b5db49db90` FOREIGN KEY (`parentDepartmentId`) REFERENCES `department` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `department`
--

LOCK TABLES `department` WRITE;
/*!40000 ALTER TABLE `department` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `department` VALUES
(1,'Phòng Đào tạo','Phòng quản lý đào tạo',NULL),
(2,'Phòng Tài chính - Kế toán','Phòng quản lý tài chính',NULL),
(3,'Phòng Tổ chức - Hành chính','Phòng quản lý nhân sự và hành chính',NULL);
/*!40000 ALTER TABLE `department` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `document`
--

DROP TABLE IF EXISTS `document`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `document` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text DEFAULT NULL,
  `documentNumber` varchar(100) DEFAULT NULL,
  `documentType` enum('OUTGOING','INCOMING','INTERNAL') NOT NULL,
  `documentCategoryId` int(11) NOT NULL,
  `fileId` int(11) DEFAULT NULL,
  `status` enum('DRAFT','PENDING','PROCESSING','APPROVED','REJECTED','COMPLETED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
  `priority` enum('LOW','MEDIUM','HIGH','URGENT') NOT NULL DEFAULT 'MEDIUM',
  `deadline` timestamp NULL DEFAULT NULL,
  `assignedToUserId` int(11) DEFAULT NULL,
  `createdByUserId` int(11) NOT NULL,
  `taskRequestId` int(11) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `workflowInstanceId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `REL_83b05a0107593613639d26106c` (`fileId`),
  UNIQUE KEY `REL_2e4963dad6408a7bf87804d815` (`workflowInstanceId`),
  KEY `FK_899fbce1ef3e0d28ce2e79cacb2` (`documentCategoryId`),
  KEY `FK_8c3f23b3e8255bb1f8de9e8a8ae` (`createdByUserId`),
  KEY `FK_bedd3e1259485123fad20f19f3e` (`assignedToUserId`),
  KEY `FK_95a8719619d69a299a88800c0f7` (`taskRequestId`),
  CONSTRAINT `FK_2e4963dad6408a7bf87804d815e` FOREIGN KEY (`workflowInstanceId`) REFERENCES `workflow_instance` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_83b05a0107593613639d26106ca` FOREIGN KEY (`fileId`) REFERENCES `file` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_899fbce1ef3e0d28ce2e79cacb2` FOREIGN KEY (`documentCategoryId`) REFERENCES `document_category` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_8c3f23b3e8255bb1f8de9e8a8ae` FOREIGN KEY (`createdByUserId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_95a8719619d69a299a88800c0f7` FOREIGN KEY (`taskRequestId`) REFERENCES `task_request` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_bedd3e1259485123fad20f19f3e` FOREIGN KEY (`assignedToUserId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document`
--

LOCK TABLES `document` WRITE;
/*!40000 ALTER TABLE `document` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `document` VALUES
(1,'Quyết định thành lập khoa mới','Quyết định thành lập Khoa Công nghệ Thông tin',NULL,'INTERNAL',1,1,'DRAFT','HIGH','2024-12-31 00:00:00',NULL,4,NULL,'2025-08-17 12:06:26','2025-08-17 12:06:26',NULL),
(2,'Báo cáo tài chính quý 1 năm 2024','Báo cáo tình hình tài chính quý 1 năm 2024',NULL,'INTERNAL',3,2,'PENDING','MEDIUM','2024-06-30 00:00:00',NULL,5,NULL,'2025-08-17 12:06:26','2025-08-17 12:06:26',NULL),
(3,'Kế hoạch đào tạo năm học 2024-2025','Kế hoạch đào tạo chi tiết cho năm học mới',NULL,'INTERNAL',2,3,'APPROVED','HIGH','2024-08-31 00:00:00',NULL,6,NULL,'2025-08-17 12:06:26','2025-08-17 15:32:29',NULL),
(4,'Biên bản họp Hội đồng trường','Biên bản họp Hội đồng trường tháng 3/2024',NULL,'INTERNAL',1,4,'APPROVED','MEDIUM','2024-04-30 00:00:00',NULL,7,NULL,'2025-08-17 12:06:26','2025-08-17 12:06:26',NULL),
(5,'Hợp đồng hợp tác với doanh nghiệp ABC','Hợp đồng hợp tác đào tạo với công ty ABC',NULL,'OUTGOING',4,5,'DRAFT','HIGH','2024-12-31 00:00:00',NULL,4,NULL,'2025-08-17 12:06:26','2025-08-17 12:06:26',NULL),
(6,'Tạo văn bản quyết định thành lập câu lạc bộ IT','123',NULL,'INTERNAL',1,NULL,'APPROVED','HIGH',NULL,NULL,7,4,'2025-08-17 15:54:11','2025-08-17 15:57:31',NULL),
(7,'Tạo văn bản quyết định thành lập câu lạc bộ IT','123',NULL,'INTERNAL',1,7,'PENDING','MEDIUM',NULL,NULL,7,NULL,'2025-08-17 15:55:01','2025-08-17 15:55:01',NULL);
/*!40000 ALTER TABLE `document` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `document_approval_history`
--

DROP TABLE IF EXISTS `document_approval_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `document_approval_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `documentId` int(11) NOT NULL,
  `action` enum('APPROVE','REJECT','RETURN','FORWARD') NOT NULL,
  `level` enum('DRAFT','DEPARTMENT_HEAD','UNIVERSITY_LEADER','FINAL') NOT NULL,
  `comment` text DEFAULT NULL,
  `approvedByUserId` int(11) NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  PRIMARY KEY (`id`),
  KEY `FK_6760e1b1b5f9dc36f5216bd82d9` (`documentId`),
  KEY `FK_afb0f70846993e81672fbeff6bd` (`approvedByUserId`),
  CONSTRAINT `FK_6760e1b1b5f9dc36f5216bd82d9` FOREIGN KEY (`documentId`) REFERENCES `document` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_afb0f70846993e81672fbeff6bd` FOREIGN KEY (`approvedByUserId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_approval_history`
--

LOCK TABLES `document_approval_history` WRITE;
/*!40000 ALTER TABLE `document_approval_history` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `document_approval_history` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `document_category`
--

DROP TABLE IF EXISTS `document_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `document_category` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_category`
--

LOCK TABLES `document_category` WRITE;
/*!40000 ALTER TABLE `document_category` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `document_category` VALUES
(1,'Văn bản hành chính','Các loại văn bản hành chính thông thường'),
(2,'Văn bản đào tạo','Các văn bản liên quan đến công tác đào tạo'),
(3,'Văn bản tài chính','Các văn bản liên quan đến tài chính, kế toán'),
(4,'Văn bản hợp tác','Các văn bản hợp tác với đối tác bên ngoài'),
(5,'Văn bản nhân sự','Các văn bản liên quan đến nhân sự, cán bộ');
/*!40000 ALTER TABLE `document_category` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `document_comment`
--

DROP TABLE IF EXISTS `document_comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `document_comment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `content` text NOT NULL,
  `documentId` int(11) NOT NULL,
  `createdByUserId` int(11) NOT NULL,
  `parentCommentId` int(11) DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`),
  KEY `FK_7804a2311d5cf286d6231cd3f35` (`documentId`),
  KEY `FK_f02f7f00ac71e49368c99767762` (`createdByUserId`),
  KEY `FK_b5cf2bbc9a6db5bb94be1098de4` (`parentCommentId`),
  CONSTRAINT `FK_7804a2311d5cf286d6231cd3f35` FOREIGN KEY (`documentId`) REFERENCES `document` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_b5cf2bbc9a6db5bb94be1098de4` FOREIGN KEY (`parentCommentId`) REFERENCES `document_comment` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_f02f7f00ac71e49368c99767762` FOREIGN KEY (`createdByUserId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_comment`
--

LOCK TABLES `document_comment` WRITE;
/*!40000 ALTER TABLE `document_comment` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `document_comment` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `document_statistics`
--

DROP TABLE IF EXISTS `document_statistics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `document_statistics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `totalDocuments` int(11) NOT NULL DEFAULT 0,
  `incomingDocuments` int(11) NOT NULL DEFAULT 0,
  `outgoingDocuments` int(11) NOT NULL DEFAULT 0,
  `internalDocuments` int(11) NOT NULL DEFAULT 0,
  `pendingDocuments` int(11) NOT NULL DEFAULT 0,
  `completedDocuments` int(11) NOT NULL DEFAULT 0,
  `overdueDocuments` int(11) NOT NULL DEFAULT 0,
  `urgentDocuments` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_statistics`
--

LOCK TABLES `document_statistics` WRITE;
/*!40000 ALTER TABLE `document_statistics` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `document_statistics` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `document_template`
--

DROP TABLE IF EXISTS `document_template`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `document_template` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `content` text NOT NULL,
  `documentCategoryId` int(11) DEFAULT NULL,
  `isActive` tinyint(4) NOT NULL DEFAULT 1,
  `isDefault` tinyint(4) NOT NULL DEFAULT 0,
  `createdByUserId` int(11) NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`),
  KEY `FK_6a43298f867398b0d6401a40e15` (`documentCategoryId`),
  KEY `FK_776391424bcc603064d1ad83398` (`createdByUserId`),
  CONSTRAINT `FK_6a43298f867398b0d6401a40e15` FOREIGN KEY (`documentCategoryId`) REFERENCES `document_category` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_776391424bcc603064d1ad83398` FOREIGN KEY (`createdByUserId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_template`
--

LOCK TABLES `document_template` WRITE;
/*!40000 ALTER TABLE `document_template` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `document_template` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `document_type`
--

DROP TABLE IF EXISTS `document_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `document_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_type`
--

LOCK TABLES `document_type` WRITE;
/*!40000 ALTER TABLE `document_type` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `document_type` VALUES
(1,'Quyết định','Văn bản quyết định'),
(2,'Nghị quyết','Văn bản nghị quyết'),
(3,'Chỉ thị','Văn bản chỉ thị'),
(4,'Thông báo','Văn bản thông báo'),
(5,'Báo cáo','Văn bản báo cáo');
/*!40000 ALTER TABLE `document_type` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `document_version`
--

DROP TABLE IF EXISTS `document_version`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `document_version` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `documentId` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text DEFAULT NULL,
  `documentNumber` varchar(100) DEFAULT NULL,
  `fileId` int(11) DEFAULT NULL,
  `versionNumber` int(11) NOT NULL,
  `changeDescription` varchar(255) NOT NULL,
  `createdByUserId` int(11) NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  PRIMARY KEY (`id`),
  KEY `FK_798ac949e0d25e76695ffc7776a` (`documentId`),
  KEY `FK_3b72659dc7b4e993a97adbb35fe` (`createdByUserId`),
  KEY `FK_f2c15fa930f1f13e2e7ceee16aa` (`fileId`),
  CONSTRAINT `FK_3b72659dc7b4e993a97adbb35fe` FOREIGN KEY (`createdByUserId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_798ac949e0d25e76695ffc7776a` FOREIGN KEY (`documentId`) REFERENCES `document` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_f2c15fa930f1f13e2e7ceee16aa` FOREIGN KEY (`fileId`) REFERENCES `file` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_version`
--

LOCK TABLES `document_version` WRITE;
/*!40000 ALTER TABLE `document_version` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `document_version` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `file`
--

DROP TABLE IF EXISTS `file`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `file` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `driveFileId` varchar(255) NOT NULL,
  `originalName` varchar(255) NOT NULL,
  `mimeType` varchar(255) NOT NULL,
  `allowedUserIds` text DEFAULT NULL,
  `isPublic` tinyint(4) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `file`
--

LOCK TABLES `file` WRITE;
/*!40000 ALTER TABLE `file` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `file` VALUES
(1,'file1_drive_id','quyet_dinh_thanh_lap.pdf','application/pdf',NULL,0),
(2,'file2_drive_id','bao_cao_tai_chinh.xlsx','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',NULL,0),
(3,'file3_drive_id','ke_hoach_dao_tao.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document',NULL,0),
(4,'file4_drive_id','bien_ban_hop.pdf','application/pdf',NULL,0),
(5,'file5_drive_id','hop_dong_hop_tac.pdf','application/pdf',NULL,0),
(6,'1nT0HRrK2ipvJ0pkiP4HSGAaXNdI2eQWC','2125062010168944334.jpg','image/jpeg',NULL,1),
(7,'1cZVaXyqnrs8jW5SPIN2oA4SpiNqREcm0','1Q3ITWjz-zOcmLpfefJm_yWHaJmtc5hoj.pdf','application/pdf',NULL,0);
/*!40000 ALTER TABLE `file` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `position`
--

DROP TABLE IF EXISTS `position`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `position` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `positionName` varchar(255) NOT NULL,
  `departmentId` int(11) NOT NULL,
  `maxSlots` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `FK_265308a419e87c0f9eb399099da` (`departmentId`),
  CONSTRAINT `FK_265308a419e87c0f9eb399099da` FOREIGN KEY (`departmentId`) REFERENCES `department` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `position`
--

LOCK TABLES `position` WRITE;
/*!40000 ALTER TABLE `position` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `position` VALUES
(1,'Hiệu trưởng',1,1),
(2,'Phó Hiệu trưởng',1,2),
(3,'Trưởng phòng',2,3),
(4,'Nhân viên',3,10),
(5,'Giảng viên',1,20),
(6,'abc',2,1);
/*!40000 ALTER TABLE `position` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `task_assignment`
--

DROP TABLE IF EXISTS `task_assignment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_assignment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `documentId` int(11) NOT NULL,
  `assignedToUserId` int(11) NOT NULL,
  `assignedByUserId` int(11) NOT NULL,
  `taskDescription` text DEFAULT NULL,
  `deadline` timestamp NULL DEFAULT NULL,
  `instructions` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('PENDING','IN_PROGRESS','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `assignedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `completedAt` timestamp NULL DEFAULT NULL,
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`),
  KEY `FK_7b7f44249722b0d0930521e3cc5` (`documentId`),
  KEY `FK_a93232b59a6f6f9a327f15f87dc` (`assignedToUserId`),
  KEY `FK_9578ab332e6a1f956118f4973d7` (`assignedByUserId`),
  CONSTRAINT `FK_7b7f44249722b0d0930521e3cc5` FOREIGN KEY (`documentId`) REFERENCES `document` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_9578ab332e6a1f956118f4973d7` FOREIGN KEY (`assignedByUserId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_a93232b59a6f6f9a327f15f87dc` FOREIGN KEY (`assignedToUserId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_assignment`
--

LOCK TABLES `task_assignment` WRITE;
/*!40000 ALTER TABLE `task_assignment` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `task_assignment` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `task_request`
--

DROP TABLE IF EXISTS `task_request`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_request` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `requestedByUserId` int(11) NOT NULL,
  `assignedToUserId` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `priority` enum('LOW','MEDIUM','HIGH','URGENT') NOT NULL DEFAULT 'MEDIUM',
  `deadline` timestamp NULL DEFAULT NULL,
  `instructions` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `rejectionReason` text DEFAULT NULL,
  `approvedAt` timestamp NULL DEFAULT NULL,
  `rejectedAt` timestamp NULL DEFAULT NULL,
  `cancelledAt` timestamp NULL DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`),
  KEY `FK_a0abee83c4ff551b2234e597282` (`requestedByUserId`),
  KEY `FK_ef3ce4fec03a9fb5303adf540da` (`assignedToUserId`),
  CONSTRAINT `FK_a0abee83c4ff551b2234e597282` FOREIGN KEY (`requestedByUserId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_ef3ce4fec03a9fb5303adf540da` FOREIGN KEY (`assignedToUserId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_request`
--

LOCK TABLES `task_request` WRITE;
/*!40000 ALTER TABLE `task_request` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `task_request` VALUES
(1,5,10,'Tạo văn bản gửi đến BIDV','abc','URGENT',NULL,'abc','Đã phê duyệt','APPROVED',NULL,'2025-08-17 02:26:36',NULL,NULL,'2025-08-17 16:20:59.844888','2025-08-17 16:26:36.000000'),
(2,5,10,'Tạo văn bản gửi đến BIDV','abc','URGENT',NULL,'abc','abc','REJECTED','không thích',NULL,'2025-08-17 02:26:28',NULL,'2025-08-17 16:25:38.200633','2025-08-17 16:26:28.000000'),
(3,2,7,'Tạo văn bản quyết định thành lập câu lạc bộ IT','Soạn thảo văn bản quyết định thành lập Câu lạc bộ IT của trường, bao gồm:\n\n1. Tên câu lạc bộ.\n\n2. Mục tiêu, chức năng, nhiệm vụ chính.\n\n3. Cơ cấu tổ chức, nhân sự ban điều hành.\n\n4. Căn cứ pháp lý và đề xuất phê duyệt.\n\n5. Hình thức hoạt động, quyền lợi và trách nhiệm của thành viên.','HIGH',NULL,'Tham khảo mẫu quyết định thành lập các CLB trước đây của trường để đảm bảo đúng bố cục và quy định.\n\nĐảm bảo văn bản có đầy đủ quốc hiệu, tiêu ngữ, căn cứ pháp lý và chữ ký lãnh đạo.\n\nSoạn dự thảo gửi lại cho Ban Chủ nhiệm CLB IT và Phòng Công tác Sinh viên để góp ý, sau đó hoàn thiện bản chính thức.','Văn bản cần ngắn gọn, rõ ràng, đúng thể thức văn bản hành chính của Nhà nước và quy định nội bộ trường.','CANCELLED',NULL,NULL,NULL,'2025-08-17 08:52:31','2025-08-17 22:51:19.013083','2025-08-17 22:52:31.000000'),
(4,2,7,'Tạo văn bản quyết định thành lập câu lạc bộ IT','Soạn thảo văn bản quyết định thành lập Câu lạc bộ IT của trường, bao gồm:\n\nTên câu lạc bộ.\n\nMục tiêu, chức năng, nhiệm vụ chính.\n\nCơ cấu tổ chức, nhân sự ban điều hành.\n\nCăn cứ pháp lý và đề xuất phê duyệt.\n\nHình thức hoạt động, quyền lợi và trách nhiệm của thành viên.','HIGH',NULL,'Tham khảo mẫu quyết định thành lập các CLB trước đây của trường để đảm bảo đúng bố cục và quy định.\n\nĐảm bảo văn bản có đầy đủ quốc hiệu, tiêu ngữ, căn cứ pháp lý và chữ ký lãnh đạo.\n\nSoạn dự thảo gửi lại cho Ban Chủ nhiệm CLB IT và Phòng Công tác Sinh viên để góp ý, sau đó hoàn thiện bản chính thức.','Đã phê duyệt','APPROVED',NULL,'2025-08-17 08:53:21',NULL,NULL,'2025-08-17 22:52:16.889560','2025-08-17 22:53:21.000000'),
(5,1,7,'Báo cáo tài chính quý 2','abvc','URGENT',NULL,'abc','abc','PENDING',NULL,NULL,NULL,NULL,'2025-08-18 09:02:23.904554','2025-08-18 09:02:23.904554');
/*!40000 ALTER TABLE `task_request` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `unit`
--

DROP TABLE IF EXISTS `unit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `unit` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `unitName` varchar(255) NOT NULL,
  `unitTypeId` int(11) DEFAULT NULL,
  `parentUnitId` int(11) DEFAULT NULL,
  `establishmentDate` timestamp NULL DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_fa089475c489a50cebdc09d62af` (`unitTypeId`),
  KEY `FK_329004e9a777aa2b5a17c8a1b63` (`parentUnitId`),
  CONSTRAINT `FK_329004e9a777aa2b5a17c8a1b63` FOREIGN KEY (`parentUnitId`) REFERENCES `unit` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_fa089475c489a50cebdc09d62af` FOREIGN KEY (`unitTypeId`) REFERENCES `unit_type` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unit`
--

LOCK TABLES `unit` WRITE;
/*!40000 ALTER TABLE `unit` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `unit` VALUES
(1,'Trường Đại học Thủ Dầu Một',1,NULL,'2009-01-01 00:00:00','info@tdmu.edu.vn','0274 3846 123'),
(2,'Khoa Công nghệ Thông tin',2,NULL,'2010-01-01 00:00:00','cntt@tdmu.edu.vn','0274 3846 124'),
(3,'Khoa Kinh tế',2,NULL,'2010-01-01 00:00:00','kt@tdmu.edu.vn','0274 3846 125'),
(4,'Phòng Đào tạo',3,NULL,'2009-01-01 00:00:00','daotao@tdmu.edu.vn','0274 3846 126'),
(5,'Phòng Tài chính - Kế toán',3,NULL,'2009-01-01 00:00:00','taichinh@tdmu.edu.vn','0274 3846 127');
/*!40000 ALTER TABLE `unit` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `unit_type`
--

DROP TABLE IF EXISTS `unit_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `unit_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `typeName` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unit_type`
--

LOCK TABLES `unit_type` WRITE;
/*!40000 ALTER TABLE `unit_type` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `unit_type` VALUES
(1,'Trường Đại học','Các trường đại học trực thuộc'),
(2,'Khoa','Các khoa trong trường'),
(3,'Phòng Ban','Các phòng ban chức năng'),
(4,'Trung tâm','Các trung tâm nghiên cứu và đào tạo'),
(5,'Viện','Các viện nghiên cứu');
/*!40000 ALTER TABLE `unit_type` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `passwordHash` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `firstName` varchar(255) NOT NULL,
  `isActive` tinyint(4) NOT NULL DEFAULT 1,
  `isFirstLogin` tinyint(4) NOT NULL DEFAULT 1,
  `avatar` text DEFAULT NULL,
  `roles` set('SYSTEM_ADMIN','UNIVERSITY_LEADER','DEPARTMENT_HEAD','DEPARTMENT_STAFF','CLERK','DEGREE_MANAGER','BASIC_USER') NOT NULL DEFAULT 'BASIC_USER',
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `avatarFileId` int(11) DEFAULT NULL,
  `phoneNumber` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `dateOfBirth` varchar(255) DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `jobTitle` varchar(255) DEFAULT NULL,
  `bio` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `linkedin` varchar(255) DEFAULT NULL,
  `facebook` varchar(255) DEFAULT NULL,
  `twitter` varchar(255) DEFAULT NULL,
  `emailNotifications` tinyint(4) NOT NULL DEFAULT 1,
  `pushNotifications` tinyint(4) NOT NULL DEFAULT 1,
  `isProfilePublic` tinyint(4) NOT NULL DEFAULT 1,
  `lastLoginAt` datetime DEFAULT NULL,
  `loginCount` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_e12875dfb3b1d92d7d7c5377e2` (`email`),
  KEY `FK_643734a7916743c1b226b9b1b32` (`avatarFileId`),
  CONSTRAINT `FK_643734a7916743c1b226b9b1b32` FOREIGN KEY (`avatarFileId`) REFERENCES `file` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `user` VALUES
(1,'admin@tdmu.edu.vn','$2b$10$0ibohrMaYNCm3NXyHP2bSuDzSyur4l3cbhaNypC4.rNlTMhIdcE2u','System','Admin',1,0,NULL,'SYSTEM_ADMIN','2025-08-17 19:06:25.811017','2025-08-18 09:48:11.000000',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,1,1,'2025-08-18 02:48:11',4),
(2,'hieutruong@tdmu.edu.vn','$2b$10$0ibohrMaYNCm3NXyHP2bSuDzSyur4l3cbhaNypC4.rNlTMhIdcE2u','Hiệu Trưởng','Nguyễn Văn',1,0,NULL,'SYSTEM_ADMIN','2025-08-17 19:06:25.818322','2025-08-17 22:56:56.000000',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,1,1,'2025-08-17 15:56:56',3),
(3,'phohieutruong@tdmu.edu.vn','$2b$10$0ibohrMaYNCm3NXyHP2bSuDzSyur4l3cbhaNypC4.rNlTMhIdcE2u','Phó Hiệu Trưởng','Trần Thị',1,0,NULL,'SYSTEM_ADMIN','2025-08-17 19:06:25.821943','2025-08-17 19:06:25.821943',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,1,1,NULL,0),
(4,'truongphong@tdmu.edu.vn','$2b$10$0ibohrMaYNCm3NXyHP2bSuDzSyur4l3cbhaNypC4.rNlTMhIdcE2u','Trưởng Phòng','Lê Văn',1,0,NULL,'DEPARTMENT_STAFF','2025-08-17 19:06:25.828132','2025-08-17 19:06:25.828132',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,1,1,NULL,0),
(5,'nhanvien1@tdmu.edu.vn','$2b$10$0ibohrMaYNCm3NXyHP2bSuDzSyur4l3cbhaNypC4.rNlTMhIdcE2u','Nhân Viên 1','Phạm Thị',1,0,'https://drive.google.com/uc?id=1nT0HRrK2ipvJ0pkiP4HSGAaXNdI2eQWC','DEPARTMENT_STAFF','2025-08-17 19:06:25.833699','2025-08-17 20:42:32.000000',6,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,1,1,NULL,0),
(6,'giangvien1@tdmu.edu.vn','$2b$10$0ibohrMaYNCm3NXyHP2bSuDzSyur4l3cbhaNypC4.rNlTMhIdcE2u','Giảng Viên 1','Vũ Thị',1,0,NULL,'CLERK','2025-08-17 19:06:25.837064','2025-08-17 19:06:25.837064',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,1,1,NULL,0),
(7,'thuky1@tdmu.edu.vn','$2b$10$0ibohrMaYNCm3NXyHP2bSuDzSyur4l3cbhaNypC4.rNlTMhIdcE2u','Thư Ký 1','Ngô Thị',1,0,NULL,'CLERK','2025-08-17 19:06:25.839931','2025-08-18 09:48:27.000000',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,1,1,'2025-08-18 02:48:27',3);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `user_activity`
--

DROP TABLE IF EXISTS `user_activity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_activity` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `activityType` enum('LOGIN','LOGOUT','PROFILE_UPDATE','PASSWORD_CHANGE','AVATAR_UPDATE','DOCUMENT_VIEW','DOCUMENT_CREATE','DOCUMENT_UPDATE','DOCUMENT_DELETE','TASK_ASSIGNED','TASK_COMPLETED','APPROVAL_REQUESTED','APPROVAL_APPROVED','APPROVAL_REJECTED') NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `ipAddress` varchar(255) DEFAULT NULL,
  `userAgent` varchar(255) DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  PRIMARY KEY (`id`),
  KEY `FK_c8d8d7cfc6e3433e725339c952b` (`userId`),
  CONSTRAINT `FK_c8d8d7cfc6e3433e725339c952b` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_activity`
--

LOCK TABLES `user_activity` WRITE;
/*!40000 ALTER TABLE `user_activity` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `user_activity` VALUES
(1,5,'AVATAR_UPDATE','Cập nhật ảnh đại diện','\"{\\\"fileName\\\":\\\"2125062010168944334.jpg\\\"}\"',NULL,NULL,'2025-08-17 20:42:32.196648'),
(2,7,'LOGIN','Đăng nhập vào hệ thống','\"{}\"','::ffff:127.0.0.1','Mozilla/5.0 (X11; Linux x86_64; rv:142.0) Gecko/20100101 Firefox/142.0','2025-08-17 21:00:21.122569'),
(3,1,'LOGIN','Đăng nhập vào hệ thống','\"{}\"','::ffff:127.0.0.1','Mozilla/5.0 (X11; Linux x86_64; rv:142.0) Gecko/20100101 Firefox/142.0','2025-08-17 21:01:05.144779'),
(4,2,'LOGIN','Đăng nhập vào hệ thống','\"{}\"','::ffff:127.0.0.1','Mozilla/5.0 (X11; Linux x86_64; rv:142.0) Gecko/20100101 Firefox/142.0','2025-08-17 21:58:39.865807'),
(5,2,'LOGIN','Đăng nhập vào hệ thống','\"{}\"','::ffff:127.0.0.1','Mozilla/5.0 (X11; Linux x86_64; rv:142.0) Gecko/20100101 Firefox/142.0','2025-08-17 22:34:03.485310'),
(6,7,'LOGIN','Đăng nhập vào hệ thống','\"{}\"','::ffff:127.0.0.1','Mozilla/5.0 (X11; Linux x86_64; rv:142.0) Gecko/20100101 Firefox/142.0','2025-08-17 22:53:00.145426'),
(7,2,'LOGIN','Đăng nhập vào hệ thống','\"{}\"','::ffff:127.0.0.1','Mozilla/5.0 (X11; Linux x86_64; rv:142.0) Gecko/20100101 Firefox/142.0','2025-08-17 22:56:56.299442'),
(8,1,'LOGIN','Đăng nhập vào hệ thống','\"{}\"','::ffff:127.0.0.1','Mozilla/5.0 (X11; Linux x86_64; rv:142.0) Gecko/20100101 Firefox/142.0','2025-08-17 23:30:35.287152'),
(9,1,'LOGIN','Đăng nhập vào hệ thống','\"{}\"','::ffff:127.0.0.1','Mozilla/5.0 (X11; Linux x86_64; rv:142.0) Gecko/20100101 Firefox/142.0','2025-08-17 23:58:42.305283'),
(10,1,'LOGIN','Đăng nhập vào hệ thống','\"{}\"','::ffff:127.0.0.1','Mozilla/5.0 (X11; Linux x86_64; rv:142.0) Gecko/20100101 Firefox/142.0','2025-08-18 09:48:11.842561'),
(11,7,'LOGIN','Đăng nhập vào hệ thống','\"{}\"','::ffff:127.0.0.1','Mozilla/5.0 (X11; Linux x86_64; rv:142.0) Gecko/20100101 Firefox/142.0','2025-08-18 09:48:27.560488');
/*!40000 ALTER TABLE `user_activity` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `user_position`
--

DROP TABLE IF EXISTS `user_position`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_position` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `positionId` int(11) NOT NULL,
  `startDate` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `endDate` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_1b7679d1ea0ca6182710e888fcb` (`userId`),
  KEY `FK_938be4b17d950145937075cb4aa` (`positionId`),
  CONSTRAINT `FK_1b7679d1ea0ca6182710e888fcb` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_938be4b17d950145937075cb4aa` FOREIGN KEY (`positionId`) REFERENCES `position` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_position`
--

LOCK TABLES `user_position` WRITE;
/*!40000 ALTER TABLE `user_position` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `user_position` VALUES
(1,1,1,'2020-01-01 07:00:00.000000',NULL),
(2,2,1,'2020-01-01 07:00:00.000000',NULL),
(3,3,2,'2020-01-01 07:00:00.000000',NULL),
(4,4,3,'2021-01-01 07:00:00.000000',NULL),
(5,5,3,'2021-01-01 07:00:00.000000',NULL),
(6,6,5,'2021-01-01 07:00:00.000000',NULL),
(7,7,4,'2022-01-01 07:00:00.000000',NULL);
/*!40000 ALTER TABLE `user_position` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `workflow_action_log`
--

DROP TABLE IF EXISTS `workflow_action_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `workflow_action_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `instanceId` int(11) NOT NULL,
  `stepId` int(11) NOT NULL,
  `actionType` enum('APPROVE','REJECT','TRANSFER','CANCEL','START','COMPLETE') NOT NULL,
  `actionByUserId` int(11) NOT NULL,
  `actionAt` datetime NOT NULL,
  `note` text DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  PRIMARY KEY (`id`),
  KEY `FK_ca7a46d0d2e04043e349b7fad16` (`instanceId`),
  KEY `FK_9fe32701710d73dc858a5fde318` (`stepId`),
  KEY `FK_45f1521fb5b620b890f4d1d1cec` (`actionByUserId`),
  CONSTRAINT `FK_45f1521fb5b620b890f4d1d1cec` FOREIGN KEY (`actionByUserId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_9fe32701710d73dc858a5fde318` FOREIGN KEY (`stepId`) REFERENCES `workflow_step` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_ca7a46d0d2e04043e349b7fad16` FOREIGN KEY (`instanceId`) REFERENCES `workflow_instance` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workflow_action_log`
--

LOCK TABLES `workflow_action_log` WRITE;
/*!40000 ALTER TABLE `workflow_action_log` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `workflow_action_log` VALUES
(1,1,1,'START',4,'2024-01-15 09:00:00','Bắt đầu quy trình phê duyệt','2025-08-17 19:06:26.104438',NULL),
(2,1,2,'TRANSFER',7,'2024-01-16 14:30:00','Đã tạo văn bản và chuyển cho trưởng phòng','2025-08-17 19:06:26.110494',NULL),
(3,2,1,'START',5,'2024-01-20 08:00:00','Bắt đầu quy trình phê duyệt tài chính','2025-08-17 19:06:26.115089',NULL),
(4,2,2,'TRANSFER',7,'2024-01-21 10:15:00','Đã tạo báo cáo tài chính','2025-08-17 19:06:26.118573',NULL),
(5,2,3,'APPROVE',4,'2024-01-22 16:45:00','Trưởng phòng đã phê duyệt','2025-08-17 19:06:26.121607',NULL),
(6,3,1,'START',6,'2024-01-25 09:30:00','Bắt đầu quy trình phê duyệt đào tạo','2025-08-17 19:06:26.125822',NULL),
(7,3,2,'TRANSFER',7,'2024-01-26 11:20:00','Đã tạo kế hoạch đào tạo','2025-08-17 19:06:26.130350',NULL),
(8,3,3,'APPROVE',5,'2024-01-27 15:10:00','Trưởng phòng đã phê duyệt','2025-08-17 19:06:26.134127',NULL),
(9,4,1,'START',7,'2024-01-10 08:00:00','Bắt đầu quy trình phê duyệt','2025-08-17 19:06:26.136353',NULL),
(10,4,2,'TRANSFER',7,'2024-01-11 10:30:00','Đã tạo biên bản họp','2025-08-17 19:06:26.138477',NULL),
(11,4,3,'APPROVE',4,'2024-01-11 14:15:00','Trưởng phòng đã phê duyệt','2025-08-17 19:06:26.142980',NULL),
(12,4,4,'APPROVE',2,'2024-01-12 09:45:00','Hiệu trưởng đã phê duyệt','2025-08-17 19:06:26.147911',NULL),
(13,4,5,'COMPLETE',7,'2024-01-12 16:00:00','Quy trình đã hoàn thành','2025-08-17 19:06:26.150919',NULL),
(14,5,1,'START',4,'2024-02-01 08:30:00','Bắt đầu quy trình phê duyệt hợp đồng','2025-08-17 19:06:26.153001',NULL),
(15,1,1,'APPROVE',2,'2025-08-17 15:32:29','Tốt','2025-08-17 22:32:29.921714','{\"documentId\":3}'),
(16,1,1,'APPROVE',2,'2025-08-17 15:33:12',NULL,'2025-08-17 22:33:12.990073','{\"documentId\":3}'),
(17,1,1,'APPROVE',2,'2025-08-17 15:34:15',NULL,'2025-08-17 22:34:15.608292','{\"documentId\":3}'),
(18,6,1,'START',7,'2025-08-17 15:55:01','Workflow instance started','2025-08-17 22:55:01.848249','\"\"');
/*!40000 ALTER TABLE `workflow_action_log` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `workflow_instance`
--

DROP TABLE IF EXISTS `workflow_instance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `workflow_instance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `templateId` int(11) NOT NULL,
  `documentId` int(11) NOT NULL,
  `currentStepId` int(11) DEFAULT NULL,
  `status` enum('IN_PROGRESS','COMPLETED','CANCELLED','REJECTED') NOT NULL DEFAULT 'IN_PROGRESS',
  `createdByUserId` int(11) NOT NULL,
  `notes` text DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`),
  KEY `FK_9131b3f6a78a4a6c2262ad531bc` (`templateId`),
  KEY `FK_77ae8e81f7bdf5cec49bea1ff87` (`createdByUserId`),
  KEY `FK_eba40b371c4cbc903eb44be3214` (`currentStepId`),
  CONSTRAINT `FK_77ae8e81f7bdf5cec49bea1ff87` FOREIGN KEY (`createdByUserId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_9131b3f6a78a4a6c2262ad531bc` FOREIGN KEY (`templateId`) REFERENCES `workflow_template` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_eba40b371c4cbc903eb44be3214` FOREIGN KEY (`currentStepId`) REFERENCES `workflow_step` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workflow_instance`
--

LOCK TABLES `workflow_instance` WRITE;
/*!40000 ALTER TABLE `workflow_instance` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `workflow_instance` VALUES
(1,1,1,2,'IN_PROGRESS',4,NULL,'2025-08-17 19:06:26.080286','2025-08-17 19:06:26.080286'),
(2,2,2,3,'IN_PROGRESS',5,NULL,'2025-08-17 19:06:26.086063','2025-08-17 19:06:26.086063'),
(3,3,3,4,'IN_PROGRESS',6,NULL,'2025-08-17 19:06:26.088266','2025-08-17 19:06:26.088266'),
(4,1,4,5,'COMPLETED',7,NULL,'2025-08-17 19:06:26.091261','2025-08-17 19:06:26.091261'),
(5,2,5,2,'IN_PROGRESS',4,NULL,'2025-08-17 19:06:26.095858','2025-08-17 19:06:26.095858'),
(6,1,7,1,'IN_PROGRESS',7,'Auto-created workflow for INTERNAL document: Tạo văn bản quyết định thành lập câu lạc bộ IT','2025-08-17 22:55:01.841730','2025-08-17 22:55:01.841730');
/*!40000 ALTER TABLE `workflow_instance` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `workflow_notification`
--

DROP TABLE IF EXISTS `workflow_notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `workflow_notification` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` enum('WORKFLOW_ASSIGNED','WORKFLOW_COMPLETED','WORKFLOW_REJECTED','WORKFLOW_DEADLINE_APPROACHING','WORKFLOW_OVERDUE','DOCUMENT_ASSIGNED','DOCUMENT_UPDATED') NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text DEFAULT NULL,
  `status` enum('UNREAD','READ','ARCHIVED') NOT NULL DEFAULT 'UNREAD',
  `recipientUserId` int(11) NOT NULL,
  `workflowInstanceId` int(11) DEFAULT NULL,
  `documentId` int(11) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`),
  KEY `FK_d2b260aa5a89357747233cb2951` (`recipientUserId`),
  KEY `FK_c77bd01fa09130bb5e30408691a` (`workflowInstanceId`),
  CONSTRAINT `FK_c77bd01fa09130bb5e30408691a` FOREIGN KEY (`workflowInstanceId`) REFERENCES `workflow_instance` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_d2b260aa5a89357747233cb2951` FOREIGN KEY (`recipientUserId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workflow_notification`
--

LOCK TABLES `workflow_notification` WRITE;
/*!40000 ALTER TABLE `workflow_notification` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `workflow_notification` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `workflow_step`
--

DROP TABLE IF EXISTS `workflow_step`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `workflow_step` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `type` enum('START','APPROVAL','TRANSFER','END') NOT NULL,
  `assignedRole` varchar(255) NOT NULL,
  `orderNumber` int(11) NOT NULL,
  `nextStepId` int(11) DEFAULT NULL,
  `isActive` tinyint(4) NOT NULL DEFAULT 1,
  `templateId` int(11) NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`),
  KEY `FK_24b68172c989d47d0e5ee5b713a` (`templateId`),
  CONSTRAINT `FK_24b68172c989d47d0e5ee5b713a` FOREIGN KEY (`templateId`) REFERENCES `workflow_template` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workflow_step`
--

LOCK TABLES `workflow_step` WRITE;
/*!40000 ALTER TABLE `workflow_step` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `workflow_step` VALUES
(1,'Giao việc','Bước giao việc cho người thực hiện','START','DEPARTMENT_STAFF',1,NULL,1,1,'2025-08-17 19:06:25.973175','2025-08-17 19:06:25.973175'),
(2,'Tạo văn bản','Người được giao việc tạo văn bản','TRANSFER','CLERK',2,NULL,1,1,'2025-08-17 19:06:25.980841','2025-08-17 19:06:25.980841'),
(3,'Phê duyệt trưởng phòng','Trưởng phòng phê duyệt văn bản','APPROVAL','DEPARTMENT_STAFF',3,NULL,1,1,'2025-08-17 19:06:25.987377','2025-08-17 19:06:25.987377'),
(4,'Phê duyệt lãnh đạo','Lãnh đạo cấp cao phê duyệt','APPROVAL','SYSTEM_ADMIN',4,NULL,1,1,'2025-08-17 19:06:25.992439','2025-08-17 19:06:25.992439'),
(5,'Hoàn thành','Văn bản được phê duyệt và hoàn thành','END','CLERK',5,NULL,1,1,'2025-08-17 19:06:25.997840','2025-08-17 19:06:25.997840'),
(6,'Giao việc','Bước giao việc cho người thực hiện','START','DEPARTMENT_STAFF',1,NULL,1,2,'2025-08-17 19:06:26.004663','2025-08-17 19:06:26.004663'),
(7,'Tạo văn bản','Người được giao việc tạo văn bản','TRANSFER','CLERK',2,NULL,1,2,'2025-08-17 19:06:26.009046','2025-08-17 19:06:26.009046'),
(8,'Phê duyệt trưởng phòng','Trưởng phòng phê duyệt văn bản','APPROVAL','DEPARTMENT_STAFF',3,NULL,1,2,'2025-08-17 19:06:26.013438','2025-08-17 19:06:26.013438'),
(9,'Phê duyệt lãnh đạo','Lãnh đạo cấp cao phê duyệt','APPROVAL','SYSTEM_ADMIN',4,NULL,1,2,'2025-08-17 19:06:26.017509','2025-08-17 19:06:26.017509'),
(10,'Hoàn thành','Văn bản được phê duyệt và hoàn thành','END','CLERK',5,NULL,1,2,'2025-08-17 19:06:26.020224','2025-08-17 19:06:26.020224'),
(11,'Giao việc','Bước giao việc cho người thực hiện','START','DEPARTMENT_STAFF',1,NULL,1,3,'2025-08-17 19:06:26.027833','2025-08-17 19:06:26.027833'),
(12,'Tạo văn bản','Người được giao việc tạo văn bản','TRANSFER','CLERK',2,NULL,1,3,'2025-08-17 19:06:26.032057','2025-08-17 19:06:26.032057'),
(13,'Phê duyệt trưởng phòng','Trưởng phòng phê duyệt văn bản','APPROVAL','DEPARTMENT_STAFF',3,NULL,1,3,'2025-08-17 19:06:26.034700','2025-08-17 19:06:26.034700'),
(14,'Phê duyệt lãnh đạo','Lãnh đạo cấp cao phê duyệt','APPROVAL','SYSTEM_ADMIN',4,NULL,1,3,'2025-08-17 19:06:26.038031','2025-08-17 19:06:26.038031'),
(15,'Hoàn thành','Văn bản được phê duyệt và hoàn thành','END','CLERK',5,NULL,1,3,'2025-08-17 19:06:26.042319','2025-08-17 19:06:26.042319');
/*!40000 ALTER TABLE `workflow_step` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `workflow_template`
--

DROP TABLE IF EXISTS `workflow_template`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `workflow_template` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `isActive` tinyint(4) NOT NULL DEFAULT 1,
  `createdByUserId` int(11) NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  PRIMARY KEY (`id`),
  KEY `FK_217653ca52c3d0dc889e72e5bf0` (`createdByUserId`),
  CONSTRAINT `FK_217653ca52c3d0dc889e72e5bf0` FOREIGN KEY (`createdByUserId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workflow_template`
--

LOCK TABLES `workflow_template` WRITE;
/*!40000 ALTER TABLE `workflow_template` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `workflow_template` VALUES
(1,'Quy trình phê duyệt văn bản thông thường','Quy trình phê duyệt cho các văn bản hành chính thông thường',1,1,'2025-08-17 19:06:25.954454','2025-08-17 19:06:25.954454'),
(2,'Quy trình phê duyệt văn bản tài chính','Quy trình phê duyệt cho các văn bản liên quan đến tài chính',1,1,'2025-08-17 19:06:25.960924','2025-08-17 19:06:25.960924'),
(3,'Quy trình phê duyệt văn bản đào tạo','Quy trình phê duyệt cho các văn bản liên quan đến đào tạo',1,1,'2025-08-17 19:06:25.964917','2025-08-17 19:06:25.964917');
/*!40000 ALTER TABLE `workflow_template` ENABLE KEYS */;
UNLOCK TABLES;
commit;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2025-08-18 11:51:14
