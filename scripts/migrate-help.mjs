#!/usr/bin/env node

/**
 * Database Migration CLI Helper
 * 
 * This script provides help and examples for database migration.
 * The actual migration functionality is available through the web interface.
 */

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    }
  }

  return options;
}

// Show help
function showHelp() {
  console.log(`
🚀 Database Migration Tool

This tool helps you migrate your entire Supabase database between instances.

📋 Features:
• Export and import database schema (tables, functions, policies)
• Migrate all data between databases
• 🚀 AUTOMATIC file migration - all buckets and files!
• Real-time migration progress and logs
• Visual progress bars for file migration
• Storage statistics and file counters
• Validation and error handling

🌐 Web Interface (Recommended):
1. Start your development server: npm run dev
2. Navigate to: http://localhost:5173/admin/database-migration
3. Configure source and target databases
4. Run the migration with real-time feedback

📁 What gets migrated:
• Tables: properties, categories, amenities, brokers, profiles, etc.
• Data: All records from all tables
• Storage: 🎆 ALL files and buckets automatically!
• Functions: Custom database functions
• Policies: Row Level Security (RLS) policies
• Files: Images, documents, uploads - everything!

⚙️ Configuration needed:
• Source Supabase URL and anon key
• Target Supabase URL and anon key
• Service keys (optional, for storage migration)

📖 Documentation:
• Full guide: docs/MIGRATION.md
• Example usage: examples/migration-example.js

🔧 Programmatic Usage:
For advanced users, you can use the migration library directly:

import { DatabaseMigration, migrationUtils } from './lib/databaseMigration.js';

const migration = new DatabaseMigration({
  sourceUrl: 'https://old-project.supabase.co',
  sourceKey: 'your-source-key',
  targetUrl: 'https://new-project.supabase.co',
  targetKey: 'your-target-key'
});

await migration.migrate();

⚠️ Important Notes:
• Always backup your data before migration
• The target database should be empty or prepared
• You need to manually apply the schema SQL before data migration
• Service keys are required for storage migration

For more help, check the documentation or use the web interface.
`);
}

// Main function
function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    return;
  }

  // Default behavior - show instructions
  console.log(`
🔧 Database Migration Helper

Use --help for detailed information.

Quick start:
1. npm run dev
2. Navigate to /admin/database-migration
3. Configure your source and target databases
4. Run the migration

For CLI help: npm run migrate-help -- --help
`);
}

// Run
main();