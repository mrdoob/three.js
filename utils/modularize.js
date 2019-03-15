/**
 * @author mrdoob / http://mrdoob.com/
 */

var fs = require( 'fs' );

var srcFolder = __dirname + '/../examples/js/';
var dstFolder = __dirname + '/../examples/jsm/';

var files = [
	{ path: 'controls/OrbitControls.js', ignoreList: [] },
	{ path: 'controls/MapControls.js', ignoreList: [] },
	{ path: 'controls/TrackballControls.js', ignoreList: [] },
	// { path: 'controls/TransformControls.js', ignoreList: [] },

	{ path: 'exporters/GLTFExporter.js', ignoreList: [ 'AnimationClip', 'Camera', 'Geometry', 'Material', 'Mesh', 'Object3D', 'RGBFormat', 'Scenes', 'ShaderMaterial', 'VertexColors' ] },
	{ path: 'exporters/MMDExporter.js', ignoreList: [] },
	{ path: 'exporters/OBJExporter.js', ignoreList: [] },
	{ path: 'exporters/PLYExporter.js', ignoreList: [] },
	{ path: 'exporters/STLExporter.js', ignoreList: [] },
	{ path: 'exporters/TypedGeometryExporter.js', ignoreList: [] },

	{ path: 'loaders/GLTFLoader.js', ignoreList: [ 'NoSide', 'Matrix2', 'DDSLoader' ] },
	{ path: 'loaders/OBJLoader.js', ignoreList: [] },
	{ path: 'loaders/MTLLoader.js', ignoreList: [] },

	{ path: 'utils/BufferGeometryUtils.js', ignoreList: [] },
	{ path: 'utils/GeometryUtils.js', ignoreList: [] },
	{ path: 'utils/MathUtils.js', ignoreList: [] },
	{ path: 'utils/SceneUtils.js', ignoreList: [] },
	{ path: 'utils/ShadowMapViewer.js', ignoreList: [ 'DirectionalLight', 'SpotLight' ] },
	{ path: 'utils/SkeletonUtils.js', ignoreList: [] },
	{ path: 'utils/UVsDebug.js', ignoreList: [ 'SphereBufferGeometry' ] },
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

	// imports

	contents = contents.replace( /^\/\*+[^*]*\*+(?:[^/*][^*]*\*+)*\//, function ( match ) {

		return `${match}\n\n_IMPORTS_`;

	} );

	// class name

	contents = contents.replace( /THREE\.([a-zA-Z0-9]+) = /g, function ( match, p1 ) {

		className = p1;

		console.log( className );

		return `var ${p1} = `;

	} );

	contents = contents.replace( /(\'?)THREE\.([a-zA-Z0-9]+)(\.{0,1})/g, function ( match, p1, p2, p3 ) {

		if ( p1 === '\'' ) return match; // Inside a string
		if ( p2 === className ) return `${p2}${p3}`;

		if ( p1 === 'Math' ) {

			dependencies[ '_Math' ] = true;

			return '_Math.';

		}

		return match;

	} );

	// methods

	contents = contents.replace( /new THREE\.([a-zA-Z0-9]+)\(/g, function ( match, p1 ) {

		if ( ignoreList.includes( p1 ) ) return match;

		dependencies[ p1 ] = true;

		return `new ${p1}(`;

	} );

	// constants

	contents = contents.replace( /(\'?)THREE\.([a-zA-Z0-9]+)/g, function ( match, p1, p2 ) {

		if ( ignoreList.includes( p2 ) ) return match;
		if ( p1 === '\'' ) return match; // Inside a string
		if ( p2 === className ) return p2;

		if ( p2 === 'Math' || p2 === '_Math' ) {

			dependencies[ '_Math' ] = true;

			return '_Math';

		}

		dependencies[ p2 ] = true;

		// console.log( match, p2 );

		return `${p2}`;

	} );

	//

	var keys = Object.keys( dependencies )
		.filter( value => value !== className )
		.map( value => value === '_Math' ? 'Math as _Math' : value )
		.map( value => '\n\t' + value )
		.sort()
		.toString();
	var imports = `import {${keys}\n} from "../../../build/three.module.js";`;
	var exports = `export { ${className} };\n`;

	var output = contents.replace( '_IMPORTS_', keys ? imports : '' ) + '\n' + exports;

	// console.log( output );

	fs.writeFileSync( dstFolder + path, output, 'utf-8' );

};
