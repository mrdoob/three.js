import {
	BufferAttribute,
	BufferGeometry
} from 'three';

const SH_C0 = 0.2820947917738781;
const SH_DEGREE_TO_COMPONENTS = [ 0, 9, 24, 45 ];
const SH_BAND_COMPONENTS = [ 0, 9, 15, 21 ];
// GPU upload packs four clamped-byte coefficients per uint32 word.
const SH_BAND_WORDS = [ 0, 3, 4, 6 ];
const GAUSSIAN_SPLAT_PLY_PROPERTY_MAPPING = {
	scale: [ 'scale_0', 'scale_1', 'scale_2' ],
	rotation: [ 'rot_0', 'rot_1', 'rot_2', 'rot_3' ],
	f_dc: [ 'f_dc_0', 'f_dc_1', 'f_dc_2' ],
	opacity: [ 'opacity' ]
};

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

	// Math.sqrt is significantly faster than Math.hypot, and the overflow
	// protection of Math.hypot is unnecessary for quaternion components.
	const length = Math.sqrt( qx * qx + qy * qy + qz * qz + qw * qw );

	if ( length === 0 ) {

		qx = 0;
		qy = 0;
		qz = 0;
		qw = 1;

	} else {

		const invLength = 1 / length;
		qx *= invLength;
		qy *= invLength;
		qz *= invLength;
		qw *= invLength;

	}

	const x2 = qx + qx;
	const y2 = qy + qy;
	const z2 = qz + qz;
	const xx = qx * x2;
	const xy = qx * y2;
	const xz = qx * z2;
	const yy = qy * y2;
	const yz = qy * z2;
	const zz = qz * z2;
	const wx = qw * x2;
	const wy = qw * y2;
	const wz = qw * z2;

	const r00 = 1 - ( yy + zz );
	const r01 = xy - wz;
	const r02 = xz + wy;
	const r10 = xy + wz;
	const r11 = 1 - ( xx + zz );
	const r12 = yz - wx;
	const r20 = xz - wy;
	const r21 = yz + wx;
	const r22 = 1 - ( xx + yy );

	const sxx = sx * sx;
	const syy = sy * sy;
	const szz = sz * sz;

	target[ offset ] = r00 * r00 * sxx + r01 * r01 * syy + r02 * r02 * szz;
	target[ offset + 1 ] = r00 * r10 * sxx + r01 * r11 * syy + r02 * r12 * szz;
	target[ offset + 2 ] = r00 * r20 * sxx + r01 * r21 * syy + r02 * r22 * szz;
	target[ offset + 3 ] = r10 * r10 * sxx + r11 * r11 * syy + r12 * r12 * szz;
	target[ offset + 4 ] = r10 * r20 * sxx + r11 * r21 * syy + r12 * r22 * szz;
	target[ offset + 5 ] = r20 * r20 * sxx + r21 * r21 * syy + r22 * r22 * szz;

}

