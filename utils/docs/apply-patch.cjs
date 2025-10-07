#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const patchFile = path.join(__dirname, 'templateHelper.patch');
const targetFile = path.join(__dirname, '../../node_modules/jsdoc/lib/jsdoc/util/templateHelper.js');

// Check if jsdoc is installed
if (!fs.existsSync(targetFile)) {
	console.log('jsdoc not found, skipping patch');
	process.exit(0);
}

// Check if already patched
const content = fs.readFileSync(targetFile, 'utf8');
if (content.includes('buildMemberofIndex')) {
	console.log('✓ jsdoc already patched');
	process.exit(0);
}

// Apply the patch
try {
	execSync(`patch -p0 < "${patchFile}"`, {
		cwd: path.join(__dirname, '../..'),
		stdio: 'pipe'
	});
	console.log('✓ Applied JSDoc performance patch (7.5x faster docs build)');
} catch (err) {
	console.error('Failed to apply patch:', err.message);
	process.exit(1);
}
