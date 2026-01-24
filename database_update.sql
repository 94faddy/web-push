-- Web Push Multi-Admin Database Update
-- Run this SQL to update your existing database

-- 1. Add token field to admins table for unique URL
ALTER TABLE `admins` 
ADD COLUMN `token` VARCHAR(36) DEFAULT NULL AFTER `password_hash`,
ADD COLUMN `email` VARCHAR(255) DEFAULT NULL AFTER `display_name`,
ADD UNIQUE KEY `token` (`token`);

-- Update existing admin with a token
UPDATE `admins` SET `token` = UUID() WHERE `token` IS NULL;

-- 2. Add admin_id to subscribers table
ALTER TABLE `subscribers` 
ADD COLUMN `admin_id` INT DEFAULT NULL AFTER `id`,
ADD KEY `idx_admin_id` (`admin_id`),
ADD CONSTRAINT `subscribers_admin_fk` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL;

-- 3. Add admin_id to push_logs table
ALTER TABLE `push_logs` 
ADD COLUMN `admin_id` INT DEFAULT NULL AFTER `id`,
ADD KEY `idx_admin_id` (`admin_id`),
ADD CONSTRAINT `push_logs_admin_fk` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL;

-- 4. Create click_tracking table
CREATE TABLE IF NOT EXISTS `click_tracking` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `push_log_id` INT NOT NULL,
  `subscriber_id` INT DEFAULT NULL,
  `admin_id` INT DEFAULT NULL,
  `clicked_url` VARCHAR(500) DEFAULT NULL,
  `user_agent` VARCHAR(500) DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `device_type` ENUM('desktop','mobile','tablet') DEFAULT 'desktop',
  `browser` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_push_log_id` (`push_log_id`),
  KEY `idx_admin_id` (`admin_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `click_tracking_push_fk` FOREIGN KEY (`push_log_id`) REFERENCES `push_logs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `click_tracking_admin_fk` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Create templates table
CREATE TABLE IF NOT EXISTS `templates` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `admin_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `body` TEXT NOT NULL,
  `icon` VARCHAR(500) DEFAULT NULL,
  `image` VARCHAR(500) DEFAULT NULL,
  `url` VARCHAR(500) DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT '1',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_admin_id` (`admin_id`),
  CONSTRAINT `templates_admin_fk` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Create admin_sessions table for login tracking
CREATE TABLE IF NOT EXISTS `admin_sessions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `admin_id` INT NOT NULL,
  `session_token` VARCHAR(255) NOT NULL,
  `expires_at` TIMESTAMP NOT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` VARCHAR(500) DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `session_token` (`session_token`),
  KEY `idx_admin_id` (`admin_id`),
  KEY `idx_expires_at` (`expires_at`),
  CONSTRAINT `sessions_admin_fk` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Add total_clicks to push_logs
ALTER TABLE `push_logs` 
ADD COLUMN `total_clicks` INT DEFAULT '0' AFTER `total_failed`;

-- 8. Update existing subscribers and push_logs with admin_id = 1 (first admin)
UPDATE `subscribers` SET `admin_id` = 1 WHERE `admin_id` IS NULL;
UPDATE `push_logs` SET `admin_id` = 1 WHERE `admin_id` IS NULL;
