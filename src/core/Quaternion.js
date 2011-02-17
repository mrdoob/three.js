/*
 * @author mikael emtinger / http://gomo.se/
 */

THREE.Quaternion = function( _x, _y, _z, _w ) {

	this.x = _x || 0;
	this.y = _y || 0;
	this.z = _z || 0;
	this.w = _w !== undefined ? _w : 1;

	this.api = {
	
		isDirty:	false,
		that: 		this,

		get x() { return this.that.x; },
		get y() { return this.that.y; },
		get z() { return this.that.z; },
		get w() { return this.that.w; },
		
		set x( value ) { this.that.x = value; this.isDirty = true; },
		set y( value ) { this.that.y = value; this.isDirty = true; },
		set z( value ) { this.that.z = value; this.isDirty = true; },
		set w( value ) { this.that.w = value; this.isDirty = true; }

	};

	this.api.__proto__ = THREE.Quaternion.prototype;
	
	return this.api;
	
};


THREE.Quaternion.prototype.set = function( x, y, z, w ) {
	
	var quat = this.that; 
	quat.x = x;
	quat.y = y;
	quat.z = z;
	quat.w = w;

	this.isDirty = true;
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
		s1s2 = s1 * s2,
    
		quat = this.that;
	
	quat.w = c1c2 * c3  - s1s2 * s3;
  	quat.x = c1c2 * s3  + s1s2 * c3;
	quat.y = s1 * c2 * c3 + c1 * s2 * s3;
	quat.z = c1 * s2 * c3 - s1 * c2 * s3;

	this.isDirty = true;
	return this;

};


THREE.Quaternion.prototype.calculateW = function() {
	
	var quat = this.that,
		x    = quat.x,
		y    = quat.y,
		z    = quat.z;

	quat.w = -Math.sqrt( Math.abs( 1.0 - x*x - y*y - z*z ));

	this.isDirty = true;
	return this;

};


THREE.Quaternion.prototype.inverse = function() {
	
	var quat = this.that; 
	quat.x *= -1;
	quat.y *= -1;
	quat.z *= -1;

	this.isDirty = true;
	return this;

};


THREE.Quaternion.prototype.length = function() {
	
	var quat = this.that; 

	return Math.sqrt( quat.x * quat.x + quat.y * quat.y + quat.z * quat.z + quat.w * quat.w );

};


THREE.Quaternion.prototype.normalize = function() {
	
	var quat = this.that,
		x = quat.x,
		y = quat.y,
		z = quat.z,
		w = quat.w;
	
	var len = Math.sqrt( x*x + y*y + z*z + w*w );
	
	if ( len == 0 ) {
		
		quat.x = 0;
		quat.y = 0;
		quat.z = 0;
		quat.w = 0;
	
		this.isDirty = true;
		return this;
	
	}
	
	len = 1 / len;
	
	quat.x = x * len;
	quat.y = y * len;
	quat.z = z * len;
	quat.w = w * len;
	
	this.isDirty = true;
	return this;

};


THREE.Quaternion.prototype.multiplySelf = function( quat2 ) {
	
	var quat = this.that;

		qax = quat.x,  qay = quat.y,  qaz = quat.z,  qaw = quat.w,
		qbx = quat2.x, qby = quat2.y, qbz = quat2.z, qbw = quat2.w;
	
	quat.x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
	quat.y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
	quat.z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
	quat.w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

	this.isDirty = true;
	return this;

};


THREE.Quaternion.prototype.multiplyVector3 = function( vec, dest ) {
	
	if( !dest ) { dest = vec; }
	
	var quat = this.that,
		x    = vec.x,  y  = vec.y,  z  = vec.z,
		qx   = quat.x, qy = quat.y, qz = quat.z, qw = quat.w;

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
	