function getGaussianSplatPLYPropertyMapping( sphericalHarmonicsDegree = 0 ) {

	const restComponentCount = SH_DEGREE_TO_COMPONENTS[ sphericalHarmonicsDegree ];

	if ( restComponentCount === undefined ) {

		throw new Error( `THREE.getGaussianSplatPLYPropertyMapping: Unsupported spherical harmonics degree ${ sphericalHarmonicsDegree }.` );

	}

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

/**
 * Maps an SH scalar coefficient index within a band to its packed uint32
 * storage location. Coefficients are RGB-interleaved within each band
 * (vector0.rgb, vector1.rgb, ...).
 *
 * @param {number} coefficient - Scalar coefficient index within the band.
 * @return {{ word: number, shift: number }} Packed word index and bit shift.
 */
function getSphericalHarmonicsCoefficientLocation( coefficient ) {

	return {
		word: coefficient >> 2,
		shift: ( coefficient & 3 ) << 3
	};

}

/**
 * Packs clamped-byte SH coefficients into uint32 words (four bytes per word).
 * Each coefficient uses the geometry encoding `( value - 128 ) / 128`.
 *
 * @param {Uint8Array|Uint8ClampedArray} source - Clamped-byte coefficients.
 * @param {number} count - Splat count.
 * @param {number} degree - Spherical harmonics band degree in `[1, 3]`.
 * @return {Uint32Array} Packed words with `count * SH_BAND_WORDS[ degree ]` elements.
 */
function packSphericalHarmonicsBand( source, count, degree ) {

	const componentCount = SH_BAND_COMPONENTS[ degree ];
	const words = SH_BAND_WORDS[ degree ];
	const data = new Uint32Array( count * words );

	for ( let i = 0; i < count; i ++ ) {

		const sourceBase = i * componentCount;
		const targetBase = i * words;

		for ( let j = 0; j < componentCount; j ++ ) {

			const { word, shift } = getSphericalHarmonicsCoefficientLocation( j );
			data[ targetBase + word ] |= source[ sourceBase + j ] << shift;

		}

	}

	return data;

}

/**
 * Unpacks uint32 SH words back to clamped-byte coefficients.
 *
 * @param {Uint32Array} packed - Packed words from {@link packSphericalHarmonicsBand}.
 * @param {number} count - Splat count.
 * @param {number} degree - Spherical harmonics band degree in `[1, 3]`.
 * @return {Uint8ClampedArray} Clamped-byte coefficients.
 */
function unpackSphericalHarmonicsBand( packed, count, degree ) {

	const componentCount = SH_BAND_COMPONENTS[ degree ];
	const words = SH_BAND_WORDS[ degree ];
	const data = new Uint8ClampedArray( count * componentCount );

	for ( let i = 0; i < count; i ++ ) {

		const sourceBase = i * words;
		const targetBase = i * componentCount;

		for ( let j = 0; j < componentCount; j ++ ) {

			const { word, shift } = getSphericalHarmonicsCoefficientLocation( j );
			data[ targetBase + j ] = ( packed[ sourceBase + word ] >>> shift ) & 0xff;

		}

	}

	return data;

}

function createSphericalHarmonicsAttribute( values, count, degree ) {

	const words = SH_BAND_WORDS[ degree ];
	const componentCount = SH_BAND_COMPONENTS[ degree ];

	if ( values instanceof Uint32Array ) {

		if ( values.length !== count * words ) {

			throw new Error( `THREE.createGaussianSplatGeometry: Invalid sphericalHarmonics${ degree } packed length.` );

		}

		return new BufferAttribute( values, words );

	}

	if ( values instanceof Uint8Array === false && values instanceof Uint8ClampedArray === false ) {

		throw new Error( `THREE.createGaussianSplatGeometry: sphericalHarmonics${ degree } must use clamped byte components or packed uint32 words.` );

	}

	if ( values.length !== count * componentCount ) {

		throw new Error( `THREE.createGaussianSplatGeometry: Invalid sphericalHarmonics${ degree } byte length.` );

	}

	return new BufferAttribute( packSphericalHarmonicsBand( values, count, degree ), words );

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
 * spherical harmonics may be supplied as clamped-byte coefficients
 * (`( value - 128 ) / 128`) or as already packed `Uint32Array` words
 * (`SH_BAND_WORDS[ degree ]` words per splat, four bytes per word). The
 * resulting geometry always stores the packed uint32 form.
 *
 * @param {Float32Array} centers - Splat centers.
 * @param {Float32Array} covariances - Splat covariance matrices.
 * @param {Uint8Array|Uint8ClampedArray} colors - RGBA colors.
 * @param {Object} [sphericalHarmonics={}] - Optional SH band arrays.
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

function createGaussianSplatGeometryFromPLYGeometry( geometry, {
	scaleAttribute = 'scale',
	rotationAttribute = 'rotation',
	sh0Attribute = 'f_dc',
	shRestAttribute = 'f_rest',
	opacityAttribute = 'opacity'
} = {} ) {

	if ( geometry === undefined || geometry.isBufferGeometry !== true ) {

		throw new Error( 'THREE.createGaussianSplatGeometryFromPLYGeometry: PLY geometry must be a BufferGeometry.' );

	}

	const position = geometry.getAttribute( 'position' );
	const scale = geometry.getAttribute( scaleAttribute );
	const rotation = geometry.getAttribute( rotationAttribute );
	const sh0 = geometry.getAttribute( sh0Attribute );
	const shRest = geometry.getAttribute( shRestAttribute );
	const opacity = geometry.getAttribute( opacityAttribute );

	if ( position === undefined || scale === undefined || rotation === undefined || sh0 === undefined || opacity === undefined ) {

		throw new Error( 'THREE.createGaussianSplatGeometryFromPLYGeometry: PLY geometry requires position, scale, rotation, f_dc and opacity attributes.' );

	}

	const count = position.count;

	if ( position.itemSize !== 3 || scale.itemSize !== 3 || rotation.itemSize !== 4 || sh0.itemSize !== 3 || opacity.itemSize !== 1 ) {

		throw new Error( 'THREE.createGaussianSplatGeometryFromPLYGeometry: Invalid Gaussian splat PLY attribute itemSize.' );

	}

	if ( scale.count !== count || rotation.count !== count || sh0.count !== count || opacity.count !== count ) {

		throw new Error( 'THREE.createGaussianSplatGeometryFromPLYGeometry: Gaussian splat PLY attribute counts must match position.' );

	}

	const centers = new Float32Array( count * 3 );
	const covariances = new Float32Array( count * 6 );
	const colors = new Uint8ClampedArray( count * 4 );
	const sphericalHarmonicsDegree = getPLYRestSphericalHarmonicsDegree( shRest );
	const sphericalHarmonics = {};

	if ( sphericalHarmonicsDegree >= 1 ) sphericalHarmonics.sh1 = new Uint8ClampedArray( count * SH_BAND_COMPONENTS[ 1 ] );
	if ( sphericalHarmonicsDegree >= 2 ) sphericalHarmonics.sh2 = new Uint8ClampedArray( count * SH_BAND_COMPONENTS[ 2 ] );
	if ( sphericalHarmonicsDegree >= 3 ) sphericalHarmonics.sh3 = new Uint8ClampedArray( count * SH_BAND_COMPONENTS[ 3 ] );

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

			writeSphericalHarmonicsFromPLYRest( sphericalHarmonics, i, shRest );

		}

	}

	return createGaussianSplatGeometry( centers, covariances, colors, sphericalHarmonics );

}

