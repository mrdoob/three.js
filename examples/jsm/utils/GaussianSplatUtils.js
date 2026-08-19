import {
	BufferAttribute,
	BufferGeometry,
	Matrix3,
	Matrix4,
	Quaternion,
	Vector3
} from 'three';

const SH_C0 = 0.2820947917738781;
const SH_BAND_COMPONENTS = [ 0, 9, 15, 21 ];
// GPU upload packs four clamped-byte coefficients per uint32 word.
const SH_BAND_WORDS = [ 0, 3, 4, 6 ];

const _covarianceMatrix = new Matrix3();
const _covarianceMatrixTranspose = new Matrix3();
const _rotationScaleMatrix = new Matrix4();
const _quaternion = new Quaternion();
const _scale = new Vector3();
const _zero = new Vector3();

function sigmoid( value ) {

	return 1 / ( 1 + Math.exp( - value ) );

}

// The target is expected to be a Uint8ClampedArray, which clamps and rounds
// assigned values natively.
function writeColorBytes( target, offset, r, g, b, a ) {

	target[ offset ] = r;
	target[ offset + 1 ] = g;
	target[ offset + 2 ] = b;
	target[ offset + 3 ] = a;

}

function sh0ToLinear( coefficient ) {

	return coefficient * SH_C0 + 0.5;

}

function linearToSH0( color ) {

	return ( color - 0.5 ) / SH_C0;

}

function writeColorBytesFromSH0( target, offset, r, g, b, a ) {

	writeColorBytes(
		target,
		offset,
		sh0ToLinear( r ) * 255,
		sh0ToLinear( g ) * 255,
		sh0ToLinear( b ) * 255,
		a * 255
	);

}

function writeCovariance( target, offset, sx, sy, sz, qx, qy, qz, qw ) {

	_quaternion.set( qx, qy, qz, qw ).normalize();
	_scale.set( sx, sy, sz );
	_rotationScaleMatrix.compose( _zero, _quaternion, _scale );

	_covarianceMatrix.setFromMatrix4( _rotationScaleMatrix );
	_covarianceMatrixTranspose.copy( _covarianceMatrix ).transpose();
	_covarianceMatrix.multiply( _covarianceMatrixTranspose );

	const elements = _covarianceMatrix.elements;

	target[ offset ] = elements[ 0 ];
	target[ offset + 1 ] = elements[ 3 ];
	target[ offset + 2 ] = elements[ 6 ];
	target[ offset + 3 ] = elements[ 4 ];
	target[ offset + 4 ] = elements[ 7 ];
	target[ offset + 5 ] = elements[ 8 ];

}

function createPackedSphericalHarmonicsBand( count, degree ) {

	const packed = new Uint32Array( count * SH_BAND_WORDS[ degree ] );
	packed.fill( 0x80808080 );

	return {
		packed,
		bytes: new Uint8ClampedArray( packed.buffer )
	};

}

function createSphericalHarmonicsAttribute( values, count, degree ) {

	const words = SH_BAND_WORDS[ degree ];

	if ( values instanceof Uint32Array === false ) {

		throw new Error( `THREE.createGaussianSplatGeometry: sphericalHarmonics${ degree } must use packed uint32 words.` );

	}

	if ( values.length !== count * words ) {

		throw new Error( `THREE.createGaussianSplatGeometry: Invalid sphericalHarmonics${ degree } packed length.` );

	}

	return new BufferAttribute( values, words );

}

function getSphericalHarmonicsDegree( geometry ) {

	if ( geometry === undefined || geometry.isBufferGeometry !== true ) return 0;

	let degree = 0;

	for ( let i = 1; i <= 3; i ++ ) {

		const attribute = geometry.getAttribute( `sphericalHarmonics${ i }` );

		if ( attribute === undefined ) break;

		if ( attribute.itemSize !== SH_BAND_WORDS[ i ] ) {

			throw new Error( `THREE.getSphericalHarmonicsDegree: Invalid sphericalHarmonics${ i } itemSize.` );

		}

		if ( attribute.array instanceof Uint32Array === false ) {

			throw new Error( `THREE.getSphericalHarmonicsDegree: sphericalHarmonics${ i } must use packed uint32 words.` );

		}

		degree = i;

	}

	for ( let i = degree + 1; i <= 3; i ++ ) {

		if ( geometry.getAttribute( `sphericalHarmonics${ i }` ) !== undefined ) {

			throw new Error( 'THREE.getSphericalHarmonicsDegree: Spherical harmonics attributes must be contiguous.' );

		}

	}

	const position = geometry.getAttribute( 'position' );

	if ( position !== undefined ) {

		for ( let i = 1; i <= degree; i ++ ) {

			if ( geometry.getAttribute( `sphericalHarmonics${ i }` ).count !== position.count ) {

				throw new Error( 'THREE.getSphericalHarmonicsDegree: Spherical harmonics attribute counts must match position.' );

			}

		}

	}

	return degree;

}

/**
 * Creates Gaussian splat geometry from packed attribute arrays. Higher-order
 * spherical harmonics must be supplied as packed `Uint32Array` words
 * (`SH_BAND_WORDS[ degree ]` words per splat, four clamped-byte coefficients
 * per word using `( value - 128 ) / 128`).
 *
 * @param {Float32Array} centers - Splat centers.
 * @param {Float32Array} covariances - Splat covariance matrices.
 * @param {Uint8Array|Uint8ClampedArray} colors - RGBA colors.
 * @param {Object} [sphericalHarmonics={}] - Optional packed SH band arrays.
 * @return {BufferGeometry} The Gaussian splat geometry.
 */
function createGaussianSplatGeometry( centers, covariances, colors, sphericalHarmonics = {} ) {

	const geometry = new BufferGeometry();
	geometry.setAttribute( 'position', new BufferAttribute( centers, 3 ) );
	geometry.setAttribute( 'covariance', new BufferAttribute( covariances, 6 ) );
	geometry.setAttribute( 'color', new BufferAttribute( colors, 4, true ) );

	const count = centers.length / 3;

	for ( let i = 1; i <= 3; i ++ ) {

		const values = sphericalHarmonics[ `sh${ i }` ] || sphericalHarmonics[ `sphericalHarmonics${ i }` ];

		if ( values !== undefined ) {

			geometry.setAttribute( `sphericalHarmonics${ i }`, createSphericalHarmonicsAttribute( values, count, i ) );

		}

	}

	getSphericalHarmonicsDegree( geometry );
	geometry.computeBoundingBox();
	geometry.computeBoundingSphere();

	return geometry;

}

export {
	SH_BAND_COMPONENTS,
	SH_BAND_WORDS,
	SH_C0,
	createGaussianSplatGeometry,
	createPackedSphericalHarmonicsBand,
	getSphericalHarmonicsDegree,
	linearToSH0,
	sh0ToLinear,
	sigmoid,
	writeColorBytes,
	writeColorBytesFromSH0,
	writeCovariance
};
