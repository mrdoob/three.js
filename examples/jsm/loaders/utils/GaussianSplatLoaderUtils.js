function clampByte( value ) {

	return Math.min( 255, Math.max( 0, Math.round( value ) ) );

}

function writeColorBytes( target, offset, r, g, b, a ) {

	target[ offset ] = clampByte( r );
	target[ offset + 1 ] = clampByte( g );
	target[ offset + 2 ] = clampByte( b );
	target[ offset + 3 ] = clampByte( a );

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

export { clampByte, writeColorBytes, writeCovariance };
