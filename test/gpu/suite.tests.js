// Discover tests automatically and share imports and a renderer per backend.
// The export explicitly marks this file as an ES module for static analyzers.
export default import.meta.glob( [
	'../unit/src/nodes/tsl/*.tests.js',
	'!../unit/src/nodes/tsl/TSLCore.tests.js',
	'../unit/src/nodes/lighting/EnvironmentNode.tests.js'
], { eager: true } );
