var fs = require( 'fs' );
var path = require( 'path' );

if ( process.argv.length <= 2 ) {

	console.log( `Usage: ${path.basename( __filename )} model.fbx` );
	process.exit( - 1 );

}

//

var PRECISION = 6;

function parseNumber( key, value ) {

	return typeof value === 'number' ? parseFloat( value.toFixed( PRECISION ) ) : value;

}

THREE = require( '../../build/three.js' );
require( '../../examples/js/curves/NURBSCurve.js' );
require( '../../examples/js/curves/NURBSUtils.js' );
require( '../../examples/js/loaders/FBXLoader.js' );
global.Zlib = require( '../../examples/js/libs/inflate.min.js' ).Zlib;

global.window = {
	innerWidth: 1024,
	innerHeight: 768,
	URL: {

		createObjectURL: function () {

			throw new Error( 'fbx2three: Images in binary format not yet supported.' );

		}

	}
};

// HTML Images are not available, so use a Buffer instead.
THREE.ImageLoader.prototype.load = function ( url, onLoad ) {

	if ( this.path !== undefined ) url = this.path + url;

	// If image isn't found, try to ignore it.
	if ( ! fs.existsSync( url ) ) {

		onLoad( new Buffer( '' ) );
		return;

	}

	onLoad( fs.readFileSync( url ) );

};

// Convert image buffer to data URL.
THREE.ImageUtils.getDataURL = function ( image ) {

	if ( ! ( image instanceof Buffer ) ) {

		throw new Error( 'fbx2three: Image should be loaded as Buffer.' );

	}

	var dataURL = 'data:';
	dataURL += this.format === THREE.RGBAFormat ? 'image/png' : 'image/jpeg';
	dataURL += ';base64,';
	dataURL += image.toString( 'base64' );
	return dataURL;

};

//

var file = process.argv[ 2 ];
var resourceDirectory = THREE.LoaderUtils.extractUrlBase( file );
var loader = new THREE.FBXLoader();

var arraybuffer = fs.readFileSync( file ).buffer;
var object = loader.parse( arraybuffer, resourceDirectory );
var content = JSON.stringify( object.toJSON(), parseNumber );
fs.writeFileSync( path.basename( file, '.fbx' ) + '.json', content, 'utf8' );
