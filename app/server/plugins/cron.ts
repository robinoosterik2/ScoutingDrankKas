// This plugin initializes cron jobs when the server starts
import { defineNitroPlugin } from '#imports';
import initBackupCron from '~/server/cron/weeklyBackup';

export default defineNitroPlugin(async () => {
  try {
    console.log('🔄 Initializing cron jobs...');
    
    // Initialize the backup cron job
    await initBackupCron();
    
    console.log('✅ Cron jobs initialized');
  } catch (error) {
    console.error('❌ Failed to initialize cron jobs:', error);
  }
});
