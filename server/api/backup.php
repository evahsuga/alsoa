<?php
/**
 * バックアップAPI
 * 化粧品販売管理アプリ - サーバー版
 */

require_once __DIR__ . '/config.php';
requireAuth();

$db = getDB();
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'export':
        exportBackup($db);
        break;
    case 'import':
        importBackup($db);
        break;
    default:
        errorResponse('不明なアクションです。export または import を指定してください', 400);
}

/**
 * バックアップエクスポート
 * 全データをJSON形式で出力
 */
function exportBackup($db) {
    // 顧客データ
    $stmt = $db->query('SELECT id, name, rank, is_app_user as isAppUser FROM customers ORDER BY name');
    $customers = $stmt->fetchAll();
    foreach ($customers as &$c) {
        $c['id'] = (int)$c['id'];
        $c['isAppUser'] = (bool)$c['isAppUser'];
    }

    // 売上データ
    $stmt = $db->query('SELECT id, sale_date, customer_name, created_at, updated_at FROM sales ORDER BY sale_date DESC');
    $salesRows = $stmt->fetchAll();

    $sales = [];
    foreach ($salesRows as $row) {
        $saleId = $row['id'];

        // 明細取得
        $stmt = $db->prepare('SELECT product_code, product_name, price, quantity, category FROM sale_items WHERE sale_id = ?');
        $stmt->execute([$saleId]);
        $items = $stmt->fetchAll();

        $formattedItems = [];
        foreach ($items as $item) {
            $formattedItems[] = [
                'code' => $item['product_code'],
                'name' => $item['product_name'],
                'price' => (int)$item['price'],
                'quantity' => (int)$item['quantity'],
                'category' => $item['category']
            ];
        }

        $sales[] = [
            'id' => (int)$row['id'],
            'date' => $row['sale_date'],
            'customerName' => $row['customer_name'],
            'items' => $formattedItems,
            'createdAt' => $row['created_at'],
            'updatedAt' => $row['updated_at']
        ];
    }

    // 月次レポート
    $stmt = $db->query('SELECT * FROM monthly_reports ORDER BY year DESC, month DESC');
    $reportRows = $stmt->fetchAll();

    $monthlyReports = [];
    foreach ($reportRows as $row) {
        $monthlyReports[] = [
            'year' => (int)$row['year'],
            'month' => (int)$row['month'],
            'targetSales' => (int)$row['target_sales'],
            'resultSales' => (int)$row['result_sales'],
            'purchase' => (int)$row['purchase'],
            'selfUse' => (int)$row['self_use'],
            'actions' => $row['actions'] ? json_decode($row['actions'], true) : null,
            'afterFollow' => $row['after_follow'] ? json_decode($row['after_follow'], true) : null,
            'metCount' => (int)$row['met_count'],
            'threeStepSales' => $row['three_step_sales'] ? json_decode($row['three_step_sales'], true) : null
        ];
    }

    // カスタム製品
    $stmt = $db->query('SELECT * FROM custom_products ORDER BY category_key, name');
    $productRows = $stmt->fetchAll();

    $customProducts = [
        'skincare' => [],
        'baseMakeup' => [],
        'hairBodyCare' => [],
        'healthcare' => [],
        'pointMakeup' => [],
        'other' => []
    ];

    foreach ($productRows as $row) {
        $categoryKey = $row['category_key'];
        if (!isset($customProducts[$categoryKey])) {
            $customProducts[$categoryKey] = [];
        }
        $customProducts[$categoryKey][] = [
            'id' => (int)$row['id'],
            'code' => $row['code'],
            'name' => $row['name'],
            'price' => (int)$row['price'],
            'category' => $row['category'],
            'isCustom' => true
        ];
    }

    // 設定
    $stmt = $db->query('SELECT setting_key, setting_value FROM app_settings');
    $settingRows = $stmt->fetchAll();

    $displayCutoff = null;
    foreach ($settingRows as $row) {
        if ($row['setting_key'] === 'display_cutoff') {
            $displayCutoff = $row['setting_value'];
        }
    }

    // バックアップデータ
    $backup = [
        'exportDate' => date('c'),
        'version' => '2.1',
        'customers' => $customers,
        'sales' => $sales,
        'monthlyReports' => $monthlyReports,
        'customProducts' => $customProducts,
        'displayCutoff' => $displayCutoff
    ];

    jsonResponse($backup);
}

/**
 * バックアップインポート
 * JSONデータからDB復元
 */
function importBackup($db) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        errorResponse('POSTメソッドを使用してください', 405);
    }

    $data = getRequestBody();

    if (empty($data)) {
        errorResponse('バックアップデータがありません');
    }

    $db->beginTransaction();

    try {
        // 既存データを削除
        $db->exec('DELETE FROM sale_items');
        $db->exec('DELETE FROM sales');
        $db->exec('DELETE FROM customers');
        $db->exec('DELETE FROM monthly_reports');
        $db->exec('DELETE FROM custom_products');
        $db->exec('DELETE FROM app_settings WHERE setting_key != "password_hash"');

        // 顧客インポート
        if (!empty($data['customers'])) {
            $stmt = $db->prepare('INSERT INTO customers (id, name, rank, is_app_user) VALUES (?, ?, ?, ?)');
            foreach ($data['customers'] as $customer) {
                $stmt->execute([
                    $customer['id'],
                    $customer['name'],
                    $customer['rank'] ?? 'C',
                    ($customer['isAppUser'] ?? false) ? 1 : 0
                ]);
            }
        }

        // 売上インポート
        if (!empty($data['sales'])) {
            $stmtSale = $db->prepare('INSERT INTO sales (id, sale_date, customer_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)');
            $stmtItem = $db->prepare('INSERT INTO sale_items (sale_id, product_code, product_name, price, quantity, category) VALUES (?, ?, ?, ?, ?, ?)');

            foreach ($data['sales'] as $sale) {
                $stmtSale->execute([
                    $sale['id'],
                    $sale['date'],
                    $sale['customerName'],
                    $sale['createdAt'] ?? date('Y-m-d H:i:s'),
                    $sale['updatedAt'] ?? null
                ]);

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
                    }
                }
            }
        }

        // 月次レポートインポート
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
            }
        }

        // カスタム製品インポート
        if (!empty($data['customProducts'])) {
            $stmt = $db->prepare('INSERT INTO custom_products (id, category_key, code, name, price, category) VALUES (?, ?, ?, ?, ?, ?)');

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
                    }
                }
            }
        }

        // 設定インポート
        if (isset($data['displayCutoff'])) {
            $stmt = $db->prepare('INSERT INTO app_settings (setting_key, setting_value) VALUES (?, ?)');
            $stmt->execute(['display_cutoff', $data['displayCutoff']]);
        }

        $db->commit();

        jsonResponse([
            'success' => true,
            'message' => 'バックアップを復元しました',
            'counts' => [
                'customers' => count($data['customers'] ?? []),
                'sales' => count($data['sales'] ?? []),
                'monthlyReports' => count($data['monthlyReports'] ?? [])
            ]
        ]);
    } catch (Exception $e) {
        $db->rollBack();
        error_log('Backup import failed: ' . $e->getMessage());
        errorResponse('バックアップの復元に失敗しました: ' . $e->getMessage(), 500);
    }
}
