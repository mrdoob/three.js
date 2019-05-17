/**
 * @author mrdoob / http://mrdoob.com/
 */

var fs = require( 'fs' );
var { join, dirname } = require( 'path' );

var srcFolder = __dirname + '/../examples/js/';
var dstFolder = __dirname + '/../examples/jsm/';

const files = [];
const ignoreLists = {
	'exporters/GLTFExporter.js': [ 'AnimationClip', 'Camera', 'Geometry', 'Material', 'Mesh', 'Object3D', 'RGBFormat', 'Scenes', 'ShaderMaterial', 'VertexColors' ],
	'loaders/GLTFLoader.js': [ 'NoSide', 'Matrix2', 'DDSLoader' ],
	'utils/ShadowMapViewer.js': [ 'DirectionalLight', 'SpotLight' ],
	'utils/UVsDebug.js': [ 'SphereBufferGeometry' ]
};

function walkDir( dir ) {

	fs.readdirSync( dir ).forEach( f => {

		let dirPath = join( dir, f );
		let isDirectory = fs.statSync( dirPath ).isDirectory();
		if ( isDirectory ) {

			walkDir( dirPath );
			return;

		}
		const path = join( dir, f ).substr( __dirname.length + 7 );
		files.push( {
			path,
			ignoreList: ignoreLists[ path ] || []
		} );

	} );

}

walkDir( srcFolder );

for ( var i = 0; i < files.length; i ++ ) {

	var file = files[ i ];
	convert( file.path, file.ignoreList );

}

//

function convert( path, ignoreList ) {

	var contents = fs.readFileSync( srcFolder + path, 'utf8' );

	var classNames = [];
	var dependencies = {};

	// imports

	contents = contents.replace( /^\/\*+[^*]*\*+(?:[^/*][^*]*\*+)*\//, function ( match ) {

		return `${match}\n\n_IMPORTS_`;

	} );

	// class name

	contents = contents.replace( /THREE\.([a-zA-Z0-9]+) = /g, function ( match, p1 ) {

		classNames.push( p1 );

		return `var ${p1} = `;

	} );

	if ( ! classNames.length ) {

		console.log( `Skipping ${path}: no exports found` );

	}

	contents = contents.replace( /(\'?)THREE\.([a-zA-Z0-9]+)(\.{0,1})/g, function ( match, p1, p2, p3 ) {

		if ( p1 === '\'' ) return match; // Inside a string
		if ( classNames.indexOf( p2 ) >= 0 ) return `${p2}${p3}`;

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
		if ( classNames.indexOf( p2 ) >= 0 ) return p2;

		if ( p2 === 'Math' || p2 === '_Math' ) {

			dependencies[ '_Math' ] = true;

			return '_Math';

		}

		dependencies[ p2 ] = true;

		// console.log( match, p2 );

		return `${p2}`;

	} );

	//

	const threeDependencies = [];
	const exampleDependencies = [];
	Object.keys( dependencies ).forEach( value => {

		if ( classNames.indexOf( value ) >= 0 ) {

			return;

		}
		const file = files.find( file => file.path.endsWith( `/${value}.js` ) );
		if ( file ) {

			exampleDependencies.push( file.path );
			return;

		}
		threeDependencies.push( value === '_Math' ? 'Math as _Math' : value );

	} );
	var imports = `${threeDependencies.length
		? `import {\n\t${threeDependencies.sort().join( ',\n\t' )}\n} from "../../../build/three.module.js";`
		: ''
	}${exampleDependencies.map( moduleDepency => `\nimport { ${moduleDepency.match( /([^/]*).js$/ )[ 1 ]} } from "../${moduleDepency}";` ).join( "" )}`;
	var exports = `export { ${classNames.join( ', ' )} };\n`;

	var output = contents.replace( '_IMPORTS_', imports ) + '\n' + exports;

	// console.log( output );

	var outputFilePath = dstFolder + path;
	var outputFileDir = dirname( outputFilePath );
	if ( ! fs.existsSync( outputFileDir ) ) {

		fs.mkdirSync( outputFileDir );

	}
	fs.writeFileSync( outputFilePath, output, 'utf-8' );

}
