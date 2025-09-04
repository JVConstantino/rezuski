import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

interface MigrationConfig {
  sourceUrl: string;
  sourceKey: string;
  sourceServiceKey?: string;
  targetUrl: string;
  targetKey: string;
  targetServiceKey?: string;
  includeStorage?: boolean;
  storageBucket?: string;
}

interface MigrationOptions {
  skipTables?: string[];
  batchSize?: number;
  includeSchema?: boolean;
  includeData?: boolean;
  includeStorage?: boolean;
}

export class DatabaseMigration {
  private sourceClient: SupabaseClient<Database>;
  private targetClient: SupabaseClient<Database>;
  private config: MigrationConfig;

  constructor(config: MigrationConfig) {
    this.config = config;
    this.sourceClient = createClient<Database>(config.sourceUrl, config.sourceKey);
    this.targetClient = createClient<Database>(config.targetUrl, config.targetKey);
  }

  /**
   * Map JavaScript property names to database column names
   */
  private mapColumnNames(tableName: string, columnName: string): string {
    // Define mapping for columns that differ between JS objects and DB schema
    const columnMappings: Record<string, Record<string, string>> = {
      profiles: {
        updatedAt: 'updated_at',
        avatarUrl: '"avatarUrl"' // Keep quoted for camelCase in DB
      },
      properties: {
        createdAt: '"createdAt"',
        zipCode: '"zipCode"',
        rentPrice: '"rentPrice"',
        salePrice: '"salePrice"',
        propertyType: '"propertyType"',
        categoryId: '"categoryId"',
        areaM2: '"areaM2"',
        repairQuality: '"repairQuality"',
        yearBuilt: '"yearBuilt"',
        priceHistory: '"priceHistory"',
        availableDate: '"availableDate"',
        listedByUserId: '"listedByUserId"',
        isPopular: '"isPopular"',
        tourUrl: '"tourUrl"',
        viewCount: '"viewCount"',
        view_count: '"viewCount"' // Map both variants to the same DB column
      },
      applications: {
        propertyId: '"propertyId"',
        applicantId: '"applicantId"',
        applicationDate: '"applicationDate"',
        totalIncome: '"totalIncome"',
        incomeToRentRatio: '"incomeToRentRatio"',
        moveInDate: '"moveInDate"',
        backgroundChecks: '"backgroundChecks"',
        creditReport: '"creditReport"'
      },
      tenants: {
        userId: '"userId"',
        propertyId: '"propertyId"',
        leaseEndDate: '"leaseEndDate"',
        rentAmount: '"rentAmount"'
      },
      brokers: {
        avatarUrl: '"avatarUrl"'
      },
      categories: {
        iconUrl: '"iconUrl"'
      },
      resources: {
        fileUrl: '"fileUrl"'
      }
    };

    // Return mapped column name or original with quotes
    return columnMappings[tableName]?.[columnName] || `"${columnName}"`;
  }

