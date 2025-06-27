// #!/usr/bin/env node

// import { exec } from 'child_process';
// import { promisify } from 'util';
// import * as fs from 'fs';
// import * as path from 'path';

// const execAsync = promisify(exec);

// interface BackupConfig {
//   mongoUri: string;
//   backupDir: string;
//   retentionDays: number;
//   enableCompression: boolean;
// }

// class MongoBackupService {
//   private config: BackupConfig;

//   constructor(config: BackupConfig) {
//     this.config = config;
//   }

//   /**
//    * Executes the MongoDB backup process
//    */
//   async performBackup(): Promise<void> {
//     try {
//       console.log(`[${new Date().toISOString()}] Starting MongoDB backup process`);
      
//       await this.ensureBackupDirectory();
//       const backupPath = await this.createBackup();
//       await this.cleanupOldBackups();
      
//       console.log(`[${new Date().toISOString()}] Backup completed successfully: ${backupPath}`);
//     } catch (error) {
//       console.error(`[${new Date().toISOString()}] Backup failed:`, error);
//       throw error;
//     }
//   }

//   /**
//    * Ensures the backup directory exists
//    */
//   private async ensureBackupDirectory(): Promise<void> {
//     if (!fs.existsSync(this.config.backupDir)) {
//       fs.mkdirSync(this.config.backupDir, { recursive: true });
//       console.log(`Created backup directory: ${this.config.backupDir}`);
//     }
//   }

//   /**
//    * Creates a new backup using mongodump
//    */
//   private async createBackup(): Promise<string> {
//     const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
//     const backupName = `mongodb-backup-${timestamp}`;
//     const backupPath = path.join(this.config.backupDir, backupName);

//     let mongodumpCommand = `mongodump --uri="${this.config.mongoUri}" --out="${backupPath}"`;
    
//     if (this.config.enableCompression) {
//       mongodumpCommand += ' --gzip';
//     }

//     console.log(`Executing: ${mongodumpCommand.replace(this.config.mongoUri, '[REDACTED]')}`);
    
//     const { stdout, stderr } = await execAsync(mongodumpCommand);
    
//     if (stderr) {
//       console.warn('Mongodump stderr:', stderr);
//     }
    
//     if (stdout) {
//       console.log('Mongodump stdout:', stdout);
//     }

//     return backupPath;
//   }

//   /**
//    * Removes backup files older than the retention period
//    */
//   private async cleanupOldBackups(): Promise<void> {
//     try {
//       const files = fs.readdirSync(this.config.backupDir);
//       const cutoffDate = new Date();
//       cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

//       for (const file of files) {
//         const filePath = path.join(this.config.backupDir, file);
//         const stats = fs.statSync(filePath);
        
//         if (stats.isDirectory() && stats.mtime < cutoffDate) {
//           fs.rmSync(filePath, { recursive: true, force: true });
//           console.log(`Removed old backup: ${file}`);
//         }
//       }
//     } catch (error) {
//       console.error('Error during cleanup:', error);
//     }
//   }
// }

// class BackupScheduler {
//   private backupService: MongoBackupService;
//   private scheduleInterval: NodeJS.Timeout | null = null;

//   constructor(backupService: MongoBackupService) {
//     this.backupService = backupService;
//   }

//   /**
//    * Starts the backup scheduler
//    */
//   start(): void {
//     console.log('Starting backup scheduler...');
//     this.scheduleNextBackup();
//   }

//   /**
//    * Stops the backup scheduler
//    */
//   stop(): void {
//     if (this.scheduleInterval) {
//       clearTimeout(this.scheduleInterval);
//       this.scheduleInterval = null;
//       console.log('Backup scheduler stopped');
//     }
//   }

//   /**
//    * Calculates and schedules the next backup
//    */
//   private scheduleNextBackup(): void {
//     const now = new Date();
//     const nextMonday = this.getNextMondayAt2AM(now);
//     const timeUntilNext = nextMonday.getTime() - now.getTime();

//     console.log(`Next backup scheduled for: ${nextMonday.toISOString()}`);
//     console.log(`Time until next backup: ${Math.round(timeUntilNext / 1000 / 60)} minutes`);

//     this.scheduleInterval = setTimeout(async () => {
//       try {
//         await this.backupService.performBackup();
//       } catch (error) {
//         console.error('Scheduled backup failed:', error);
//       }
      
//       // Schedule the next backup
//       this.scheduleNextBackup();
//     }, timeUntilNext);
//   }

//   /**
//    * Calculates the next Monday at 02:00
//    */
//   private getNextMondayAt2AM(from: Date): Date {
//     const result = new Date(from);
//     result.setHours(2, 0, 0, 0);
    
//     const dayOfWeek = result.getDay();
//     const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7;
    
//     if (daysUntilMonday === 0 && result <= from) {
//       // If it's already Monday but past 02:00, schedule for next Monday
//       result.setDate(result.getDate() + 7);
//     } else {
//       result.setDate(result.getDate() + daysUntilMonday);
//     }
    
//     return result;
//   }
// }

// /**
//  * Main execution function
//  */
// async function main(): Promise<void> {
//   const config: BackupConfig = {
//     mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017',
//     backupDir: '/backup',
//     retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '3000'),
//     enableCompression: process.env.ENABLE_COMPRESSION === 'true'
//   };

//   console.log('MongoDB Backup Service Configuration:');
//   console.log(`- Backup Directory: ${config.backupDir}`);
//   console.log(`- Retention Days: ${config.retentionDays}`);
//   console.log(`- Compression: ${config.enableCompression ? 'Enabled' : 'Disabled'}`);
//   console.log(`- Schedule: Every Monday at 02:00`);

//   const backupService = new MongoBackupService(config);
//   const scheduler = new BackupScheduler(backupService);

//   // Handle graceful shutdown
//   process.on('SIGINT', () => {
//     console.log('Received SIGINT, shutting down gracefully...');
//     scheduler.stop();
//     process.exit(0);
//   });

//   process.on('SIGTERM', () => {
//     console.log('Received SIGTERM, shutting down gracefully...');
//     scheduler.stop();
//     process.exit(0);
//   });

//   // Start the scheduler
//   scheduler.start();

//   // Keep the process running
//   console.log('MongoDB backup service is running. Press Ctrl+C to stop.');
// }

// // Execute main function if this script is run directly
// if (require.main === module) {
//   main().catch((error) => {
//     console.error('Application failed to start:', error);
//     process.exit(1);
//   });
// }