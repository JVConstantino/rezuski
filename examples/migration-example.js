// Example: Database Migration Usage
// This file shows how to use the migration tool programmatically

import { DatabaseMigration, migrationUtils } from '../lib/databaseMigration.js';

async function runExampleMigration() {
  // Example configuration
  const migrationConfig = {
    sourceUrl: 'https://old-project.supabase.co',
    sourceKey: 'your-source-anon-key',
    sourceServiceKey: 'your-source-service-key', // Optional, for storage migration
    targetUrl: 'https://new-project.supabase.co',
    targetKey: 'your-target-anon-key',
    targetServiceKey: 'your-target-service-key', // Optional, for storage migration
    includeStorage: false // Set to true if you want to migrate storage
  };

  // Validate configuration
  const validationErrors = migrationUtils.validateConfig(migrationConfig);
  if (validationErrors.length > 0) {
    console.error('❌ Configuration errors:', validationErrors);
    return;
  }

  // Create migration instance
  const migration = new DatabaseMigration(migrationConfig);

  try {
    // Test connections first
    console.log('🔧 Testing connections...');
    const connectionResults = await migration.testConnections();
    
    if (!connectionResults.source || !connectionResults.target) {
      console.error('❌ Connection test failed');
      return;
    }
    console.log('✅ Connections successful');

    // Option 1: Run full migration
    await migration.migrate({
      includeSchema: true,
      includeData: true,
      includeStorage: migrationConfig.includeStorage,
      batchSize: 100
    });

    // Option 2: Export schema only
    // const schema = await migration.exportSchema();
    // console.log('Schema SQL:', schema);

    // Option 3: Export data only
    // const data = await migration.exportData({ batchSize: 1000 });
    // console.log('Exported data:', Object.keys(data));

    console.log('🎉 Migration completed!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Uncomment to run
// runExampleMigration();