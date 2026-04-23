-- ========================================
-- 化粧品販売管理アプリ データベース設計
-- MySQL/MariaDB 5.7+
-- エックスサーバー用
-- ========================================

-- 認証設定テーブル
CREATE TABLE app_config (
    config_key VARCHAR(50) PRIMARY KEY,
    config_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 顧客テーブル
CREATE TABLE customers (
    id BIGINT UNSIGNED PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    rank ENUM('A', 'B', 'C', 'D') DEFAULT 'C',
    is_app_user BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_rank (rank)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 売上ヘッダーテーブル
CREATE TABLE sales (
    id BIGINT UNSIGNED PRIMARY KEY,
    sale_date DATE NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,
    INDEX idx_sale_date (sale_date),
    INDEX idx_customer (customer_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 売上明細テーブル
CREATE TABLE sale_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sale_id BIGINT UNSIGNED NOT NULL,
    product_code VARCHAR(20) NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    price INT UNSIGNED NOT NULL,
    quantity INT UNSIGNED NOT NULL DEFAULT 1,
    category VARCHAR(20) NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    INDEX idx_sale_id (sale_id),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 月次レポートテーブル
CREATE TABLE monthly_reports (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    year INT UNSIGNED NOT NULL,
    month TINYINT UNSIGNED NOT NULL,
    target_sales INT UNSIGNED DEFAULT 0,
    result_sales INT UNSIGNED DEFAULT 0,
    purchase INT UNSIGNED DEFAULT 0,
    self_use INT UNSIGNED DEFAULT 0,
    actions JSON,
    after_follow JSON,
    met_count INT UNSIGNED DEFAULT 0,
    three_step_sales JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_year_month (year, month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- カスタム製品テーブル
CREATE TABLE custom_products (
    id BIGINT UNSIGNED PRIMARY KEY,
    category_key VARCHAR(30) NOT NULL,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(200) NOT NULL,
    price INT UNSIGNED NOT NULL,
    category VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_code (code),
    INDEX idx_category_key (category_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- アプリ設定テーブル
CREATE TABLE app_settings (
    setting_key VARCHAR(50) PRIMARY KEY,
    setting_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- 初期データ投入
-- ========================================

-- 初期パスワード設定（「arsoa2026」をハッシュ化した値）
-- 本番環境では必ず変更してください
INSERT INTO app_config (config_key, config_value) VALUES
('password_hash', '$2y$10$placeholder_change_this_in_production');

-- 表示設定の初期値
INSERT INTO app_settings (setting_key, setting_value) VALUES
('display_cutoff', NULL);
