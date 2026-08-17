import {
	FileLoader,
	Loader
} from 'three';

import { PLYLoader } from './PLYLoader.js';
import {
	SH_BAND_COMPONENTS,
	SH_BAND_WORDS,
	createGaussianSplatGeometry,
	createPackedSphericalHarmonicsBand,
	sigmoid,
	writeColorBytesFromSH0,
	writeCovariance
} from '../utils/GaussianSplatUtils.js';

// f_rest component count, indexed by spherical harmonics degree.
const SH_DEGREE_TO_COMPONENTS = [ 0, 9, 24, 45 ];

const GAUSSIAN_SPLAT_PLY_PROPERTY_MAPPING = {
	scale: [ 'scale_0', 'scale_1', 'scale_2' ],
	rotation: [ 'rot_0', 'rot_1', 'rot_2', 'rot_3' ],
	f_dc: [ 'f_dc_0', 'f_dc_1', 'f_dc_2' ],
	opacity: [ 'opacity' ]
};

// Property names a Gaussian splat PLY must declare in its header. Checked
// up front against the header text rather than the parsed geometry, since
// PLYLoader still creates a (garbage-filled) attribute for a custom property
// name that's missing from the file instead of omitting it.
const REQUIRED_PLY_PROPERTIES = [
	'x', 'y', 'z',
	...GAUSSIAN_SPLAT_PLY_PROPERTY_MAPPING.scale,
	...GAUSSIAN_SPLAT_PLY_PROPERTY_MAPPING.rotation,
	...GAUSSIAN_SPLAT_PLY_PROPERTY_MAPPING.f_dc,
	...GAUSSIAN_SPLAT_PLY_PROPERTY_MAPPING.opacity
];

const _headerPattern = /^ply([\s\S]*?)end_header/;
const _propertyPattern = /^property\s+\S+\s+(\S+)\s*$/;
const _restPropertyPattern = /^f_rest_\d+$/;

/**
 * A loader for Gaussian splat PLY files, e.g. as exported by the original
 * GraphDECO/INRIA 3D Gaussian Splatting implementation.
 *
 * PLY itself is a generic format, so the caller would normally have to know
 * the file's spherical harmonics (SH) degree ahead of time to configure
 * `PLYLoader` with the right custom property mapping before parsing. This
 * loader avoids that by scanning the plain-text PLY header for `f_rest_N`
 * properties first, since SH degree maps to a fixed, closed table of
 * `f_rest` counts (0/9/24/45 -> degree 0/1/2/3), and configuring an
 * internal `PLYLoader` accordingly before converting the result into
 * Gaussian splat geometry.
 *
 * ```js
 * const loader = new PLYGaussianSplatLoader();
 * const geometry = await loader.loadAsync( './models/gsplat/point_cloud.ply' );
 * scene.add( new GaussianSplatMesh( geometry ) );
 * ```
 *
 * @augments Loader
 * @three_import import { PLYGaussianSplatLoader } from 'three/addons/loaders/PLYGaussianSplatLoader.js';
 */
class PLYGaussianSplatLoader extends Loader {

	/**
	 * Constructs a new Gaussian splat PLY loader.
	 *
	 * @param {LoadingManager} [manager] - The loading manager.
	 */
	constructor( manager ) {

		super( manager );

	}

	/**
	 * Starts loading from the given URL and passes the loaded Gaussian splat
	 * geometry to the `onLoad()` callback.
	 *
	 * @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
	 * @param {function(BufferGeometry)} onLoad - Executed when the loading process has been finished.
	 * @param {onProgressCallback} onProgress - Executed while the loading is in progress.
	 * @param {onErrorCallback} onError - Executed when errors occur.
	 */
	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const loader = new FileLoader( this.manager );
		loader.setPath( this.path );
		loader.setResponseType( 'arraybuffer' );
		loader.setRequestHeader( this.requestHeader );
		loader.setWithCredentials( this.withCredentials );
		loader.load( url, function ( data ) {

			try {

				onLoad( scope.parse( data ) );

			} catch ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					console.error( e );

				}

				scope.manager.itemError( url );

			}

		}, onProgress, onError );

	}

	/**
	 * Parses the given Gaussian splat PLY data and returns the resulting
	 * Gaussian splat geometry.
	 *
	 * This scans the PLY header for the file's spherical harmonics degree,
	 * so unlike a plain `PLYLoader`, no prior setup is required.
	 *
	 * @param {ArrayBuffer|string} data - The raw PLY data, as an array buffer or string.
	 * @return {BufferGeometry} The parsed Gaussian splat geometry.
	 */
	parse( data ) {

		const degree = detectSphericalHarmonicsDegree( data );

		const plyLoader = new PLYLoader( this.manager );
		plyLoader.setCustomPropertyNameMapping( getPropertyMapping( degree ) );

		return convertPLYGeometry( plyLoader.parse( data ) );

	}

}

