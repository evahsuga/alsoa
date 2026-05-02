<?php
/**
 * スキーママイグレーション
 * monthly_reports テーブルに不足カラムを追加する（一度だけ実行）
 */

require_once __DIR__ . '/config.php';
requireAuth();

$db = getDB();
$results = [];

$alterStatements = [
    'purchase_invoice' => 'ALTER TABLE monthly_reports ADD COLUMN purchase_invoice INT NOT NULL DEFAULT 0',
    'sales_bonus'      => 'ALTER TABLE monthly_reports ADD COLUMN sales_bonus      INT NOT NULL DEFAULT 0',
    'expenses'         => 'ALTER TABLE monthly_reports ADD COLUMN expenses         INT NOT NULL DEFAULT 0',
    'inventory'        => 'ALTER TABLE monthly_reports ADD COLUMN inventory        INT NOT NULL DEFAULT 0',
    'purchase_count'   => 'ALTER TABLE monthly_reports ADD COLUMN purchase_count   TEXT',
];

foreach ($alterStatements as $column => $sql) {
    try {
        $db->exec($sql);
        $results[$column] = 'added';
    } catch (PDOException $e) {
        // カラムが既に存在する場合はスキップ
        if (strpos($e->getMessage(), 'Duplicate column') !== false
            || strpos($e->getMessage(), 'already exists') !== false) {
            $results[$column] = 'already exists';
        } else {
            $results[$column] = 'error: ' . $e->getMessage();
        }
    }
}

jsonResponse([
    'success' => true,
    'message' => 'スキーママイグレーション完了',
    'results' => $results
]);
