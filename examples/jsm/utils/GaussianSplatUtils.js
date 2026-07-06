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

function clampByte( value ) {

	return Math.min( 255, Math.max( 0, Math.round( value ) ) );

}

function sigmoid( value ) {

	return 1 / ( 1 + Math.exp( - value ) );

}

function writeColorBytes( target, offset, r, g, b, a ) {

	target[ offset ] = clampByte( r );
	target[ offset + 1 ] = clampByte( g );
	target[ offset + 2 ] = clampByte( b );
	target[ offset + 3 ] = clampByte( a );

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

	const length = Math.hypot( qx, qy, qz, qw );

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
	const colors = new Uint8Array( count * 4 );

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

	const splatGeometry = new BufferGeometry();
	splatGeometry.setAttribute( 'position', new BufferAttribute( centers, 3 ) );
	splatGeometry.setAttribute( 'covariance', new BufferAttribute( covariances, 6 ) );
	splatGeometry.setAttribute( 'color', new BufferAttribute( colors, 4, true ) );
	splatGeometry.computeBoundingBox();
	splatGeometry.computeBoundingSphere();

	return splatGeometry;

}

function decomposeCovariance( covariance, offset, targetScale, targetRotation, targetOffset ) {

	const m = [
		covariance[ offset ], covariance[ offset + 1 ], covariance[ offset + 2 ],
		covariance[ offset + 1 ], covariance[ offset + 3 ], covariance[ offset + 4 ],
		covariance[ offset + 2 ], covariance[ offset + 4 ], covariance[ offset + 5 ]
	];
	const rotation = [
		1, 0, 0,
		0, 1, 0,
		0, 0, 1
	];

	for ( let i = 0; i < 16; i ++ ) {

		let p = 0;
		let q = 1;
		let max = Math.abs( m[ 1 ] );
		const xz = Math.abs( m[ 2 ] );
		const yz = Math.abs( m[ 5 ] );

		if ( xz > max ) {

			p = 0;
			q = 2;
			max = xz;

		}

		if ( yz > max ) {

			p = 1;
			q = 2;
			max = yz;

		}

		if ( max < 1e-10 ) break;

		jacobiRotate( m, rotation, p, q );

	}

	const values = [
		{ value: Math.max( m[ 0 ], 0 ), x: rotation[ 0 ], y: rotation[ 3 ], z: rotation[ 6 ] },
		{ value: Math.max( m[ 4 ], 0 ), x: rotation[ 1 ], y: rotation[ 4 ], z: rotation[ 7 ] },
		{ value: Math.max( m[ 8 ], 0 ), x: rotation[ 2 ], y: rotation[ 5 ], z: rotation[ 8 ] }
	].sort( ( a, b ) => b.value - a.value );

	const r00 = values[ 0 ].x;
	const r10 = values[ 0 ].y;
	const r20 = values[ 0 ].z;
	const r01 = values[ 1 ].x;
	const r11 = values[ 1 ].y;
	const r21 = values[ 1 ].z;
	let r02 = values[ 2 ].x;
	let r12 = values[ 2 ].y;
	let r22 = values[ 2 ].z;

	const determinant = r00 * ( r11 * r22 - r12 * r21 ) -
		r01 * ( r10 * r22 - r12 * r20 ) +
		r02 * ( r10 * r21 - r11 * r20 );

	if ( determinant < 0 ) {

		r02 = - r02;
		r12 = - r12;
		r22 = - r22;

	}

	targetScale[ targetOffset ] = Math.sqrt( values[ 0 ].value );
	targetScale[ targetOffset + 1 ] = Math.sqrt( values[ 1 ].value );
	targetScale[ targetOffset + 2 ] = Math.sqrt( values[ 2 ].value );

	writeQuaternionFromRotationMatrix(
		targetRotation,
		targetOffset / 3 * 4,
		r00, r01, r02,
		r10, r11, r12,
		r20, r21, r22
	);

}

function jacobiRotate( m, rotation, p, q ) {

	const pp = p * 3 + p;
	const qq = q * 3 + q;
	const pq = p * 3 + q;
	const app = m[ pp ];
	const aqq = m[ qq ];
	const apq = m[ pq ];
	const tau = ( aqq - app ) / ( 2 * apq );
	const t = tau >= 0 ?
		1 / ( tau + Math.sqrt( 1 + tau * tau ) ) :
		- 1 / ( - tau + Math.sqrt( 1 + tau * tau ) );
	const c = 1 / Math.sqrt( 1 + t * t );
	const s = t * c;

	m[ pp ] = app - t * apq;
	m[ qq ] = aqq + t * apq;
	m[ pq ] = 0;
	m[ q * 3 + p ] = 0;

	for ( let k = 0; k < 3; k ++ ) {

		if ( k === p || k === q ) continue;

		const kp = k * 3 + p;
		const kq = k * 3 + q;
		const mkp = m[ kp ];
		const mkq = m[ kq ];

		m[ kp ] = c * mkp - s * mkq;
		m[ p * 3 + k ] = m[ kp ];
		m[ kq ] = s * mkp + c * mkq;
		m[ q * 3 + k ] = m[ kq ];

	}

	for ( let k = 0; k < 3; k ++ ) {

		const kp = k * 3 + p;
		const kq = k * 3 + q;
		const rkp = rotation[ kp ];
		const rkq = rotation[ kq ];

		rotation[ kp ] = c * rkp - s * rkq;
		rotation[ kq ] = s * rkp + c * rkq;

	}

}

function writeQuaternionFromRotationMatrix( target, offset, r00, r01, r02, r10, r11, r12, r20, r21, r22 ) {

	const trace = r00 + r11 + r22;
	let qx;
	let qy;
	let qz;
	let qw;

	if ( trace > 0 ) {

		const s = 0.5 / Math.sqrt( trace + 1 );
		qw = 0.25 / s;
		qx = ( r21 - r12 ) * s;
		qy = ( r02 - r20 ) * s;
		qz = ( r10 - r01 ) * s;

	} else if ( r00 > r11 && r00 > r22 ) {

		const s = 2 * Math.sqrt( 1 + r00 - r11 - r22 );
		qw = ( r21 - r12 ) / s;
		qx = 0.25 * s;
		qy = ( r01 + r10 ) / s;
		qz = ( r02 + r20 ) / s;

	} else if ( r11 > r22 ) {

		const s = 2 * Math.sqrt( 1 + r11 - r00 - r22 );
		qw = ( r02 - r20 ) / s;
		qx = ( r01 + r10 ) / s;
		qy = 0.25 * s;
		qz = ( r12 + r21 ) / s;

	} else {

		const s = 2 * Math.sqrt( 1 + r22 - r00 - r11 );
		qw = ( r10 - r01 ) / s;
		qx = ( r02 + r20 ) / s;
		qy = ( r12 + r21 ) / s;
		qz = 0.25 * s;

	}

	const length = Math.hypot( qx, qy, qz, qw );

	target[ offset ] = qx / length;
	target[ offset + 1 ] = qy / length;
	target[ offset + 2 ] = qz / length;
	target[ offset + 3 ] = qw / length;

}

export {
	GAUSSIAN_SPLAT_PLY_PROPERTY_MAPPING,
	SH_C0,
	clampByte,
	createGaussianSplatGeometryFromPLYGeometry,
	decomposeCovariance,
	linearToSH0,
	sh0ToLinear,
	sigmoid,
	writeColorBytes,
	writeColorBytesFromSH0,
	writeCovariance
};