  /**
   * Export database schema as SQL
   */
  async exportSchema(): Promise<string> {
    console.log('🔄 Exporting database schema...');
    
    // This is a basic schema based on your types
    // In production, you'd want to fetch this from pg_dump or similar
    const schema = `
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY,
    updated_at timestamp with time zone,
    email text NOT NULL,
    name text,
    "avatarUrl" text,
    role text NOT NULL CHECK (role IN ('ADMIN', 'OWNER', 'TENANT', 'BUYER', 'SELLER'))
);

CREATE TABLE public.categories (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    "iconUrl" text NOT NULL,
    translations jsonb
);

CREATE TABLE public.amenities (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone DEFAULT now(),
    name text NOT NULL,
    translations jsonb
);

CREATE TABLE public.brokers (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    title text NOT NULL,
    "avatarUrl" text NOT NULL,
    phone text NOT NULL,
    email text NOT NULL
);

CREATE TABLE public.properties (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "createdAt" timestamp with time zone DEFAULT now(),
    title text NOT NULL,
    code text,
    address text NOT NULL,
    neighborhood text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    "zipCode" text NOT NULL,
    description text NOT NULL,
    purpose text NOT NULL CHECK (purpose IN ('RENT', 'SALE', 'SEASONAL')),
    "rentPrice" numeric,
    "salePrice" numeric,
    "propertyType" text NOT NULL CHECK ("propertyType" IN ('Casa', 'Apartamento', 'Condomínio', 'Comercial', 'Terreno', 'Sobrado')),
    "categoryId" uuid REFERENCES categories(id),
    bedrooms integer,
    bathrooms integer,
    "areaM2" numeric,
    "repairQuality" text,
    status text NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'RENTED', 'SOLD', 'ARCHIVED')),
    "yearBuilt" integer,
    images jsonb DEFAULT '[]',
    amenities jsonb DEFAULT '[]',
    "priceHistory" jsonb DEFAULT '[]',
    "availableDate" date,
    "listedByUserId" uuid,
    "isPopular" boolean DEFAULT false,
    "tourUrl" text,
    "viewCount" integer DEFAULT 0,
    display_order integer,
    translations jsonb
);

CREATE TABLE public.applications (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "propertyId" uuid NOT NULL REFERENCES properties(id),
    "applicantId" uuid NOT NULL REFERENCES profiles(id),
    "applicationDate" timestamp with time zone DEFAULT now(),
    status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Rejected', 'Draft')),
    "totalIncome" numeric,
    "incomeToRentRatio" numeric,
    occupants integer,
    "moveInDate" date,
    vehicles text,
    "backgroundChecks" jsonb,
    "creditReport" jsonb,
    reference jsonb
);

CREATE TABLE public.tenants (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" uuid NOT NULL REFERENCES profiles(id),
    "propertyId" uuid NOT NULL REFERENCES properties(id),
    "leaseEndDate" date NOT NULL,
    "rentAmount" numeric NOT NULL
);

CREATE TABLE public.conversations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone DEFAULT now(),
    customer_name text NOT NULL,
    customer_email text NOT NULL,
    property_id uuid REFERENCES properties(id),
    last_message_at timestamp with time zone DEFAULT now(),
    last_message_preview text,
    admin_has_unread boolean DEFAULT false
);

CREATE TABLE public.messages (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone DEFAULT now(),
    conversation_id uuid NOT NULL REFERENCES conversations(id),
    sender text NOT NULL CHECK (sender IN ('ADMIN', 'CUSTOMER')),
    content text NOT NULL
);

CREATE TABLE public.resources (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title text NOT NULL,
    "fileUrl" text NOT NULL
);

CREATE TABLE public.property_type_translations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    translations jsonb
);

CREATE TABLE public.ai_configs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone DEFAULT now(),
    provider text NOT NULL,
    api_key text,
    model text,
    max_tokens integer,
    is_active boolean DEFAULT false
);

CREATE TABLE public.storage_configs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone DEFAULT now(),
    storage_url text NOT NULL,
    storage_key text NOT NULL,
    bucket_name text NOT NULL,
    is_active boolean DEFAULT false
);

-- Create functions
CREATE OR REPLACE FUNCTION increment_view_count(prop_id uuid)
RETURNS void AS $$
BEGIN
    UPDATE properties 
    SET "viewCount" = COALESCE("viewCount", 0) + 1 
    WHERE id = prop_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_active_ai_config(config_id uuid)
RETURNS void AS $$
BEGIN
    -- Deactivate all configs
    UPDATE ai_configs SET is_active = false;
    -- Activate the selected one
    UPDATE ai_configs SET is_active = true WHERE id = config_id;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_configs ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (you may need to adjust these based on your requirements)
CREATE POLICY "Public read access" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.amenities FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.brokers FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.properties FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.resources FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.property_type_translations FOR SELECT USING (true);

-- Admin policies for authenticated users (adjust as needed)
CREATE POLICY "Admin full access" ON public.profiles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON public.applications FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON public.tenants FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON public.conversations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON public.messages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON public.ai_configs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access" ON public.storage_configs FOR ALL USING (auth.role() = 'authenticated');
`;

    return schema;
  }

  /**
   * Export data from source database
   */
  async exportData(options: MigrationOptions = {}): Promise<Record<string, any[]>> {
    console.log('🔄 Exporting data from source database...');
    
    const { skipTables = [], batchSize = 1000 } = options;
    const tables = [
      'profiles',
      'categories', 
      'amenities',
      'brokers',
      'properties',
      'applications',
      'tenants',
      'conversations',
      'messages',
      'resources',
      'property_type_translations',
      'ai_configs',
      'storage_configs'
    ].filter(table => !skipTables.includes(table));

    const exportedData: Record<string, any[]> = {};

    for (const table of tables) {
      console.log(`📋 Exporting table: ${table}`);
      try {
        const { data, error } = await this.sourceClient
          .from(table as any)
          .select('*');

        if (error) {
          console.warn(`⚠️ Could not export table ${table}:`, error.message);
          exportedData[table] = [];
        } else {
          exportedData[table] = data || [];
          console.log(`✅ Exported ${data?.length || 0} records from ${table}`);
        }
      } catch (err) {
        console.warn(`⚠️ Error exporting table ${table}:`, err);
        exportedData[table] = [];
      }
    }

    return exportedData;
  }