// Scans the PLY header text for its vertex properties, verifying the
// required Gaussian splat properties are present and mapping the number of
// "f_rest_N" properties found to a spherical harmonics degree. PLY headers
// are always plain ASCII text that fully precedes the vertex data, so this
// can run before the file is parsed by the generic PLYLoader.
function detectSphericalHarmonicsDegree( data ) {

	const headerText = typeof data === 'string' ? data : decodeHeaderText( new Uint8Array( data ) );
	const headerMatch = _headerPattern.exec( headerText );

	if ( headerMatch === null ) {

		throw new Error( 'THREE.PLYGaussianSplatLoader: Missing PLY header.' );

	}

	const propertyNames = new Set();
	let restComponentCount = 0;

	for ( const line of headerMatch[ 1 ].split( /\r\n|\r|\n/ ) ) {

		const propertyMatch = _propertyPattern.exec( line.trim() );

		if ( propertyMatch === null ) continue;

		propertyNames.add( propertyMatch[ 1 ] );

		if ( _restPropertyPattern.test( propertyMatch[ 1 ] ) ) restComponentCount ++;

	}

	if ( REQUIRED_PLY_PROPERTIES.some( name => ! propertyNames.has( name ) ) ) {

		throw new Error( 'THREE.PLYGaussianSplatLoader: PLY file requires position, scale, rotation, f_dc and opacity properties.' );

	}

	const degree = SH_DEGREE_TO_COMPONENTS.indexOf( restComponentCount );

	if ( degree === - 1 ) {

		throw new Error( `THREE.PLYGaussianSplatLoader: Unsupported number of f_rest spherical harmonics coefficients (${ restComponentCount }).` );

	}

	return degree;

}

// Decodes only the bytes up to and including "end_header" as text, falling
// back to the full buffer if that marker isn't found, so this doesn't pay
// the cost of decoding the (potentially large) binary vertex data as text.
function decodeHeaderText( bytes ) {

	const marker = 'end_header';
	const scanLength = Math.min( bytes.length, 1024 * 1024 );
	let headerEnd = - 1;

	for ( let i = 0; i <= scanLength - marker.length; i ++ ) {

		let matches = true;

		for ( let j = 0; j < marker.length; j ++ ) {

			if ( bytes[ i + j ] !== marker.charCodeAt( j ) ) {

				matches = false;
				break;

			}

		}

		if ( matches ) {

			headerEnd = i + marker.length;
			break;

		}

	}

	const end = headerEnd === - 1 ? bytes.length : headerEnd;

	return new TextDecoder().decode( bytes.subarray( 0, end ) );

}

// Builds the PLYLoader custom-property mapping for a given SH degree,
// grouping the raw "f_rest_N" scalar properties into one combined
// "f_rest" attribute when the degree calls for it.
function getPropertyMapping( sphericalHarmonicsDegree ) {

	const restComponentCount = SH_DEGREE_TO_COMPONENTS[ sphericalHarmonicsDegree ];

	const mapping = {
		scale: GAUSSIAN_SPLAT_PLY_PROPERTY_MAPPING.scale,
		rotation: GAUSSIAN_SPLAT_PLY_PROPERTY_MAPPING.rotation,
		f_dc: GAUSSIAN_SPLAT_PLY_PROPERTY_MAPPING.f_dc,
		opacity: GAUSSIAN_SPLAT_PLY_PROPERTY_MAPPING.opacity
	};

	if ( restComponentCount > 0 ) {

		mapping.f_rest = Array.from( { length: restComponentCount }, ( _, i ) => `f_rest_${ i }` );

	}

	return mapping;

}

