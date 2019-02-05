/**
 * @author mrdoob / http://mrdoob.com/
 */

var fs = require( 'fs' );
const path = require( 'path' );

var srcFolder = '../examples/js/';
var dstFolder = '../examples/jsm/';

var files = [
	{ path: 'controls/DragControls.js' },
	{ path: 'controls/EditorControls.js' },
	{ path: 'controls/FirstPersonControls.js' },
	{ path: 'controls/FlyControls.js' },
	{ path: 'controls/MapControls.js' },
	{ path: 'controls/OrbitControls.js' },
	{ path: 'controls/OrthographicTrackballControls.js' },
	{ path: 'controls/PointerLockControls.js' },
	{ path: 'controls/TrackballControls.js' },
	{ path: 'controls/TransformControls.js' },

	{ path: 'loaders/DDSLoader.js' },
	{ path: 'loaders/DRACOLoader.js' },
	{ path: 'loaders/GLTFLoader.js', ignoreList: [
			'NoSide', 'Matrix2', // unused variables
			'DDSLoader', 'DRACOLoader', // not sure how we should fix these, since they are optional includes
		] },
	{ path: 'loaders/MTLLoader.js' },
	{ path: 'loaders/OBJLoader.js' }
];

for ( var i = 0; i < files.length; i ++ ) {

	var file = files[ i ];
	convert( file.path, file.ignoreList );

}

//

function convert( filePath, ignoreList = [] ) {

	var contents = fs.readFileSync( srcFolder + filePath, 'utf8' );

	var className = '';
	var dependencies = {};

	// class name

	contents = contents.replace( /THREE\.([a-zA-Z0-9]+) = /g, function ( match, p1 ) {

		className = p1;

		console.log( className );

		return `_IMPORTS_\n\nvar ${p1} = `;

	} );

	contents = contents.replace( /THREE\.([a-zA-Z0-9]+)\./g, function ( match, p1 ) {

		if ( p1 === className ) return `${p1}.`;

		return match;

	} );

	// methods

	contents = contents.replace( /new THREE\.([a-zA-Z0-9]+)\(/g, function ( match, p1 ) {

		if ( ignoreList.includes( p1 ) ) return match;

		dependencies[ p1 ] = true;

		return `new ${p1}(`;

	} );

	// constants

	contents = contents.replace( /THREE\.([a-zA-Z0-9]+)/g, function ( match, p1 ) {

		if ( ignoreList.includes( p1 ) ) return p1;
		if ( p1 === className ) return p1;

		// there is both a THREE.Math and a Math
		if ( p1 === 'Math' ) {
			dependencies[ 'Math' ] = true;
			return `_Math`;
		}

		dependencies[ p1 ] = true;

		// console.log( match, p1 );

		return p1;

	} );

	// comments

	contents = contents.replace( /'THREE\.([a-zA-Z0-9]+)/g, function ( match, p1 ) {

		return `'${p1}`;

	} );

	//

	var keys = Object.keys( dependencies )
		.sort()
		// fix Math
		.map( value => value === 'Math' ? 'Math as _Math' : value)
		.map( value => '\n\t' + value )
		.toString();
	var imports = `import {${keys}\n} from '../../../build/three.module.js';`;
	var exports = `export { ${className} };\n`;

	var output = contents.replace( '_IMPORTS_', imports ) + '\n' + exports;

	// console.log( output );

	// make sure folder exists
	const dir = path.dirname( dstFolder + filePath );
	if ( !fs.existsSync( dir ) ){
		fs.mkdirSync( dir );
	}

	fs.writeFileSync( dstFolder + filePath, output, 'utf-8' );

};
