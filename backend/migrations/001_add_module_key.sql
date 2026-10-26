-- Additive, rerunnable module discriminator for learning topics.
-- Existing rows receive the System Administration default; no IDs or content change.
SET @module_column_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'systemdb'
    AND TABLE_NAME = 'topics'
    AND COLUMN_NAME = 'module_key'
);
SET @module_column_ddl = IF(
  @module_column_exists = 0,
  'ALTER TABLE systemdb.topics ADD COLUMN module_key VARCHAR(50) NOT NULL DEFAULT ''system_administration''',
  'SELECT 1'
);
PREPARE module_column_stmt FROM @module_column_ddl;
EXECUTE module_column_stmt;
DEALLOCATE PREPARE module_column_stmt;

SET @module_index_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = 'systemdb'
    AND TABLE_NAME = 'topics'
    AND INDEX_NAME = 'idx_topics_module_order'
);
SET @module_index_ddl = IF(
  @module_index_exists = 0,
  'CREATE INDEX idx_topics_module_order ON systemdb.topics (module_key, order_number, id)',
  'SELECT 1'
);
PREPARE module_index_stmt FROM @module_index_ddl;
EXECUTE module_index_stmt;
DEALLOCATE PREPARE module_index_stmt;
