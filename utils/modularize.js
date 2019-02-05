/**
 * @author mrdoob / http://mrdoob.com/
 */

var fs = require( 'fs' );
const path = require( 'path' );

var srcFolder = '../examples/js/';
var dstFolder = '../examples/jsm/';

var files = [
	{ path: 'controls/DragControls.js', ignoreList: [] },
	{ path: 'controls/EditorControls.js', ignoreList: [] },
	{ path: 'controls/FirstPersonControls.js', ignoreList: [] },
	{ path: 'controls/FlyControls.js', ignoreList: [] },
	{ path: 'controls/MapControls.js', ignoreList: [] },
	{ path: 'controls/OrbitControls.js', ignoreList: [] },
	{ path: 'controls/OrthographicTrackballControls.js', ignoreList: [] },
	{ path: 'controls/PointerLockControls.js', ignoreList: [] },
	{ path: 'controls/TrackballControls.js', ignoreList: [] },
	{ path: 'controls/TransformControls.js', ignoreList: [] },

	{ path: 'loaders/GLTFLoader.js', ignoreList: [ 'NoSide', 'Matrix2', 'DDSLoader', 'DRACOLoader', 'BufferGeometryUtils' ] },
	{ path: 'loaders/OBJLoader.js', ignoreList: [] }
];

for ( var i = 0; i < files.length; i ++ ) {

	var file = files[ i ];
	convert( file.path, file.ignoreList );

}

//

function convert( filePath, ignoreList ) {

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

		if ( ignoreList.includes( p1 ) ) return match;
		if ( p1 === className ) return `${p1}`;

		dependencies[ p1 ] = true;

		// console.log( match, p1 );

		return `${p1}`;

	} );

	// comments

	contents = contents.replace( /'THREE\.([a-zA-Z0-9]+)/g, function ( match, p1 ) {

		return `'${p1}`;

	} );

	//

	var keys = Object.keys( dependencies ).sort().map( value => '\n\t' + value ).toString();
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
