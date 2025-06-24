// server/cron/weeklyBackup.js
import { join } from 'path';
import cron from 'node-cron';
import { spawn } from 'child_process';
import fs from 'fs';
import { ConfidentialClientApplication } from '@azure/msal-node';
import fetch from 'node-fetch';

// File URL to path conversion can be added here if needed in the future

async function initBackupCron() {
  console.log('🔧 Initializing weekly backup cron job...');

  // Only run in production environment
  if (process.env.NODE_ENV !== 'production') {
    console.log('🛑 Not in production environment - backup cron job will not run');
    return;
  }

  // Validate required environment variables
  const requiredEnvVars = [
    'MS_CLIENT_ID',
    'MS_TENANT_ID',
    'MS_CLIENT_SECRET',
    'MONGO_DATABASE',
    'BACKUP_DIR'
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  // Config from environment variables
  const backupDir = join(process.cwd(), process.env.BACKUP_DIR || 'mongo_backups');
  const dbName = process.env.MONGO_DATABASE;
  
  // Create a fresh dump file path each time the function runs
  const getDumpFilePath = () => 
    join(backupDir, `${dbName}-${new Date().toISOString().split('T')[0]}.gz`);

  // Optional environment variables with defaults
  const CRON_SCHEDULE = process.env.BACKUP_CRON_SCHEDULE || '0 2 * * 0'; // Default: Every Sunday at 2 AM

  // MSAL Config (register app in Azure first)
  const msalConfig = {
    auth: {
      clientId: process.env.MS_CLIENT_ID,
      authority: `https://login.microsoftonline.com/${process.env.MS_TENANT_ID}`,
      clientSecret: process.env.MS_CLIENT_SECRET
    }
  };

  const tokenRequest = {
    scopes: ['https://graph.microsoft.com/.default']
  };

  const uploadToOneDrive = async (filePath, fileName) => {
    const cca = new ConfidentialClientApplication(msalConfig);
    const tokenResponse = await cca.acquireTokenByClientCredential(tokenRequest);
    const token = tokenResponse.accessToken;

    const fileStream = fs.createReadStream(filePath);
    const uploadUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/backups/${fileName}:/content`;

    const res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/octet-stream'
      },
      body: fileStream
    });

    if (!res.ok) {
      throw new Error(`Upload failed: ${res.statusText}`);
    }
    console.log(`✅ Uploaded ${fileName} to OneDrive`);
  };

  const runMongoDump = (dumpFilePath) => {
    return new Promise((resolve, reject) => {
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      const args = [`--db=${dbName}`, `--archive=${dumpFilePath}`, '--gzip'];
      const dump = spawn('mongodump', args);

      dump.stderr.on('data', data => console.error(`stderr: ${data}`));
      dump.on('error', err => reject(err));
      dump.on('exit', code => {
        if (code === 0) {
          console.log(`✅ Dumped MongoDB to ${dumpFilePath}`);
          resolve(dumpFilePath);
        } else {
          reject(new Error(`mongodump failed with code ${code}`));
        }
      });
    });
  };

  // ⏰ Schedule the backup
  console.log(`🔧 Backup scheduled with cron: ${CRON_SCHEDULE}`);
  
  // Run backup immediately when the server starts (optional, remove if not needed)
  // await runBackup();
  
  // Schedule the backup
  cron.schedule(CRON_SCHEDULE, async () => {
    try {
      console.log('🕑 Weekly backup started...');
      const currentDumpFile = getDumpFilePath();
      await runMongoDump(currentDumpFile);
      await uploadToOneDrive(currentDumpFile, currentDumpFile.split('/').pop());
      console.log('🎉 Weekly backup completed.');
    } catch (err) {
      console.error('❌ Backup failed:', err);
    }
  });
  
  console.log('✅ Weekly backup cron job initialized');
}

// Export the initialization function
export default initBackupCron;
