import {
	BufferAttribute,
	BufferGeometry
} from 'three';

const SH_C0 = 0.2820947917738781;
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

function createGaussianSplatGeometry( centers, covariances, colors ) {

	const geometry = new BufferGeometry();
	geometry.setAttribute( 'position', new BufferAttribute( centers, 3 ) );
	geometry.setAttribute( 'covariance', new BufferAttribute( covariances, 6 ) );
	geometry.setAttribute( 'color', new BufferAttribute( colors, 4, true ) );
	geometry.computeBoundingBox();
	geometry.computeBoundingSphere();

	return geometry;

}

function createGaussianSplatGeometryFromPLYGeometry( geometry, {
	scaleAttribute = 'scale',
	rotationAttribute = 'rotation',
	sh0Attribute = 'f_dc',
	opacityAttribute = 'opacity'
} = {} ) {

	if ( geometry === undefined || geometry.isBufferGeometry !== true ) {

		throw new Error( 'THREE.createGaussianSplatGeometryFromPLYGeometry: PLY geometry must be a BufferGeometry.' );

	}

	const position = geometry.getAttribute( 'position' );
	const scale = geometry.getAttribute( scaleAttribute );
	const rotation = geometry.getAttribute( rotationAttribute );
	const sh0 = geometry.getAttribute( sh0Attribute );
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

	}

	return createGaussianSplatGeometry( centers, covariances, colors );

}

export {
	GAUSSIAN_SPLAT_PLY_PROPERTY_MAPPING,
	SH_C0,
	createGaussianSplatGeometry,
	createGaussianSplatGeometryFromPLYGeometry,
	linearToSH0,
	sh0ToLinear,
	sigmoid,
	writeColorBytes,
	writeColorBytesFromSH0,
	writeCovariance
};
