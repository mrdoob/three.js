/**
 * @author mrdoob / http://mrdoob.com/
 */

var fs = require( 'fs' );

var srcFolder = '../examples/js/';
var dstFolder = '../examples/jsm/';

var files = [
	{ path: 'controls/OrbitControls.js', ignoreList: [] },
	{ path: 'controls/MapControls.js', ignoreList: [] },
	{ path: 'controls/TrackballControls.js', ignoreList: [] },
	// { path: 'controls/TransformControls.js', ignoreList: [] },
	{ path: 'exporters/GLTFExporter.js', ignoreList: [] },
	{ path: 'loaders/GLTFLoader.js', ignoreList: [ 'NoSide', 'Matrix2', 'DDSLoader' ] },
	{ path: 'loaders/OBJLoader.js', ignoreList: [] },
	{ path: 'loaders/MTLLoader.js', ignoreList: [] }
];

for ( var i = 0; i < files.length; i ++ ) {

	var file = files[ i ];
	convert( file.path, file.ignoreList );

}

//

function convert( path, ignoreList ) {

	var contents = fs.readFileSync( srcFolder + path, 'utf8' );

	var className = '';
	var dependencies = {};

	// class name

	contents = contents.replace( /THREE\.([a-zA-Z0-9]+) = /g, function ( match, p1 ) {

		className = p1;

		console.log( className );

		return `_IMPORTS_\n\nvar ${p1} = `;

	} );

	contents = contents.replace( /(\'?)THREE\.([a-zA-Z0-9]+)(\.{0,1})/g, function ( match, p1, p2, p3 ) {

		if ( p1 === '\'' ) return match; // Inside a string
		if ( p2 === className ) return `${p2}${p3}`;

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
		if ( p1 === className ) return match;

		dependencies[ p1 ] = true;

		// console.log( match, p1 );

		return `${p1}`;

	} );

	//

	var keys = Object.keys( dependencies ).sort().map( value => '\n\t' + value ).toString();
	var imports = `import {${keys}\n} from "../../../build/three.module.js";`;
	var exports = `export { ${className} };\n`;

	var output = contents.replace( '_IMPORTS_', imports ) + '\n' + exports;

	// console.log( output );

	fs.writeFileSync( dstFolder + path, output, 'utf-8' );

};