// Converts the generic PLYLoader output - using the Gaussian splat custom
// property mapping above - into Gaussian splat geometry.
function convertPLYGeometry( geometry ) {

	const position = geometry.getAttribute( 'position' );
	const scale = geometry.getAttribute( 'scale' );
	const rotation = geometry.getAttribute( 'rotation' );
	const sh0 = geometry.getAttribute( 'f_dc' );
	const shRest = geometry.getAttribute( 'f_rest' );
	const opacity = geometry.getAttribute( 'opacity' );

	if ( position === undefined || scale === undefined || rotation === undefined || sh0 === undefined || opacity === undefined ) {

		throw new Error( 'THREE.PLYGaussianSplatLoader: PLY file requires position, scale, rotation, f_dc and opacity properties.' );

	}

	const count = position.count;

	if ( position.itemSize !== 3 || scale.itemSize !== 3 || rotation.itemSize !== 4 || sh0.itemSize !== 3 || opacity.itemSize !== 1 ) {

		throw new Error( 'THREE.PLYGaussianSplatLoader: Invalid Gaussian splat PLY property itemSize.' );

	}

	if ( scale.count !== count || rotation.count !== count || sh0.count !== count || opacity.count !== count ) {

		throw new Error( 'THREE.PLYGaussianSplatLoader: Gaussian splat PLY property counts must match position.' );

	}

	const centers = new Float32Array( count * 3 );
	const covariances = new Float32Array( count * 6 );
	const colors = new Uint8ClampedArray( count * 4 );
	const sphericalHarmonicsDegree = getRestSphericalHarmonicsDegree( shRest );
	const sphericalHarmonics = {};
	const sphericalHarmonicsBytes = {};

	for ( let degree = 1; degree <= sphericalHarmonicsDegree; degree ++ ) {

		const band = createPackedSphericalHarmonicsBand( count, degree );
		sphericalHarmonics[ `sh${ degree }` ] = band.packed;
		sphericalHarmonicsBytes[ `sh${ degree }` ] = band.bytes;

	}

	for ( let i = 0; i < count; i ++ ) {

		const i3 = i * 3;
		centers[ i3 ] = position.getX( i );
		centers[ i3 + 1 ] = position.getY( i );
		centers[ i3 + 2 ] = position.getZ( i );

		const sx = Math.exp( scale.getX( i ) );
		const sy = Math.exp( scale.getY( i ) );
		const sz = Math.exp( scale.getZ( i ) );

		// GraphDECO/INRIA PLY stores quaternions as rot_0=w, rot_1=x, rot_2=y, rot_3=z.
		const qw = rotation.getX( i );
		const qx = rotation.getY( i );
		const qy = rotation.getZ( i );
		const qz = rotation.getW( i );

		writeCovariance( covariances, i * 6, sx, sy, sz, qx, qy, qz, qw );
		writeColorBytesFromSH0(
			colors,
			i * 4,
			sh0.getX( i ),
			sh0.getY( i ),
			sh0.getZ( i ),
			sigmoid( opacity.getX( i ) )
		);

		if ( sphericalHarmonicsDegree > 0 ) {

			writeSphericalHarmonicsFromRest( sphericalHarmonicsBytes, i, shRest );

		}

	}

	return createGaussianSplatGeometry( centers, covariances, colors, sphericalHarmonics );

}

function getRestSphericalHarmonicsDegree( shRest ) {

	if ( shRest === undefined ) return 0;

	const degree = SH_DEGREE_TO_COMPONENTS.indexOf( shRest.itemSize );

	if ( degree === - 1 ) {

		throw new Error( 'THREE.PLYGaussianSplatLoader: Unsupported number of f_rest spherical harmonics coefficients.' );

	}

	return degree;

}

function writeSphericalHarmonicsFromRest( sphericalHarmonicsBytes, index, shRest ) {

	const stride = shRest.itemSize / 3;
	const source = shRest.array;
	const sourceOffset = index * shRest.itemSize;

	for ( let degree = 1; degree <= 3; degree ++ ) {

		const target = sphericalHarmonicsBytes[ `sh${ degree }` ];

		if ( target === undefined ) break;

		const bandOffset = degree === 1 ? 0 : degree === 2 ? 3 : 8;
		const byteStride = SH_BAND_WORDS[ degree ] * 4;
		const targetOffset = index * byteStride;

		for ( let j = 0; j < SH_BAND_COMPONENTS[ degree ]; j ++ ) {

			const coefficient = Math.floor( j / 3 );
			const channel = j % 3;
			target[ targetOffset + j ] = source[ sourceOffset + bandOffset + coefficient + channel * stride ] * 128 + 128;

		}

	}

}

export { PLYGaussianSplatLoader };
