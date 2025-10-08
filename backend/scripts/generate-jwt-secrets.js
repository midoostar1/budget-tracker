#!/usr/bin/env node

const crypto = require('crypto');

console.log('\n🔐 JWT Secret Generator\n');
console.log('Copy these to your .env file:\n');

const accessSecret = crypto.randomBytes(32).toString('hex');
const refreshSecret = crypto.randomBytes(32).toString('hex');

console.log(`JWT_ACCESS_SECRET=${accessSecret}`);
console.log(`JWT_REFRESH_SECRET=${refreshSecret}`);
console.log('\n✅ Secrets generated successfully!\n');
