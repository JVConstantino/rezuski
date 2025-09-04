# Manual Data Migration with SQL Files

## Overview
The new "Export Data as SQL" feature allows you to generate INSERT INTO SQL files for each database table, enabling manual migration between databases. This is perfect for cases where you want full control over the migration process or need to review/modify the data before importing.

## How to Use

### 1. **Export Data as SQL Files**
1. Go to the Database Migration page (`/admin/database-migration`)
2. Select your **source database** (where your current data is)
3. Click **"Exportar Dados como SQL"**
4. Wait for the export process to complete

### 2. **Download SQL Files**
After export, you'll see a list of SQL files for each table:

**Individual Downloads:**
- Click "Download" next to each table to get individual SQL files
- Files are named like `profiles_data.sql`, `properties_data.sql`, etc.

**Combined Download:**
- Click **"Download Todos os SQLs"** to get a single file with all data
- This file includes execution order instructions

### 3. **Execute SQL Files in Target Database**

**IMPORTANT: Follow this order:**

1. **First**, execute the schema SQL (use "Exportar Schema" button)
2. **Then**, execute data files in this specific order:
   1. `profiles_data.sql`
   2. `categories_data.sql`
   3. `amenities_data.sql`
   4. `brokers_data.sql`
   5. `property_type_translations_data.sql`
   6. `resources_data.sql`
   7. `properties_data.sql`
   8. `applications_data.sql`
   9. `tenants_data.sql`
   10. `conversations_data.sql`
   11. `messages_data.sql`
   12. `ai_configs_data.sql`
   13. `storage_configs_data.sql`

## SQL File Features

### **Automatic Conflict Resolution:**
- Each INSERT uses `ON CONFLICT (id) DO UPDATE` to handle duplicate keys
- Existing records are updated with new data instead of causing errors
- Option to uncomment `TRUNCATE` commands for clean slate import

### **Smart Column Mapping:**
- Automatically maps JavaScript naming (camelCase) to database naming (snake_case)
- Fixes common issues like `updatedAt` → `updated_at`, `createdAt` → `"createdAt"`
- Prevents "column does not exist" errors during import
- **NEW**: Detects and removes duplicate columns (e.g., both `viewCount` and `view_count`)
- **NEW**: Maps column variants to the same database column for consistency

### **Automatic Performance Optimization:**
- Each file automatically disables triggers during import for faster execution
- Triggers are re-enabled after import
- Data is inserted in batches of 100 records per INSERT statement

### **Smart Sequence Management:**
- Robust sequence handling for both UUID and auto-increment columns
- Ensures auto-increment IDs continue correctly after import
- Prevents sequence conflicts and overlapping IDs

### **Error Handling:**
- Proper escaping of quotes and special characters
- NULL value handling
- JSON data formatting

## Example SQL File Structure

```sql
-- Data export for table: properties
-- Generated on: 2024-01-15T10:30:45.123Z
-- Total records: 150

-- Uncomment the next line if you want to clear existing data first
-- TRUNCATE TABLE properties RESTART IDENTITY CASCADE;

-- Disable triggers for faster import
ALTER TABLE properties DISABLE TRIGGER ALL;

-- Batch 1
INSERT INTO properties ("id", "title", "address", "price", "createdAt")
VALUES
  ('123e4567-e89b-12d3-a456-426614174000', 'Beautiful House', '123 Main St', 250000, '2024-01-01T00:00:00.000Z'),
  ('223e4567-e89b-12d3-a456-426614174001', 'Nice Apartment', '456 Oak Ave', 180000, '2024-01-02T00:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET
  "title" = EXCLUDED."title",
  "address" = EXCLUDED."address",
  "price" = EXCLUDED."price",
  "createdAt" = EXCLUDED."createdAt";

-- Re-enable triggers
ALTER TABLE properties ENABLE TRIGGER ALL;

-- Update sequence if exists (for auto-increment columns)
DO $$
DECLARE
    seq_name TEXT;
BEGIN
    SELECT pg_get_serial_sequence('properties', 'id') INTO seq_name;
    IF seq_name IS NOT NULL THEN
        EXECUTE 'SELECT setval(''' || seq_name || ''', COALESCE((SELECT MAX(id) FROM properties), 1))';
        RAISE NOTICE 'Updated sequence % for table properties', seq_name;
    END IF;
END $$;
```

## Benefits of Manual Migration

1. **Full Control**: Review and modify data before importing
2. **Selective Import**: Choose which tables to migrate
3. **Backup Safety**: Keep SQL files as backup
4. **Debugging**: Easy to troubleshoot issues with individual tables
5. **Version Control**: Store migration files in your repository
6. **Flexible Timing**: Execute migrations at your own pace

## Tips

- **Test First**: Try the migration on a test database first
- **Check Logs**: Monitor the export logs for any warnings or errors
- **Verify Counts**: Compare record counts between source and target
- **Handle Dependencies**: Always respect the table execution order
- **Large Tables**: For very large tables, consider breaking them into smaller batches

## Troubleshooting

**If export fails:**
- Check if source database is accessible
- Verify the source configuration is correct
- Look at the migration logs for specific error messages

**If you get "column does not exist" error:**
1. **Automatic Fix (Recommended):**
   - Re-export the data using the updated tool (includes automatic column mapping)
   - The new SQL files automatically convert camelCase to snake_case

2. **Manual Fix:**
   - Edit the SQL file and change column names:
     - `"updatedAt"` → `updated_at`
     - `"createdAt"` → `"createdAt"` (keep quoted)
     - `"avatarUrl"` → `"avatarUrl"` (keep quoted)
   - Remove duplicate columns if they exist in the same INSERT statement

**If you get duplicate column errors (e.g., both `"viewCount"` and `"view_count"`):**
1. **Automatic Fix (Recommended):**
   - Re-export the data using the updated tool (includes duplicate detection)
   - The system now automatically removes duplicate column mappings

2. **Manual Fix:**
   - Edit the SQL file and remove one of the duplicate columns from the INSERT statement
   - Keep only the correctly mapped column name

**If you get "duplicate key value violates unique constraint" error:**
1. **Option 1 - Clean Import (Recommended):**
   - Uncomment the `TRUNCATE TABLE` lines in each SQL file
   - This will clear existing data before importing

2. **Option 2 - Update Existing Data:**
   - The SQL files now include `ON CONFLICT ... DO UPDATE` by default
   - Re-export the data using the updated tool to get the new format
   - This will update existing records instead of failing

3. **Option 3 - Manual Cleanup:**
   ```sql
   -- Run this before importing each table
   DELETE FROM table_name WHERE id IN (
     SELECT id FROM source_data
   );
   ```

**If import fails:**
- Make sure schema was created first
- Check foreign key constraints
- Verify data types match between source and target
- Look for special characters that might need additional escaping
- Check that sequences are properly updated after import

## Next Steps

After successful import:
1. Verify data integrity by comparing record counts
2. Test application functionality with the new database
3. Update any configuration to point to the new database
4. Archive or backup the old database as needed