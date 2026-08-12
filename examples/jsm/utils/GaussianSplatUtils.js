import {
	BufferAttribute,
	BufferGeometry,
	Matrix3,
	Matrix4,
	Quaternion,
	Vector3
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

			writeSphericalHarmonicsFromPLYRest( sphericalHarmonicsBytes, i, shRest );

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

function writeSphericalHarmonicsFromPLYRest( sphericalHarmonicsBytes, index, shRest ) {

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

export {
	GAUSSIAN_SPLAT_PLY_PROPERTY_MAPPING,
	SH_BAND_COMPONENTS,
	SH_BAND_WORDS,
	SH_C0,
	SH_DEGREE_TO_COMPONENTS,
	createGaussianSplatGeometry,
	createGaussianSplatGeometryFromPLYGeometry,
	createPackedSphericalHarmonicsBand,
	getGaussianSplatPLYPropertyMapping,
	getSphericalHarmonicsDegree,
	linearToSH0,
	sh0ToLinear,
	sigmoid,
	writeColorBytes,
	writeColorBytesFromSH0,
	writeCovariance
};
