/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 *
 * The CommonJS build of three is deprecated. three is ESM-only going forward;
 * this entry now re-exports the ES module via require(esm) and will be removed
 * in a future release.
 * 
 * Replace `require('three')` with `import * as THREE from 'three'`.
 */
process.emitWarning(
	'`require("three")` is deprecated and will be removed.\n' +
	'Replace `const THREE = require("three")` with `import * as THREE from "three"`.',
	{ type: 'DeprecationWarning', code: 'THREE_CJS_DEPRECATED' }
);
module.exports = require( './three.module.js' );
