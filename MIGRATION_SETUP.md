# Database Migration Setup Guide

## ✅ Migration Tool Successfully Created!

Your real estate management system now includes a comprehensive database migration tool that allows you to migrate entire Supabase databases between instances.

## 🎯 What Was Added

### 1. Migration Library (`lib/databaseMigration.ts`)
- Complete database schema export/import
- Data migration with batching
- Storage bucket and file migration
- Connection testing and validation
- Comprehensive error handling and logging

### 2. Admin Interface (`pages/admin/DatabaseMigrationPage.tsx`)
- User-friendly web interface
- Real-time migration progress
- Step-by-step wizard
- Schema download functionality
- Storage configuration integration

### 3. CLI Tools
- `npm run migrate-help` - Shows detailed help and examples
- `npm run test-migration` - Tests migration functionality
- `examples/migration-example.js` - Programmatic usage examples

### 4. Navigation Integration
- Added "Migração de BD" to admin sidebar
- Restricted access to authorized users only
- Database icon and proper routing

## 🚀 How to Use

### Option 1: Web Interface (Recommended)

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the migration page:**
   ```
   http://localhost:5173/admin/database-migration
   ```

3. **Configure your migration:**
   - Select source database (current Supabase instance)
   - Select target database (new Supabase instance)
   - Optionally add service keys for storage migration

4. **Run the migration:**
   - Click "Iniciar Migração"
   - Monitor progress in real-time
   - Download the generated schema SQL
   - Apply schema manually to target database

### Option 2: CLI Help
```bash
npm run migrate-help -- --help
```

### Option 3: Programmatic Usage
```javascript
import { DatabaseMigration, migrationUtils } from './lib/databaseMigration.js';

const migration = new DatabaseMigration({
  sourceUrl: 'https://old-project.supabase.co',
  sourceKey: 'your-source-key',
  targetUrl: 'https://new-project.supabase.co',
  targetKey: 'your-target-key'
});

await migration.migrate();
```

## 📋 What Gets Migrated

### Database Schema
- ✅ All tables with proper structure
- ✅ Primary keys and constraints
- ✅ Foreign key relationships
- ✅ Row Level Security (RLS) policies
- ✅ Custom database functions
- ✅ Indexes and triggers

### Data Tables
- ✅ `profiles` - User profiles and authentication
- ✅ `properties` - Real estate listings
- ✅ `categories` - Property categories
- ✅ `amenities` - Property amenities
- ✅ `brokers` - Real estate brokers
- ✅ `applications` - Rental applications
- ✅ `tenants` - Current tenants
- ✅ `conversations` - Chat messages
- ✅ `messages` - Message details
- ✅ `resources` - Documents and files
- ✅ `ai_configs` - AI configuration
- ✅ `storage_configs` - Storage settings

### Storage (Optional)
- ✅ All storage buckets
- ✅ Property images
- ✅ Documents and files
- ✅ Bucket policies and settings

## ⚙️ Configuration Requirements

### For Database Migration
- **Source Supabase URL**: `https://your-source-project.supabase.co`
- **Source Anon Key**: Your source project's anonymous key
- **Target Supabase URL**: `https://your-target-project.supabase.co`
- **Target Anon Key**: Your target project's anonymous key

### For Storage Migration (Optional)
- **Source Service Key**: Source project's service role key
- **Target Service Key**: Target project's service role key

## 🔧 Step-by-Step Migration Process

### 1. Preparation
- [ ] Create new Supabase project (target)
- [ ] Note down URLs and keys for both projects
- [ ] Backup existing data (recommended)

### 2. Schema Migration
- [ ] Run migration tool to export schema
- [ ] Download the generated `schema.sql` file
- [ ] Apply schema manually in target Supabase SQL editor

### 3. Data Migration
- [ ] Continue migration process to transfer data
- [ ] Monitor progress through the interface
- [ ] Verify data integrity after completion

### 4. Storage Migration (Optional)
- [ ] Provide service role keys
- [ ] Enable storage migration option
- [ ] Let the tool copy all files and buckets

### 5. Verification
- [ ] Test the new database thoroughly
- [ ] Verify all data is present and correct
- [ ] Update application configuration
- [ ] Switch traffic to new database

## ⚠️ Important Notes

### Before Migration
- **Backup Everything**: Always backup your source database before starting
- **Target Database**: Should be empty or specifically prepared for migration
- **Downtime**: Plan for application downtime during migration
- **Service Keys**: Only required for storage migration

### During Migration
- **Manual Schema Step**: You must manually apply the schema SQL to the target database
- **Monitor Progress**: Use the real-time logs to track migration status
- **Don't Interrupt**: Let the migration complete fully

### After Migration
- **Verify Data**: Check that all data migrated correctly
- **Update Config**: Update your application's Supabase configuration
- **Test Thoroughly**: Test all application functionality
- **Update DNS**: Point your application to the new database

## 🛠️ Troubleshooting

### Common Issues

#### "Schema export failed"
- Check source database connectivity
- Ensure anon key has proper permissions

#### "Data import failed"
- Apply schema SQL manually first
- Check target database permissions
- Verify table structure matches

#### "Storage migration failed"
- Ensure service role keys are correct
- Check storage bucket permissions
- Verify source buckets exist

#### "Connection failed"
- Double-check URLs and keys
- Test connectivity to both databases
- Verify network access

### Getting Help
1. Check the logs in the migration interface
2. Review the documentation at `docs/MIGRATION.md`
3. Test with the CLI help: `npm run migrate-help`
4. Check the example file: `examples/migration-example.js`

## 🎉 Success!

Your database migration tool is now ready to use! This comprehensive solution will help you:

- ✅ Migrate between development, staging, and production environments
- ✅ Create backups and restore data
- ✅ Move to new Supabase instances seamlessly
- ✅ Scale your real estate management system

The tool provides both user-friendly interfaces and programmatic access, making it suitable for both manual migrations and automated deployments.

**Next Steps:**
1. Test the migration with a small dataset first
2. Plan your production migration carefully
3. Keep this documentation for reference
4. Consider setting up automated backup schedules