  /**
   * Export data as INSERT INTO SQL statements for manual migration
   */
  async exportDataAsSQL(options: MigrationOptions = {}): Promise<Record<string, string>> {
    console.log('🔄 Exporting data as SQL INSERT statements...');
    
    const exportedData = await this.exportData(options);
    const sqlFiles: Record<string, string> = {};
    
    // Import order to respect foreign key constraints
    const tableOrder = [
      'profiles',
      'categories',
      'amenities', 
      'brokers',
      'property_type_translations',
      'resources',
      'properties',
      'applications',
      'tenants',
      'conversations',
      'messages',
      'ai_configs',
      'storage_configs'
    ];
    
    for (const table of tableOrder) {
      const records = exportedData[table];
      if (!records || records.length === 0) {
        console.log(`⏭️ Skipping empty table: ${table}`);
        sqlFiles[table] = `-- No data found for table: ${table}\n`;
        continue;
      }
      
      console.log(`📄 Generating SQL for table: ${table} (${records.length} records)`);
      
      // Debug: Log the first record's column names to help identify mapping issues
      if (records.length > 0) {
        const sampleColumns = Object.keys(records[0]);
        console.log(`🔍 Table ${table} columns:`, sampleColumns.join(', '));
      }
      
      let sql = `-- Data export for table: ${table}\n`;
      sql += `-- Generated on: ${new Date().toISOString()}\n`;
      sql += `-- Total records: ${records.length}\n\n`;
      
      // Disable triggers and constraints for faster import
      sql += `-- Disable triggers for faster import\n`;
      sql += `ALTER TABLE ${table} DISABLE TRIGGER ALL;\n\n`;
      
      if (records.length > 0) {
        // Get column names from first record
        const originalColumns = Object.keys(records[0]);
        
        // Debug: Log the first record's column names to help identify mapping issues
        console.log(`🔍 Table ${table} original columns:`, originalColumns.join(', '));
        
        // Map columns and remove duplicates
        const columnMappings = new Map<string, string>();
        const mappedColumns: string[] = [];
        
        originalColumns.forEach(col => {
          const mappedCol = this.mapColumnNames(table, col);
          // Check if this mapped column already exists
          if (!columnMappings.has(mappedCol)) {
            columnMappings.set(mappedCol, col);
            mappedColumns.push(mappedCol);
          } else {
            console.log(`⚠️ Skipping duplicate column mapping: ${col} -> ${mappedCol} (already mapped from ${columnMappings.get(mappedCol)})`);
          }
        });
        
        // Get the original column names in the same order as mapped columns
        const finalOriginalColumns = mappedColumns.map(mappedCol => columnMappings.get(mappedCol)!);
        
        console.log(`✅ Table ${table} final mapped columns:`, mappedColumns.join(', '));
        
        // Add TRUNCATE option for clean import (commented out by default)
        sql += `-- Uncomment the next line if you want to clear existing data first\n`;
        sql += `-- TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE;\n\n`;
        
        // Generate INSERT statements in batches for better performance
        const batchSize = 100;
        for (let i = 0; i < records.length; i += batchSize) {
          const batch = records.slice(i, i + batchSize);
          
          sql += `-- Batch ${Math.floor(i / batchSize) + 1}\n`;
          
          // Use INSERT ... ON CONFLICT to handle duplicates
          sql += `INSERT INTO ${table} (${mappedColumns.join(', ')})\n`;
          sql += `VALUES\n`;
          
          const values = batch.map(record => {
            const recordValues = finalOriginalColumns.map(col => {
              const value = record[col];
              
              if (value === null || value === undefined) {
                return 'NULL';
              }
              
              if (typeof value === 'string') {
                // Escape single quotes and wrap in quotes
                return `'${value.replace(/'/g, "''")}'`;
              }
              
              if (typeof value === 'boolean') {
                return value ? 'true' : 'false';
              }
              
              if (typeof value === 'object') {
                // Handle JSON objects
                return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
              }
              
              if (value instanceof Date || (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/))) {
                return `'${value}'`;
              }
              
              // Numbers and other types
              return String(value);
            });
            
            return `  (${recordValues.join(', ')})`;
          });
          
          sql += values.join(',\n');
          
          // Add conflict resolution - update on conflict for tables with id column
          if (finalOriginalColumns.includes('id')) {
            sql += `\nON CONFLICT (id) DO UPDATE SET\n`;
            const updateColumns = mappedColumns.filter(col => col !== 'id').map(col => {
              return `  ${col} = EXCLUDED.${col}`;
            });
            sql += updateColumns.join(',\n');
          }
          
          sql += ';\n\n';
        }
      }
      
      // Re-enable triggers
      sql += `-- Re-enable triggers\n`;
      sql += `ALTER TABLE ${table} ENABLE TRIGGER ALL;\n\n`;
      
      // Update sequences if needed - handle both UUID and serial columns
      sql += `-- Update sequence if exists (for auto-increment columns)\n`;
      sql += `DO $$\n`;
      sql += `DECLARE\n`;
      sql += `    seq_name TEXT;\n`;
      sql += `BEGIN\n`;
      sql += `    -- Find sequence for this table\n`;
      sql += `    SELECT pg_get_serial_sequence('${table}', 'id') INTO seq_name;\n`;
      sql += `    \n`;
      sql += `    -- Update sequence if it exists and table has numeric id column\n`;
      sql += `    IF seq_name IS NOT NULL THEN\n`;
      sql += `        EXECUTE 'SELECT setval(''' || seq_name || ''', COALESCE((SELECT MAX(id) FROM ${table}), 1))';\n`;
      sql += `        RAISE NOTICE 'Updated sequence % for table ${table}', seq_name;\n`;
      sql += `    END IF;\n`;
      sql += `END $$;\n\n`;
      
      sqlFiles[table] = sql;
    }
    
