#!/usr/bin/env node

/**
 * Database Migration CLI Tool
 * 
 * This script allows you to run database migrations from the command line.
 * Useful for CI/CD pipelines, automated deployments, or manual migrations.
 * 
 * Usage:
 * npm run migrate -- --source-url="https://old.supabase.co" --source-key="key1" --target-url="https://new.supabase.co" --target-key="key2"
 * 
 * Options:
 * --source-url: Source Supabase URL
 * --source-key: Source Supabase anon key
 * --source-service-key: Source Supabase service role key (optional, for storage)
 * --target-url: Target Supabase URL
 * --target-key: Target Supabase anon key
 * --target-service-key: Target Supabase service role key (optional, for storage)
 * --include-storage: Include storage migration (requires service keys)
 * --schema-only: Export schema only, don't migrate data
 * --data-only: Migrate data only, skip schema export
 * --batch-size: Batch size for data migration (default: 100)
 * --output-dir: Directory to save exported files (default: ./migration_output)
 * --help: Show help
 */

import { DatabaseMigration, migrationUtils } from '../lib/databaseMigration.js';
import fs from 'fs';
import path from 'path';

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--')) {
      if (arg.includes('=')) {
        const [key, value] = arg.split('=');
        const optionKey = key.substring(2).replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        
        switch (optionKey) {
          case 'sourceUrl':
            options.sourceUrl = value;
            break;
          case 'sourceKey':
            options.sourceKey = value;
            break;
          case 'sourceServiceKey':
            options.sourceServiceKey = value;
            break;
          case 'targetUrl':
            options.targetUrl = value;
            break;
          case 'targetKey':
            options.targetKey = value;
            break;
          case 'targetServiceKey':
            options.targetServiceKey = value;
            break;
          case 'includeStorage':
            options.includeStorage = value !== 'false';
            break;
          case 'schemaOnly':
            options.schemaOnly = value !== 'false';
            break;
          case 'dataOnly':
            options.dataOnly = value !== 'false';
            break;
          case 'batchSize':
            options.batchSize = parseInt(value, 10);
            break;
          case 'outputDir':
            options.outputDir = value;
            break;
        }
      } else {
        // Handle flags without values
        const optionKey = arg.substring(2).replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        if (optionKey === 'help') {
          options.help = true;
        }
      }
    }
  }

  return options;
}

// Show help
function showHelp() {
  console.log(`
Database Migration CLI Tool

Usage:
  npm run migrate -- --source-url="https://old.supabase.co" --source-key="key1" --target-url="https://new.supabase.co" --target-key="key2"

Options:
  --source-url            Source Supabase URL
  --source-key            Source Supabase anon key
  --source-service-key    Source Supabase service role key (optional, for storage)
  --target-url            Target Supabase URL
  --target-key            Target Supabase anon key
  --target-service-key    Target Supabase service role key (optional, for storage)
  --include-storage       Include storage migration (requires service keys)
  --schema-only           Export schema only, don't migrate data
  --data-only             Migrate data only, skip schema export
  --batch-size            Batch size for data migration (default: 100)
  --output-dir            Directory to save exported files (default: ./migration_output)
  --help                  Show this help

Examples:
  # Full migration
  npm run migrate -- --source-url="https://old.supabase.co" --source-key="key1" --target-url="https://new.supabase.co" --target-key="key2"
  
  # Schema only
  npm run migrate -- --source-url="https://old.supabase.co" --source-key="key1" --schema-only=true
  
  # With storage migration
  npm run migrate -- --source-url="https://old.supabase.co" --source-key="key1" --source-service-key="service1" --target-url="https://new.supabase.co" --target-key="key2" --target-service-key="service2" --include-storage=true
`);
}

// Ensure output directory exists
function ensureOutputDir(outputDir) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
}

// Save file to output directory
function saveFile(outputDir, filename, content) {
  const filePath = path.join(outputDir, filename);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`📁 Saved: ${filePath}`);
}

// Main migration function
async function runMigration() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    return;
  }

  // Validate required options
  if (!options.sourceUrl || !options.sourceKey) {
    console.error('❌ Error: Source URL and key are required');
    console.log('Use --help for usage information');
    process.exit(1);
  }

  if (!options.schemaOnly && (!options.targetUrl || !options.targetKey)) {
    console.error('❌ Error: Target URL and key are required for data migration');
    console.log('Use --help for usage information');
    process.exit(1);
  }

  const outputDir = options.outputDir || './migration_output';
  ensureOutputDir(outputDir);

  try {
    console.log('🚀 Starting database migration...');
    console.log(`📊 Options: Schema: ${!options.dataOnly}, Data: ${!options.schemaOnly}, Storage: ${options.includeStorage}`);

    // Create migration configuration
    const config = {
      sourceUrl: options.sourceUrl,
      sourceKey: options.sourceKey,
      sourceServiceKey: options.sourceServiceKey,
      targetUrl: options.targetUrl || '',
      targetKey: options.targetKey || '',
      targetServiceKey: options.targetServiceKey,
      includeStorage: options.includeStorage || false
    };

    // Validate configuration
    const validationErrors = migrationUtils.validateConfig(config);
    if (validationErrors.length > 0 && !options.schemaOnly) {
      console.error(`❌ Configuration error: ${validationErrors.join(', ')}`);
      process.exit(1);
    }

    const migration = new DatabaseMigration(config);

    // Test connections (if not schema-only)
    if (!options.schemaOnly) {
      console.log('🔧 Testing connections...');
      const connectionResults = await migration.testConnections();
      
      if (!connectionResults.source || !connectionResults.target) {
        const error = `Connection failed - Source: ${connectionResults.source ? 'OK' : 'FAILED'}, Target: ${connectionResults.target ? 'OK' : 'FAILED'}`;
        console.error(`❌ ${error}`);
        process.exit(1);
      }
      
      console.log('✅ Connections tested successfully');
    }

    // Export schema
    if (!options.dataOnly) {
      console.log('📄 Exporting schema...');
      const schema = await migration.exportSchema();
      saveFile(outputDir, 'schema.sql', schema);
      console.log('✅ Schema exported');
    }

    // Export and import data
    if (!options.schemaOnly) {
      console.log('📋 Exporting data...');
      const exportedData = await migration.exportData({
        batchSize: options.batchSize || 1000
      });

      // Save exported data as JSON
      saveFile(outputDir, 'data.json', JSON.stringify(exportedData, null, 2));
      
      const totalRecords = Object.values(exportedData).reduce((sum, records) => sum + records.length, 0);
      console.log(`✅ Data exported: ${totalRecords} records`);

      console.log('📥 Importing data...');
      await migration.importData(exportedData, {
        batchSize: options.batchSize || 100
      });
      console.log('✅ Data imported successfully');

      // Migrate storage
      if (options.includeStorage && options.sourceServiceKey && options.targetServiceKey) {
        console.log('🪣 Migrating storage...');
        await migration.migrateStorage();
        console.log('✅ Storage migrated successfully');
      } else if (options.includeStorage) {
        console.log('⏭️ Storage migration skipped (service keys required)');
      }
    }

    console.log('🎉 Migration completed successfully!');
    console.log(`📁 Output files saved to: ${outputDir}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run migration
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration();
}