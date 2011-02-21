/*
 * @author mikael emtinger / http://gomo.se/
 */

THREE.Quaternion = function( x, y, z, w ) {

	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
	this.w = w !== undefined ? w : 1;
	
};


THREE.Quaternion.prototype.set = function( x, y, z, w ) {
	
	this.x = x;
	this.y = y;
	this.z = z;
	this.w = w;

	return this;

};


THREE.Quaternion.prototype.setFromEuler = function( vec3 ) {
	
	var c = 0.5 * Math.PI / 360, // 0.5 is an optimization
		x = vec3.x * c,
		y = vec3.y * c,
		z = vec3.z * c,
	
		c1 = Math.cos( y  ),
		s1 = Math.sin( y  ),
		c2 = Math.cos( -z ),
		s2 = Math.sin( -z ),
		c3 = Math.cos( x  ),
		s3 = Math.sin( x  ),
		c1c2 = c1 * c2,
		s1s2 = s1 * s2;
	
	this.w = c1c2 * c3  - s1s2 * s3;
  	this.x = c1c2 * s3  + s1s2 * c3;
	this.y = s1 * c2 * c3 + c1 * s2 * s3;
	this.z = c1 * s2 * c3 - s1 * c2 * s3;

	return this;

};


THREE.Quaternion.prototype.calculateW = function() {	

	this.w = -Math.sqrt( Math.abs( 1.0 - this.x * this.x - this.y * this.y - this.z * this.z ) );

	return this;

};


THREE.Quaternion.prototype.inverse = function() {

	this.x *= -1;
	this.y *= -1;
	this.z *= -1;

	return this;

};


THREE.Quaternion.prototype.length = function() {

	return Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w );

};


THREE.Quaternion.prototype.normalize = function() {
	
	var len = Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w );
	
	if ( len == 0 ) {
		
		this.x = 0;
		this.y = 0;
		this.z = 0;
		this.w = 0;
	
	} else {
	
		len = 1 / len;
		
		this.x = this.x * len;
		this.y = this.y * len;
		this.z = this.z * len;
		this.w = this.w * len;
		
	}
	
	return this;

};


THREE.Quaternion.prototype.multiplySelf = function( quat2 ) {
	
	var qax = this.x,  qay = this.y,  qaz = this.z,  qaw = this.w,
		qbx = quat2.x, qby = quat2.y, qbz = quat2.z, qbw = quat2.w;
	
	this.x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
	this.y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
	this.z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
	this.w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

	return this;

};


THREE.Quaternion.prototype.multiplyVector3 = function( vec, dest ) {
	
	if( !dest ) { dest = vec; }
	
	var x    = vec.x,  y  = vec.y,  z  = vec.z,
		qx   = this.x, qy = this.y, qz = this.z, qw = this.w;

	// calculate quat * vec
	
	var ix =  qw * x + qy * z - qz * y,
		iy =  qw * y + qz * x - qx * z,
		iz =  qw * z + qx * y - qy * x,
		iw = -qx * x - qy * y - qz * z;
	
	// calculate result * inverse quat
	
	dest.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
	dest.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
	dest.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
	
	return dest;

};


THREE.Quaternion.prototype.toMatrix3 = function( matrix3 ) {
	
/*	todo: create a proper Matrix3 first
 	
 	var x = quat[0], y = quat[1], z = quat[2], w = quat[3];

	var x2 = x + x;
	var y2 = y + y;
	var z2 = z + z;

	var xx = x*x2;
	var xy = x*y2;
	var xz = x*z2;

	var yy = y*y2;
	var yz = y*z2;
	var zz = z*z2;

	var wx = w*x2;
	var wy = w*y2;
	var wz = w*z2;

	dest[0] = 1 - (yy + zz);
	dest[1] = xy - wz;
	dest[2] = xz + wy;

	dest[3] = xy + wz;
	dest[4] = 1 - (xx + zz);
	dest[5] = yz - wx;

	dest[6] = xz - wy;
	dest[7] = yz + wx;
	dest[8] = 1 - (xx + yy);
	
	return dest;*/
};

THREE.Quaternion.prototype.toMatrix4 = function( matrix4 ) {
	
/* todo: this is implemented in Matrix4.setFromQuaternion

	var x = quat[0], y = quat[1], z = quat[2], w = quat[3];

	var x2 = x + x;
	var y2 = y + y;
	var z2 = z + z;

	var xx = x*x2;
	var xy = x*y2;
	var xz = x*z2;

	var yy = y*y2;
	var yz = y*z2;
	var zz = z*z2;

	var wx = w*x2;
	var wy = w*y2;
	var wz = w*z2;

	dest[0] = 1 - (yy + zz);
	dest[1] = xy - wz;
	dest[2] = xz + wy;
	dest[3] = 0;

	dest[4] = xy + wz;
	dest[5] = 1 - (xx + zz);
	dest[6] = yz - wx;
	dest[7] = 0;

	dest[8] = xz - wy;
	dest[9] = yz + wx;
	dest[10] = 1 - (xx + yy);
	dest[11] = 0;

	dest[12] = 0;
	dest[13] = 0;
	dest[14] = 0;
	dest[15] = 1;

 */	
};

THREE.Quaternion.slerp = function( qa, qb, qm, t ) {
	
	
	var cosHalfTheta = qa.w * qb.w + qa.x * qb.x + qa.y * qb.y + qa.z * qb.z;
	
	if( Math.abs( cosHalfTheta ) >= 1.0) {
		
		qm.w = qa.w; qm.x = qa.x; qm.y = qa.y; qm.z = qa.z;
		return qm;

	}
	
	var halfTheta    = Math.acos( cosHalfTheta ),
		sinHalfTheta = Math.sqrt( 1.0 - cosHalfTheta * cosHalfTheta );

	if( Math.abs( sinHalfTheta ) < 0.001 ) { 
		
		qm.w = 0.5 * ( qa.w + qb.w );
		qm.x = 0.5 * ( qa.x + qb.x );
		qm.y = 0.5 * ( qa.y + qb.y );
		qm.z = 0.5 * ( qa.z + qb.z );
		
		return qm;

	}
	
	var ratioA = Math.sin( (1 - t) * halfTheta ) / sinHalfTheta,
		ratioB = Math.sin( t * halfTheta ) / sinHalfTheta; 

	qm.w = ( qa.w * ratioA + qb.w * ratioB );
	qm.x = ( qa.x * ratioA + qb.x * ratioB );
	qm.y = ( qa.y * ratioA + qb.y * ratioB );
	qm.z = ( qa.z * ratioA + qb.z * ratioB );

	return qm;

};
	


