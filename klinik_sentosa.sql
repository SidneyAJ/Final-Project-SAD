-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 25, 2025 at 04:26 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `klinik_sentosa`
--

-- --------------------------------------------------------

--
-- Table structure for table `appointments`
--

CREATE TABLE `appointments` (
  `id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `doctor_id` int(11) NOT NULL,
  `appointment_date` date NOT NULL,
  `appointment_time` time NOT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `appointments`
--

INSERT INTO `appointments` (`id`, `patient_id`, `doctor_id`, `appointment_date`, `appointment_time`, `status`, `notes`, `created_at`) VALUES
(6, 21, 2, '2025-11-25', '13:00:00', 'completed', 'saya lapar', '2025-11-24 15:25:30'),
(7, 21, 2, '2025-11-25', '10:00:00', 'cancelled', 'Lapar', '2025-11-24 16:21:36'),
(8, 21, 2, '2025-11-26', '15:00:00', 'completed', '', '2025-11-24 16:42:52'),
(9, 21, 2, '2025-11-25', '13:00:00', 'confirmed', 'sakit kepala', '2025-11-24 19:12:54'),
(10, 21, 2, '2025-11-25', '10:00:00', 'no_show', '', '2025-11-24 19:17:32'),
(11, 21, 2, '2025-11-25', '14:00:00', 'completed', '11', '2025-11-24 20:09:49'),
(12, 21, 2, '2025-11-25', '11:00:00', 'completed', '12', '2025-11-24 20:15:02'),
(13, 21, 2, '2025-11-25', '16:00:00', 'completed', 'er', '2025-11-24 20:23:53'),
(14, 21, 2, '2025-11-25', '15:00:00', 'completed', 'aaaa', '2025-11-24 20:33:44'),
(15, 21, 2, '2025-11-25', '06:54:50', 'confirmed', 'Test Walk-in', '2025-11-24 22:54:50'),
(16, 21, 2, '2025-11-25', '07:08:48', 'confirmed', 'Test Walk-in', '2025-11-24 23:08:48'),
(17, 21, 2, '2025-11-25', '07:13:03', 'completed', 'Walk-in Queue', '2025-11-24 23:13:03'),
(18, 21, 2, '2025-11-25', '07:40:48', 'completed', 'Walk-in Queue', '2025-11-24 23:40:48'),
(19, 21, 2, '2025-11-25', '07:46:01', 'no_show', 'Walk-in Queue', '2025-11-24 23:46:01'),
(20, 21, 2, '2025-11-25', '07:47:04', 'no_show', 'Walk-in Queue', '2025-11-24 23:47:04'),
(21, 21, 2, '2025-11-25', '07:53:42', 'no_show', 'Walk-in Queue', '2025-11-24 23:53:42'),
(22, 21, 2, '2025-11-25', '07:57:28', 'no_show', 'Walk-in Queue', '2025-11-24 23:57:28'),
(23, 23, 2, '2025-11-25', '09:00:00', 'completed', 'Sakit Kepala', '2025-11-25 00:18:04'),
(24, 23, 2, '2025-11-25', '10:02:09', 'completed', 'Walk-in Queue', '2025-11-25 02:02:09'),
(25, 23, 2, '2025-11-25', '10:08:47', 'completed', 'Walk-in Queue', '2025-11-25 02:08:47'),
(26, 23, 2, '2025-11-25', '10:17:54', 'completed', 'Walk-in Queue', '2025-11-25 02:17:54'),
(27, 23, 2, '2025-11-25', '10:26:53', 'completed', 'Walk-in Queue', '2025-11-25 02:26:53');

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `table_name` varchar(100) DEFAULT NULL,
  `record_id` int(11) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `doctors`
--

CREATE TABLE `doctors` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `specialization` varchar(255) DEFAULT NULL,
  `license_number` varchar(100) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `doctors`
--

INSERT INTO `doctors` (`id`, `user_id`, `full_name`, `specialization`, `license_number`, `phone`) VALUES
(2, 31, 'Dr. Steven Matar', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `medical_records`
--

CREATE TABLE `medical_records` (
  `id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `doctor_id` int(11) NOT NULL,
  `appointment_id` int(11) DEFAULT NULL,
  `diagnosis` text NOT NULL,
  `treatment` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `medical_records`
--

INSERT INTO `medical_records` (`id`, `patient_id`, `doctor_id`, `appointment_id`, `diagnosis`, `treatment`, `notes`, `created_at`, `updated_at`) VALUES
(1, 21, 2, 17, 'Lapar', 'Banyak Berdoa', 'mantap', '2025-11-24 23:15:17', '2025-11-24 23:15:17'),
(2, 23, 2, 23, 'Flu', 'Istirahat', 'Istirahat', '2025-11-25 00:23:51', '2025-11-25 00:23:51');

-- --------------------------------------------------------

--
-- Table structure for table `medicines`
--

CREATE TABLE `medicines` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `unit` enum('tablet','kaplet','kapsul','sachet','botol','ampul','tube','pcs','ml','mg') DEFAULT 'tablet',
  `price` decimal(10,2) DEFAULT 0.00,
  `minimum_stock` int(11) DEFAULT 10,
  `category` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `medicines`
--

INSERT INTO `medicines` (`id`, `name`, `description`, `stock`, `unit`, `price`, `minimum_stock`, `category`, `created_at`, `updated_at`) VALUES
(1, 'Paracetamol 500mg', 'Obat pereda nyeri dan penurun demam', 500, 'tablet', 500.00, 50, 'Analgesik', '2025-11-25 03:01:49', '2025-11-25 03:01:49'),
(2, 'Amoxicillin 500mg', 'Antibiotik untuk infeksi bakteri', 300, 'kaplet', 2000.00, 30, 'Antibiotik', '2025-11-25 03:01:49', '2025-11-25 03:01:49'),
(3, 'OBH Batuk', 'Sirup obat batuk', 100, 'botol', 15000.00, 20, 'Batuk & Flu', '2025-11-25 03:01:49', '2025-11-25 03:01:49'),
(4, 'Antasida', 'Obat maag', 200, 'sachet', 1500.00, 50, 'Pencernaan', '2025-11-25 03:01:49', '2025-11-25 03:01:49'),
(5, 'Vitamin C 1000mg', 'Suplemen vitamin C', 400, 'tablet', 800.00, 100, 'Vitamin', '2025-11-25 03:01:49', '2025-11-25 03:01:49'),
(6, 'Betadine Solution', 'Antiseptik luka', 50, 'botol', 25000.00, 10, 'Antiseptik', '2025-11-25 03:01:49', '2025-11-25 03:01:49'),
(7, 'Salbutamol Inhaler', 'Obat asma', 30, 'pcs', 45000.00, 5, 'Pernapasan', '2025-11-25 03:01:49', '2025-11-25 03:01:49'),
(8, 'Omeprazole 20mg', 'Obat lambung', 250, 'kapsul', 3000.00, 30, 'Pencernaan', '2025-11-25 03:01:49', '2025-11-25 03:01:49'),
(9, 'CTM 4mg', 'Antihistamin untuk alergi', 350, 'tablet', 300.00, 50, 'Alergi', '2025-11-25 03:01:49', '2025-11-25 03:01:49'),
(10, 'Diapet', 'Obat diare', 180, 'tablet', 1200.00, 50, 'Pencernaan', '2025-11-25 03:01:49', '2025-11-25 03:01:49');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `patients`
--

CREATE TABLE `patients` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `nik` varchar(20) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `blood_type` varchar(10) DEFAULT NULL,
  `allergies` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `patients`
--

INSERT INTO `patients` (`id`, `user_id`, `full_name`, `nik`, `date_of_birth`, `gender`, `phone`, `address`, `blood_type`, `allergies`) VALUES
(14, 20, 'Testing User', '1234567890123456', '1995-05-15', 'laki-laki', '081298765432', 'Jl. Test Baru No. 5', 'A', NULL),
(16, 22, 'Debug User', '9999888877776666', '2000-01-01', 'laki-laki', '081234567899', 'Debug St', 'O', NULL),
(21, 27, 'Sidney Legi', '1213123123131312', '2025-11-24', 'laki-laki', '08112287222', 'jawb', 'O', NULL),
(22, 29, '', '1213123123132', '2025-11-24', 'L', '0809913123', 'admin', NULL, NULL),
(23, 32, 'Darek Watak', '1213123132131313', '2025-11-05', 'laki-laki', '08112287223123', 'Manado', 'A', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('pending','paid','cancelled') DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `prescriptions`
--

CREATE TABLE `prescriptions` (
  `id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `doctor_id` int(11) NOT NULL,
  `status` enum('pending','verified','completed','cancelled') DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `total_price` decimal(10,2) DEFAULT 0.00,
  `processed_by` int(11) DEFAULT NULL,
  `processed_at` timestamp NULL DEFAULT NULL,
  `appointment_id` int(11) DEFAULT NULL,
  `verification_status` enum('pending','verified','rejected') DEFAULT 'pending',
  `verified_by` int(11) DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `dispensed` tinyint(1) DEFAULT 0,
  `dispensed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `prescription_items`
--

CREATE TABLE `prescription_items` (
  `id` int(11) NOT NULL,
  `prescription_id` int(11) NOT NULL,
  `medicine_id` int(11) DEFAULT NULL,
  `medicine_name` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `dosage` varchar(100) DEFAULT NULL,
  `frequency` varchar(100) DEFAULT NULL,
  `duration` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `queues`
--

CREATE TABLE `queues` (
  `id` int(11) NOT NULL,
  `appointment_id` int(11) DEFAULT NULL,
  `patient_name` varchar(255) NOT NULL,
  `queue_number` int(11) NOT NULL,
  `status` enum('waiting','serving','completed','skipped') DEFAULT 'waiting',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `queues`
--

INSERT INTO `queues` (`id`, `appointment_id`, `patient_name`, `queue_number`, `status`, `created_at`) VALUES
(3, 9, 'Sidney Legi', 1, 'completed', '2025-11-24 22:23:29'),
(4, 17, 'Sidney Legi', 2, 'completed', '2025-11-24 23:13:03'),
(5, 18, 'Sidney Legi', 3, 'completed', '2025-11-24 23:40:48'),
(6, 19, 'Sidney Legi', 4, '', '2025-11-24 23:46:01'),
(7, 20, 'Sidney Legi', 5, '', '2025-11-24 23:47:04'),
(8, 21, 'Sidney Legi', 6, '', '2025-11-24 23:53:42'),
(9, 22, 'Sidney Legi', 7, '', '2025-11-24 23:57:28'),
(10, 23, 'Darek Watak', 8, 'completed', '2025-11-25 00:18:04'),
(11, 24, 'Darek Watak', 9, 'completed', '2025-11-25 02:02:09'),
(12, 25, 'Darek Watak', 10, 'completed', '2025-11-25 02:08:47'),
(13, 26, 'Darek Watak', 11, 'completed', '2025-11-25 02:17:54'),
(14, 27, 'Darek Watak', 12, 'completed', '2025-11-25 02:26:53');

-- --------------------------------------------------------

--
-- Table structure for table `stock_history`
--

CREATE TABLE `stock_history` (
  `id` int(11) NOT NULL,
  `medicine_id` int(11) NOT NULL,
  `change_amount` int(11) NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `prescription_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `username` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `username`, `password_hash`, `role`, `name`, `created_at`) VALUES
(1, 'admin@email.com', NULL, '$2b$10$3HO5HNcHNQe2QMdikHJzn.Db6E41gukNPJHMc3MCJhWcttC0EYeqe', 'admin', 'Administrator', '2025-11-22 10:16:39'),
(17, 'nurse@test.com', NULL, '$2b$10$3HO5HNcHNQe2QMdikHJzn.Db6E41gukNPJHMc3MCJhWcttC0EYeqe', 'nurse', 'Ns. Ratna Sari', '2025-11-22 20:59:39'),
(18, 'pharmacist@test.com', NULL, '$2b$10$3HO5HNcHNQe2QMdikHJzn.Db6E41gukNPJHMc3MCJhWcttC0EYeqe', 'pharmacist', 'Apt. Siti Aminah', '2025-11-22 22:41:46'),
(19, 'owner@klinik.com', NULL, '$2b$10$3HO5HNcHNQe2QMdikHJzn.Db6E41gukNPJHMc3MCJhWcttC0EYeqe', 'owner', 'Stevanus Bojoh', '2025-11-22 23:13:24'),
(20, 'newtest@example.com', NULL, '$2b$10$3HO5HNcHNQe2QMdikHJzn.Db6E41gukNPJHMc3MCJhWcttC0EYeqe', 'patient', 'Testing User', '2025-11-23 06:31:04'),
(22, 'debug@test.com', NULL, '$2b$10$djs4VfBEvMFHlw/f0lP00e4WTAwVEUqOqyZm13PWkjiLLyFOEIiYW', 'patient', 'Debug User', '2025-11-23 06:54:02'),
(23, 'newpatient@test.com', NULL, '$2b$10$2etSeTSljPgBusfFEGtX4uAAvRz33u1nrYNqzTTS1WzuuQyZfpZEa', 'patient', 'New Patient', '2025-11-23 07:56:29'),
(24, 'testpatient@demo.com', NULL, '$2b$10$7iOMT2FGpJGhhze7j7P0b.rcus2SqjzTnbc7ngu9/RIFnU3A0u.OK', 'patient', 'Test PatientJl. Test No. 123Jl. Test No. 123, JakartaTest Patient', '2025-11-24 06:28:00'),
(27, 'Sidney@email.com', 'nior', '$2b$10$Vuyh7mJaUs34JtqpaqehmuPl8uTAFzpvUS0tfnVDmKRy2QYQYvu1S', 'patient', 'Sidney Legi', '2025-11-24 13:36:33'),
(29, 'lantang@email.com', NULL, '$2b$10$1Zp2sjiuM3XL09iKpSZSGuavQNyHhhOeID/zDGEDrBT/xCKKLk9A6', 'patient', 'Stevanus Lantang', '2025-11-24 14:08:26'),
(31, 'Steven@email.com', NULL, '$2b$10$HU8MH3Jqob.i5USnOlpANu5Nbgs3se6k3dIWNOtTEzJGI50h63cO2', 'doctor', 'Dr. Steven Matar', '2025-11-24 15:17:14'),
(32, 'derel@email.com', 'Derel', '$2b$10$zMCuzE22weR4ydx8c5sI2uv3BR4VywQbWDQ0wkIMZKjkWwpyJr0h6', 'patient', 'Darek Watak', '2025-11-25 00:17:01');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patient_id` (`patient_id`),
  ADD KEY `doctor_id` (`doctor_id`),
  ADD KEY `idx_date` (`appointment_date`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_timestamp` (`timestamp`),
  ADD KEY `idx_action` (`action`);

--
-- Indexes for table `doctors`
--
ALTER TABLE `doctors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `idx_specialization` (`specialization`);

--
-- Indexes for table `medical_records`
--
ALTER TABLE `medical_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patient_id` (`patient_id`),
  ADD KEY `doctor_id` (`doctor_id`),
  ADD KEY `appointment_id` (`appointment_id`);

--
-- Indexes for table `medicines`
--
ALTER TABLE `medicines`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_read` (`user_id`,`is_read`);

--
-- Indexes for table `patients`
--
ALTER TABLE `patients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD UNIQUE KEY `nik` (`nik`),
  ADD KEY `idx_full_name` (`full_name`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patient_id` (`patient_id`);

--
-- Indexes for table `prescriptions`
--
ALTER TABLE `prescriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patient_id` (`patient_id`),
  ADD KEY `doctor_id` (`doctor_id`),
  ADD KEY `fk_verified_by` (`verified_by`);

--
-- Indexes for table `prescription_items`
--
ALTER TABLE `prescription_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `prescription_id` (`prescription_id`),
  ADD KEY `medicine_id` (`medicine_id`);

--
-- Indexes for table `queues`
--
ALTER TABLE `queues`
  ADD PRIMARY KEY (`id`),
  ADD KEY `appointment_id` (`appointment_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `stock_history`
--
ALTER TABLE `stock_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `medicine_id` (`medicine_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `prescription_id` (`prescription_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `appointments`
--
ALTER TABLE `appointments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `doctors`
--
ALTER TABLE `doctors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `medical_records`
--
ALTER TABLE `medical_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `medicines`
--
ALTER TABLE `medicines`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `patients`
--
ALTER TABLE `patients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `prescriptions`
--
ALTER TABLE `prescriptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `prescription_items`
--
ALTER TABLE `prescription_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `queues`
--
ALTER TABLE `queues`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `stock_history`
--
ALTER TABLE `stock_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `appointments`
--
ALTER TABLE `appointments`
  ADD CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `doctors`
--
ALTER TABLE `doctors`
  ADD CONSTRAINT `doctors_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `medical_records`
--
ALTER TABLE `medical_records`
  ADD CONSTRAINT `medical_records_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`),
  ADD CONSTRAINT `medical_records_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`),
  ADD CONSTRAINT `medical_records_ibfk_3` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`);

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `patients`
--
ALTER TABLE `patients`
  ADD CONSTRAINT `patients_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`);

--
-- Constraints for table `prescriptions`
--
ALTER TABLE `prescriptions`
  ADD CONSTRAINT `fk_verified_by` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `prescriptions_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`),
  ADD CONSTRAINT `prescriptions_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`);

--
-- Constraints for table `prescription_items`
--
ALTER TABLE `prescription_items`
  ADD CONSTRAINT `prescription_items_ibfk_1` FOREIGN KEY (`prescription_id`) REFERENCES `prescriptions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `prescription_items_ibfk_2` FOREIGN KEY (`medicine_id`) REFERENCES `medicines` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `queues`
--
ALTER TABLE `queues`
  ADD CONSTRAINT `queues_ibfk_1` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `stock_history`
--
ALTER TABLE `stock_history`
  ADD CONSTRAINT `stock_history_ibfk_1` FOREIGN KEY (`medicine_id`) REFERENCES `medicines` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stock_history_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `stock_history_ibfk_3` FOREIGN KEY (`prescription_id`) REFERENCES `prescriptions` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
