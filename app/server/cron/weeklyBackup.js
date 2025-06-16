// server/cron/weeklyBackup.js
import cron from 'node-cron';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { ConfidentialClientApplication } from '@azure/msal-node';
import fetch from 'node-fetch';

// Only run in production environment
if (process.env.NODE_ENV !== 'production') {
  console.log('🛑 Not in production environment - backup cron job will not run');
  process.exit(0);
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
const backupDir = path.resolve(process.env.BACKUP_DIR || './mongo_backups')
const dbName = process.env.MONGO_DATABASE
const dumpFile = path.join(backupDir, `${dbName}-${new Date().toISOString().split('T')[0]}.gz`)

// Optional environment variables with defaults
const CRON_SCHEDULE = process.env.BACKUP_CRON_SCHEDULE || '0 2 * * 0' // Default: Every Sunday at 2 AM

// MSAL Config (register app in Azure first)
const msalConfig = {
	auth: {
		clientId: process.env.MS_CLIENT_ID,
		authority: `https://login.microsoftonline.com/${process.env.MS_TENANT_ID}`,
		clientSecret: process.env.MS_CLIENT_SECRET
	}
}

const tokenRequest = {
	scopes: ['https://graph.microsoft.com/.default']
}

const uploadToOneDrive = async (filePath, fileName) => {
	const cca = new ConfidentialClientApplication(msalConfig)
	const tokenResponse = await cca.acquireTokenByClientCredential(tokenRequest)
	const token = tokenResponse.accessToken

	const fileStream = fs.createReadStream(filePath)

	const uploadUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/backups/${fileName}:/content`

	const res = await fetch(uploadUrl, {
		method: 'PUT',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/octet-stream'
		},
		body: fileStream
	})

	if (!res.ok) {
		throw new Error(`Upload failed: ${res.statusText}`)
	}
	console.log(`✅ Uploaded ${fileName} to OneDrive`)
}

const runMongoDump = () => {
	return new Promise((resolve, reject) => {
		if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir)

		const args = [`--db=${dbName}`, `--archive=${dumpFile}`, '--gzip']
		const dump = spawn('mongodump', args)

		dump.stderr.on('data', data => console.error(`stderr: ${data}`))
		dump.on('error', err => reject(err))
		dump.on('exit', code => {
			if (code === 0) {
				console.log(`✅ Dumped MongoDB to ${dumpFile}`)
				resolve(dumpFile)
			} else {
				reject(new Error(`mongodump failed with code ${code}`))
			}
		})
	})
}

// ⏰ Schedule the backup
console.log(`🔧 Backup scheduled with cron: ${CRON_SCHEDULE}`)
cron.schedule(CRON_SCHEDULE, async () => {
	try {
		console.log('🕑 Weekly backup started...')
		await runMongoDump()
		await uploadToOneDrive(dumpFile, path.basename(dumpFile))
		console.log('🎉 Weekly backup completed.')
	} catch (err) {
		console.error('❌ Backup failed:', err)
	}
})
