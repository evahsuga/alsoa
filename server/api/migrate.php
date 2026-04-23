<?php
/**
 * データ移行API
 * 化粧品販売管理アプリ - サーバー版
 *
 * LocalStorage版のJSONバックアップからDBへ移行するためのツール
 */

require_once __DIR__ . '/config.php';
requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('POSTメソッドを使用してください', 405);
}

$data = getRequestBody();

if (empty($data)) {
    errorResponse('移行データがありません。JSONバックアップファイルの内容を送信してください。');
}

$db = getDB();

// 移行前の件数確認
$existingCounts = [
    'customers' => (int)$db->query('SELECT COUNT(*) FROM customers')->fetchColumn(),
    'sales' => (int)$db->query('SELECT COUNT(*) FROM sales')->fetchColumn(),
    'monthlyReports' => (int)$db->query('SELECT COUNT(*) FROM monthly_reports')->fetchColumn()
];

// 既存データがある場合は警告
if ($existingCounts['customers'] > 0 || $existingCounts['sales'] > 0) {
    $overwrite = $_GET['overwrite'] ?? 'false';
    if ($overwrite !== 'true') {
        jsonResponse([
            'warning' => true,
            'message' => '既存のデータがあります。上書きする場合は ?overwrite=true を追加してください。',
            'existingCounts' => $existingCounts
        ]);
        exit;
    }
}

$db->beginTransaction();

try {
    // 既存データを削除（上書きモード）
    $db->exec('DELETE FROM sale_items');
    $db->exec('DELETE FROM sales');
    $db->exec('DELETE FROM customers');
    $db->exec('DELETE FROM monthly_reports');
    $db->exec('DELETE FROM custom_products');

    $importedCounts = [
        'customers' => 0,
        'sales' => 0,
        'saleItems' => 0,
        'monthlyReports' => 0,
        'customProducts' => 0
    ];

    // ========================================
    // 顧客データの移行
    // ========================================
    if (!empty($data['customers'])) {
        $stmt = $db->prepare('INSERT INTO customers (id, name, rank, is_app_user) VALUES (?, ?, ?, ?)');

        foreach ($data['customers'] as $customer) {
            $stmt->execute([
                $customer['id'],
                $customer['name'],
                $customer['rank'] ?? 'C',
                ($customer['isAppUser'] ?? false) ? 1 : 0
            ]);
            $importedCounts['customers']++;
        }
    }

    // ========================================
    // 売上データの移行
    // ========================================
    if (!empty($data['sales'])) {
        $stmtSale = $db->prepare('
            INSERT INTO sales (id, sale_date, customer_name, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
        ');
        $stmtItem = $db->prepare('
            INSERT INTO sale_items (sale_id, product_code, product_name, price, quantity, category)
            VALUES (?, ?, ?, ?, ?, ?)
        ');

        foreach ($data['sales'] as $sale) {
            // 日付のフォーマット変換（必要に応じて）
            $saleDate = $sale['date'];

            // createdAt の処理
            $createdAt = null;
            if (!empty($sale['createdAt'])) {
                $createdAt = date('Y-m-d H:i:s', strtotime($sale['createdAt']));
            }

            // updatedAt の処理
            $updatedAt = null;
            if (!empty($sale['updatedAt'])) {
                $updatedAt = date('Y-m-d H:i:s', strtotime($sale['updatedAt']));
            }

            $stmtSale->execute([
                $sale['id'],
                $saleDate,
                $sale['customerName'],
                $createdAt,
                $updatedAt
            ]);
            $importedCounts['sales']++;

            // 明細の移行
            if (!empty($sale['items'])) {
                foreach ($sale['items'] as $item) {
                    $stmtItem->execute([
                        $sale['id'],
                        $item['code'] ?? '',
                        $item['name'] ?? '',
                        $item['price'] ?? 0,
                        $item['quantity'] ?? 1,
                        $item['category'] ?? ''
                    ]);
                    $importedCounts['saleItems']++;
                }
            }
        }
    }

    // ========================================
    // 月次レポートの移行
    // ========================================
    if (!empty($data['monthlyReports'])) {
        $stmt = $db->prepare('
            INSERT INTO monthly_reports
                (year, month, target_sales, result_sales, purchase, self_use, actions, after_follow, met_count, three_step_sales)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ');

        foreach ($data['monthlyReports'] as $report) {
            $stmt->execute([
                $report['year'],
                $report['month'],
                $report['targetSales'] ?? 0,
                $report['resultSales'] ?? 0,
                $report['purchase'] ?? 0,
                $report['selfUse'] ?? 0,
                isset($report['actions']) ? json_encode($report['actions'], JSON_UNESCAPED_UNICODE) : null,
                isset($report['afterFollow']) ? json_encode($report['afterFollow'], JSON_UNESCAPED_UNICODE) : null,
                $report['metCount'] ?? 0,
                isset($report['threeStepSales']) ? json_encode($report['threeStepSales'], JSON_UNESCAPED_UNICODE) : null
            ]);
            $importedCounts['monthlyReports']++;
        }
    }

    // ========================================
    // カスタム製品の移行
    // ========================================
    if (!empty($data['customProducts'])) {
        $stmt = $db->prepare('
            INSERT INTO custom_products (id, category_key, code, name, price, category)
            VALUES (?, ?, ?, ?, ?, ?)
        ');

        foreach ($data['customProducts'] as $categoryKey => $products) {
            if (is_array($products)) {
                foreach ($products as $product) {
                    $stmt->execute([
                        $product['id'],
                        $categoryKey,
                        $product['code'] ?? 'CUSTOM-' . $product['id'],
                        $product['name'],
                        $product['price'],
                        $product['category'] ?? 'other'
                    ]);
                    $importedCounts['customProducts']++;
                }
            }
        }
    }

    // ========================================
    // 設定の移行
    // ========================================
    if (isset($data['displayCutoff'])) {
        $stmt = $db->prepare('
            INSERT INTO app_settings (setting_key, setting_value)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE setting_value = ?
        ');
        $stmt->execute(['display_cutoff', $data['displayCutoff'], $data['displayCutoff']]);
    }

    $db->commit();

    jsonResponse([
        'success' => true,
        'message' => 'データ移行が完了しました',
        'importedCounts' => $importedCounts,
        'sourceVersion' => $data['version'] ?? 'unknown'
    ]);

} catch (Exception $e) {
    $db->rollBack();
    error_log('Migration failed: ' . $e->getMessage());
    errorResponse('データ移行に失敗しました: ' . $e->getMessage(), 500);
}