function getPLYRestSphericalHarmonicsDegree( shRest ) {

	if ( shRest === undefined ) return 0;

	const degree = SH_DEGREE_TO_COMPONENTS.indexOf( shRest.itemSize );

	if ( degree === - 1 ) {

		throw new Error( 'THREE.createGaussianSplatGeometryFromPLYGeometry: Unsupported number of f_rest spherical harmonics coefficients.' );

	}

	return degree;

}

function writeSphericalHarmonicsFromPLYRest( sphericalHarmonics, index, shRest ) {

	const stride = shRest.itemSize / 3;
	const source = shRest.array;
	const sourceOffset = index * shRest.itemSize;

	for ( let j = 0; j < SH_BAND_COMPONENTS[ 1 ]; j ++ ) {

		const coefficient = Math.floor( j / 3 );
		const channel = j % 3;
		sphericalHarmonics.sh1[ index * SH_BAND_COMPONENTS[ 1 ] + j ] = source[ sourceOffset + coefficient + channel * stride ] * 128 + 128;

	}

	if ( sphericalHarmonics.sh2 !== undefined ) {

		for ( let j = 0; j < SH_BAND_COMPONENTS[ 2 ]; j ++ ) {

			const coefficient = Math.floor( j / 3 );
			const channel = j % 3;
			sphericalHarmonics.sh2[ index * SH_BAND_COMPONENTS[ 2 ] + j ] = source[ sourceOffset + 3 + coefficient + channel * stride ] * 128 + 128;

		}

	}

	if ( sphericalHarmonics.sh3 !== undefined ) {

		for ( let j = 0; j < SH_BAND_COMPONENTS[ 3 ]; j ++ ) {

			const coefficient = Math.floor( j / 3 );
			const channel = j % 3;
			sphericalHarmonics.sh3[ index * SH_BAND_COMPONENTS[ 3 ] + j ] = source[ sourceOffset + 8 + coefficient + channel * stride ] * 128 + 128;

		}

	}

}

export {
	GAUSSIAN_SPLAT_PLY_PROPERTY_MAPPING,
	SH_BAND_COMPONENTS,
	SH_BAND_WORDS,
	SH_C0,
	SH_DEGREE_TO_COMPONENTS,
	createGaussianSplatGeometry,
	createGaussianSplatGeometryFromPLYGeometry,
	getGaussianSplatPLYPropertyMapping,
	getSphericalHarmonicsCoefficientLocation,
	getSphericalHarmonicsDegree,
	linearToSH0,
	packSphericalHarmonicsBand,
	sh0ToLinear,
	sigmoid,
	unpackSphericalHarmonicsBand,
	writeColorBytes,
	writeColorBytesFromSH0,
	writeCovariance
};
