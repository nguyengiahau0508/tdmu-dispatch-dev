-- Migration: Add profile fields to users table
-- Date: 2024-01-XX

-- Add new profile fields to users table
ALTER TABLE users 
ADD COLUMN phone_number VARCHAR(255) NULL,
ADD COLUMN address TEXT NULL,
ADD COLUMN date_of_birth VARCHAR(255) NULL,
ADD COLUMN gender VARCHAR(50) NULL,
ADD COLUMN job_title VARCHAR(255) NULL,
ADD COLUMN bio TEXT NULL,
ADD COLUMN website VARCHAR(500) NULL,
ADD COLUMN linkedin VARCHAR(255) NULL,
ADD COLUMN facebook VARCHAR(255) NULL,
ADD COLUMN twitter VARCHAR(255) NULL,
ADD COLUMN email_notifications BOOLEAN DEFAULT TRUE,
ADD COLUMN push_notifications BOOLEAN DEFAULT TRUE,
ADD COLUMN is_profile_public BOOLEAN DEFAULT TRUE,
ADD COLUMN last_login_at TIMESTAMP NULL,
ADD COLUMN login_count INT DEFAULT 0;

-- Create user_activities table
CREATE TABLE user_activities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    activity_type ENUM(
        'LOGIN', 'LOGOUT', 'PROFILE_UPDATE', 'PASSWORD_CHANGE', 
        'AVATAR_UPDATE', 'DOCUMENT_VIEW', 'DOCUMENT_CREATE', 
        'DOCUMENT_UPDATE', 'DOCUMENT_DELETE', 'TASK_ASSIGNED', 
        'TASK_COMPLETED', 'APPROVAL_REQUESTED', 'APPROVAL_APPROVED', 
        'APPROVAL_REJECTED'
    ) NOT NULL,
    description TEXT NULL,
    metadata JSON NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for better performance
CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_created_at ON user_activities(created_at);
CREATE INDEX idx_user_activities_type ON user_activities(activity_type);