    console.log(`✅ Generated SQL files for ${Object.keys(sqlFiles).length} tables`);
    return sqlFiles;
  }

  /**
   * Import data to target database
   */
  async importData(data: Record<string, any[]>, options: MigrationOptions = {}): Promise<void> {
    console.log('🔄 Importing data to target database...');
    
    const { batchSize = 100 } = options;
    
    // Import in order to respect foreign key constraints
    const importOrder = [
      'profiles',
      'categories',
      'amenities', 
      'brokers',
      'property_type_translations',
      'resources',
      'properties',
      'applications',
      'tenants',
      'conversations',
      'messages',
      'ai_configs',
      'storage_configs'
    ];

    for (const table of importOrder) {
      if (!data[table] || data[table].length === 0) {
        console.log(`⏭️ Skipping empty table: ${table}`);
        continue;
      }

      console.log(`📋 Importing table: ${table} (${data[table].length} records)`);
      
      const records = data[table];
      
      // Import in batches
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        
        try {
          const { error } = await this.targetClient
            .from(table as any)
            .insert(batch);

          if (error) {
            console.error(`❌ Error importing batch ${i}-${i + batch.length} for table ${table}:`, error.message);
          } else {
            console.log(`✅ Imported batch ${i}-${i + batch.length} for table ${table}`);
          }
        } catch (err) {
          console.error(`❌ Error importing batch for table ${table}:`, err);
        }
      }
    }
  }

  /**
   * Migrate storage buckets and files (requires service role keys)
   */
  async migrateStorage(): Promise<void> {
    if (!this.config.sourceServiceKey || !this.config.targetServiceKey) {
      console.warn('⚠️ Service keys required for storage migration. Skipping...');
      return;
    }

    console.log('🔄 Migrating storage...');
    
    const sourceServiceClient = this.getServiceClient(this.config.sourceUrl, this.config.sourceServiceKey);
    const targetServiceClient = this.getServiceClient(this.config.targetUrl, this.config.targetServiceKey);
    
    try {
      // List buckets from source
      const { data: sourceBuckets, error: bucketsError } = await sourceServiceClient.storage.listBuckets();
      
      if (bucketsError) {
        console.error('❌ Error listing source buckets:', bucketsError.message);
        return;
      }

      for (const bucket of sourceBuckets || []) {
        console.log(`🪣 Migrating bucket: ${bucket.name}`);
        
        // Create bucket in target
        const { error: createBucketError } = await targetServiceClient.storage.createBucket(bucket.name, {
          public: bucket.public,
          allowedMimeTypes: bucket.allowed_mime_types,
          fileSizeLimit: bucket.file_size_limit
        });

        if (createBucketError && !createBucketError.message.includes('already exists')) {
          console.error(`❌ Error creating bucket ${bucket.name}:`, createBucketError.message);
          continue;
        }

        // Migrate files recursively
        await this.migrateBucketFiles(sourceServiceClient, targetServiceClient, bucket.name, '');
      }
    } catch (err) {
      console.error('❌ Storage migration error:', err);
    }
  }

  /**
   * Migrate files in a bucket recursively
   */
  private async migrateBucketFiles(
    sourceClient: SupabaseClient<Database>, 
    targetClient: SupabaseClient<Database>, 
    bucketName: string, 
    folderPath: string
  ): Promise<void> {
    try {
      // List files and folders in current path
      const { data: files, error: filesError } = await sourceClient.storage
        .from(bucketName)
        .list(folderPath, { 
          limit: 1000, 
          sortBy: { column: 'name', order: 'asc' } 
        });

      if (filesError) {
        console.error(`❌ Error listing files in ${bucketName}/${folderPath}:`, filesError.message);
        return;
      }

      for (const file of files || []) {
        const filePath = folderPath ? `${folderPath}/${file.name}` : file.name;
        
        if (file.id === null) {
          // This is a folder, recurse into it
          console.log(`📁 Processing folder: ${filePath}`);
          await this.migrateBucketFiles(sourceClient, targetClient, bucketName, filePath);
        } else {
          // This is a file, migrate it
          await this.migrateFile(sourceClient, targetClient, bucketName, filePath);
        }
      }
    } catch (err) {
      console.error(`❌ Error processing bucket files in ${bucketName}/${folderPath}:`, err);
    }
  }

  /**
   * Migrate a single file
   */
  private async migrateFile(
    sourceClient: SupabaseClient<Database>, 
    targetClient: SupabaseClient<Database>, 
    bucketName: string, 
    filePath: string
  ): Promise<void> {
    try {
      // Download from source
      const { data: fileData, error: downloadError } = await sourceClient.storage
        .from(bucketName)
        .download(filePath);

      if (downloadError) {
        console.error(`❌ Error downloading ${filePath}:`, downloadError.message);
        return;
      }

      // Check if file already exists in target
      const { data: existingFile } = await targetClient.storage
        .from(bucketName)
        .list(filePath.includes('/') ? filePath.substring(0, filePath.lastIndexOf('/')) : '', {
          search: filePath.includes('/') ? filePath.substring(filePath.lastIndexOf('/') + 1) : filePath
        });

      const fileExists = existingFile?.some(f => f.name === (filePath.includes('/') ? filePath.substring(filePath.lastIndexOf('/') + 1) : filePath));

      // Upload to target (overwrite if exists)
      const { error: uploadError } = await targetClient.storage
        .from(bucketName)
        .upload(filePath, fileData, {
          cacheControl: '3600',
          upsert: true // This will overwrite existing files
        });

      if (uploadError) {
        console.error(`❌ Error uploading ${filePath}:`, uploadError.message);
      } else {
        console.log(`✅ ${fileExists ? 'Updated' : 'Migrated'} file: ${filePath}`);
      }
    } catch (err) {
      console.error(`❌ Error migrating file ${filePath}:`, err);
    }
  }

  /**
   * Run complete migration
   */
  async migrate(options: MigrationOptions = {}): Promise<void> {
    const { 
      includeSchema = true, 
      includeData = true, 
      includeStorage = false 
    } = options;

    console.log('🚀 Starting database migration...');
    console.log(`📊 Options: Schema: ${includeSchema}, Data: ${includeData}, Storage: ${includeStorage}`);

    try {
      // Step 1: Export and create schema
      if (includeSchema) {
        const schema = await this.exportSchema();
        console.log('📄 Schema exported. You need to manually run this SQL on your target database:');
        console.log('='.repeat(50));
        console.log(schema);
        console.log('='.repeat(50));
      }

      // Step 2: Export and import data
      if (includeData) {
        const exportedData = await this.exportData(options);
        await this.importData(exportedData, options);
      }

      // Step 3: Migrate storage
      if (includeStorage) {
        await this.migrateStorage();
      }

      console.log('✅ Migration completed successfully!');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  /**
   * Get storage statistics before migration
   */
  async getStorageStats(): Promise<{ buckets: number; totalFiles: number; totalSize: number }> {
    if (!this.config.sourceServiceKey) {
      return { buckets: 0, totalFiles: 0, totalSize: 0 };
    }

    const sourceServiceClient = this.getServiceClient(this.config.sourceUrl, this.config.sourceServiceKey);
    
    try {
      const { data: buckets, error } = await sourceServiceClient.storage.listBuckets();
      
      if (error) {
        console.warn('Could not get storage stats:', error.message);
        return { buckets: 0, totalFiles: 0, totalSize: 0 };
      }

      let totalFiles = 0;
      let totalSize = 0;

      for (const bucket of buckets || []) {
        const stats = await this.getBucketStats(sourceServiceClient, bucket.name, '');
        totalFiles += stats.files;
        totalSize += stats.size;
      }

      return {
        buckets: buckets?.length || 0,
        totalFiles,
        totalSize
      };
    } catch (err) {
      console.warn('Error getting storage stats:', err);
      return { buckets: 0, totalFiles: 0, totalSize: 0 };
    }
  }

  /**
   * Get statistics for a specific bucket
   */
  private async getBucketStats(
    client: SupabaseClient<Database>, 
    bucketName: string, 
    folderPath: string
  ): Promise<{ files: number; size: number }> {
    try {
      const { data: files, error } = await client.storage
        .from(bucketName)
        .list(folderPath, { limit: 1000 });

      if (error) {
        return { files: 0, size: 0 };
      }

      let fileCount = 0;
      let totalSize = 0;

      for (const file of files || []) {
        if (file.id === null) {
          // This is a folder, recurse
          const subStats = await this.getBucketStats(
            client, 
            bucketName, 
            folderPath ? `${folderPath}/${file.name}` : file.name
          );
          fileCount += subStats.files;
          totalSize += subStats.size;
        } else {
          // This is a file
          fileCount++;
          totalSize += file.metadata?.size || 0;
        }
      }

      return { files: fileCount, size: totalSize };
    } catch (err) {
      return { files: 0, size: 0 };
    }
  }
  async testConnections(): Promise<{ source: boolean; target: boolean; sourceError?: string; targetError?: string }> {
    console.log('🔧 Testing database connections...');
    
    const results = { source: false, target: false, sourceError: '', targetError: '' };

    // Test source
    try {
      const { error: sourceError } = await this.sourceClient
        .from('categories')
        .select('id')
        .limit(1);
      
      if (sourceError) {
        results.sourceError = sourceError.message;
        console.log(`❌ Source database connection failed: ${sourceError.message}`);
      } else {
        results.source = true;
        console.log('✅ Source database connected');
      }
    } catch (err: any) {
      results.sourceError = err.message || 'Unknown connection error';
      console.log(`❌ Source database connection failed: ${results.sourceError}`);
    }

    // Test target
    try {
      const { error: targetError } = await this.targetClient
        .from('categories')
        .select('id')
        .limit(1);
      
      if (targetError) {
        results.targetError = targetError.message;
        console.log(`❌ Target database connection failed: ${targetError.message}`);
      } else {
        results.target = true;
        console.log('✅ Target database connected');
      }
    } catch (err: any) {
      results.targetError = err.message || 'Unknown connection error';
      console.log(`❌ Target database connection failed: ${results.targetError}`);
    }

    return results;
  }
}

// Utility functions for migration management
export const migrationUtils = {
  /**
   * Create migration configuration from storage configs
   */
  createMigrationConfig(
    sourceConfig: { storage_url: string; storage_key: string; serviceKey?: string },
    targetConfig: { storage_url: string; storage_key: string; serviceKey?: string }
  ): MigrationConfig {
    return {
      sourceUrl: sourceConfig.storage_url,
      sourceKey: sourceConfig.storage_key,
      sourceServiceKey: sourceConfig.serviceKey,
      targetUrl: targetConfig.storage_url,
      targetKey: targetConfig.storage_key,
      targetServiceKey: targetConfig.serviceKey,
      includeStorage: !!sourceConfig.serviceKey && !!targetConfig.serviceKey
    };
  },

  /**
   * Validate migration configuration
   */
  validateConfig(config: MigrationConfig): string[] {
    const errors: string[] = [];
    
    if (!config.sourceUrl) errors.push('Source URL is required');
    if (!config.sourceKey) errors.push('Source key is required');
    if (!config.targetUrl) errors.push('Target URL is required');
    if (!config.targetKey) errors.push('Target key is required');
    
    if (config.includeStorage) {
      if (!config.sourceServiceKey) errors.push('Source service key required for storage migration');
      if (!config.targetServiceKey) errors.push('Target service key required for storage migration');
    }

    return errors;
  }
};