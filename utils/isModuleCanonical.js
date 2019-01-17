// List of strings and regexp tests describing which
// modules should be considered the canonical source
var canonicalModules = [
	/controls\/.*/
];

// takes a path relative to the jsm directory
// 'controls/OrbitControls.js' for example
function isModuleCanonical( p ) {

	p = p.replace( /\\/g, '/' );

	for ( var i in canonicalModules ) {

		const name = canonicalModules[ i ];
		if ( name instanceof RegExp && name.test( p ) ) {

			return true;

		}

		if ( typeof name === 'string' && p === name ) {

			return true;

		}

	}

	return false;

}

module.exports = isModuleCanonical;
