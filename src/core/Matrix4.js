/**
 * @author mr.doob / http://mrdoob.com/
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author philogb / http://blog.thejit.org/
 * @author jordi_ros / http://plattsoft.com
 * @author D1plo1d / http://github.com/D1plo1d
 * @author alteredq / http://alteredqualia.com/
 * @author mikael emtinger / http://gomo.se/
 * @author timknip / http://www.floorplanner.com/
 */

THREE.Matrix4 = function ( n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44 ) {

	this.set(

		( n11 !== undefined ) ? n11 : 1, n12 || 0, n13 || 0, n14 || 0,
		n21 || 0, ( n22 !== undefined ) ? n22 : 1, n23 || 0, n24 || 0,
		n31 || 0, n32 || 0, ( n33 !== undefined ) ? n33 : 1, n34 || 0,
		n41 || 0, n42 || 0, n43 || 0, ( n44 !== undefined ) ? n44 : 1

	);

};

THREE.Matrix4.prototype = {

	constructor: THREE.Matrix4,

	set: function ( n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44 ) {

		this.elements[0] = n11; this.elements[4] = n12; this.elements[8] = n13; this.elements[12] = n14;
		this.elements[1] = n21; this.elements[5] = n22; this.elements[9] = n23; this.elements[13] = n24;
		this.elements[2] = n31; this.elements[6] = n32; this.elements[10] = n33; this.elements[14] = n34;
		this.elements[3] = n41; this.elements[7] = n42; this.elements[11] = n43; this.elements[15] = n44;

		return this;

	},

	identity: function () {

		this.set(

			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1

		);

		return this;

	},

	copy: function ( m ) {

		this.set(

			m.elements[0], m.elements[4], m.elements[8], m.elements[12],
			m.elements[1], m.elements[5], m.elements[9], m.elements[13],
			m.elements[2], m.elements[6], m.elements[10], m.elements[14],
			m.elements[3], m.elements[7], m.elements[11], m.elements[15]

		);

		return this;

	},

	lookAt: function ( eye, target, up ) {

		var x = THREE.Matrix4.__v1;
		var y = THREE.Matrix4.__v2;
		var z = THREE.Matrix4.__v3;

		z.sub( eye, target ).normalize();

		if ( z.length() === 0 ) {

			z.z = 1;

		}

		x.cross( up, z ).normalize();

		if ( x.length() === 0 ) {

			z.x += 0.0001;
			x.cross( up, z ).normalize();

		}

		y.cross( z, x );


		this.elements[0] = x.x; this.elements[4] = y.x; this.elements[8] = z.x;
		this.elements[1] = x.y; this.elements[5] = y.y; this.elements[9] = z.y;
		this.elements[2] = x.z; this.elements[6] = y.z; this.elements[10] = z.z;

		return this;

	},

	multiply: function ( a, b ) {

		var a11 = a.elements[0], a12 = a.elements[4], a13 = a.elements[8], a14 = a.elements[12];
		var a21 = a.elements[1], a22 = a.elements[5], a23 = a.elements[9], a24 = a.elements[13];
		var a31 = a.elements[2], a32 = a.elements[6], a33 = a.elements[10], a34 = a.elements[14];
		var a41 = a.elements[3], a42 = a.elements[7], a43 = a.elements[11], a44 = a.elements[15];

		var b11 = b.elements[0], b12 = b.elements[4], b13 = b.elements[8], b14 = b.elements[12];
		var b21 = b.elements[1], b22 = b.elements[5], b23 = b.elements[9], b24 = b.elements[13];
		var b31 = b.elements[2], b32 = b.elements[6], b33 = b.elements[10], b34 = b.elements[14];
		var b41 = b.elements[3], b42 = b.elements[7], b43 = b.elements[11], b44 = b.elements[15];

		this.elements[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
		this.elements[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
		this.elements[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
		this.elements[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

		this.elements[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
		this.elements[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
		this.elements[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
		this.elements[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

		this.elements[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
		this.elements[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
		this.elements[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
		this.elements[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

		this.elements[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
		this.elements[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
		this.elements[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
		this.elements[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

		return this;

	},

	multiplySelf: function ( m ) {

		return this.multiply( this, m );

	},

	multiplyToArray: function ( a, b, r ) {

		this.multiply( a, b );

		r[ 0 ] = this.elements[0]; r[ 1 ] = this.elements[1]; r[ 2 ] = this.elements[2]; r[ 3 ] = this.elements[3];
		r[ 4 ] = this.elements[4]; r[ 5 ] = this.elements[5]; r[ 6 ] = this.elements[6]; r[ 7 ] = this.elements[7];
		r[ 8 ]  = this.elements[8]; r[ 9 ]  = this.elements[9]; r[ 10 ] = this.elements[10]; r[ 11 ] = this.elements[11];
		r[ 12 ] = this.elements[12]; r[ 13 ] = this.elements[13]; r[ 14 ] = this.elements[14]; r[ 15 ] = this.elements[15];

		return this;

	},

	multiplyScalar: function ( s ) {

		this.elements[0] *= s; this.elements[4] *= s; this.elements[8] *= s; this.elements[12] *= s;
		this.elements[1] *= s; this.elements[5] *= s; this.elements[9] *= s; this.elements[13] *= s;
		this.elements[2] *= s; this.elements[6] *= s; this.elements[10] *= s; this.elements[14] *= s;
		this.elements[3] *= s; this.elements[7] *= s; this.elements[11] *= s; this.elements[15] *= s;

		return this;

	},

	multiplyVector3: function ( v ) {

		var vx = v.x, vy = v.y, vz = v.z;
		var d = 1 / ( this.elements[3] * vx + this.elements[7] * vy + this.elements[11] * vz + this.elements[15] );

		v.x = ( this.elements[0] * vx + this.elements[4] * vy + this.elements[8] * vz + this.elements[12] ) * d;
		v.y = ( this.elements[1] * vx + this.elements[5] * vy + this.elements[9] * vz + this.elements[13] ) * d;
		v.z = ( this.elements[2] * vx + this.elements[6] * vy + this.elements[10] * vz + this.elements[14] ) * d;

		return v;

	},

	multiplyVector4: function ( v ) {

		var vx = v.x, vy = v.y, vz = v.z, vw = v.w;

		v.x = this.elements[0] * vx + this.elements[4] * vy + this.elements[8] * vz + this.elements[12] * vw;
		v.y = this.elements[1] * vx + this.elements[5] * vy + this.elements[9] * vz + this.elements[13] * vw;
		v.z = this.elements[2] * vx + this.elements[6] * vy + this.elements[10] * vz + this.elements[14] * vw;
		v.w = this.elements[3] * vx + this.elements[7] * vy + this.elements[11] * vz + this.elements[15] * vw;

		return v;

	},

	rotateAxis: function ( v ) {

		var vx = v.x, vy = v.y, vz = v.z;

		v.x = vx * this.elements[0] + vy * this.elements[4] + vz * this.elements[8];
		v.y = vx * this.elements[1] + vy * this.elements[5] + vz * this.elements[9];
		v.z = vx * this.elements[2] + vy * this.elements[6] + vz * this.elements[10];

		v.normalize();

		return v;

	},

	crossVector: function ( a ) {

		var v = new THREE.Vector4();

		v.x = this.elements[0] * a.x + this.elements[4] * a.y + this.elements[8] * a.z + this.elements[12] * a.w;
		v.y = this.elements[1] * a.x + this.elements[5] * a.y + this.elements[9] * a.z + this.elements[13] * a.w;
		v.z = this.elements[2] * a.x + this.elements[6] * a.y + this.elements[10] * a.z + this.elements[14] * a.w;

		v.w = ( a.w ) ? this.elements[3] * a.x + this.elements[7] * a.y + this.elements[11] * a.z + this.elements[15] * a.w : 1;

		return v;

	},

	determinant: function () {

		var n11 = this.elements[0], n12 = this.elements[4], n13 = this.elements[8], n14 = this.elements[12];
		var n21 = this.elements[1], n22 = this.elements[5], n23 = this.elements[9], n24 = this.elements[13];
		var n31 = this.elements[2], n32 = this.elements[6], n33 = this.elements[10], n34 = this.elements[14];
		var n41 = this.elements[3], n42 = this.elements[7], n43 = this.elements[11], n44 = this.elements[15];

		//TODO: make this more efficient
		//( based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm )

		return (
			n14 * n23 * n32 * n41-
			n13 * n24 * n32 * n41-
			n14 * n22 * n33 * n41+
			n12 * n24 * n33 * n41+

			n13 * n22 * n34 * n41-
			n12 * n23 * n34 * n41-
			n14 * n23 * n31 * n42+
			n13 * n24 * n31 * n42+

			n14 * n21 * n33 * n42-
			n11 * n24 * n33 * n42-
			n13 * n21 * n34 * n42+
			n11 * n23 * n34 * n42+

			n14 * n22 * n31 * n43-
			n12 * n24 * n31 * n43-
			n14 * n21 * n32 * n43+
			n11 * n24 * n32 * n43+

			n12 * n21 * n34 * n43-
			n11 * n22 * n34 * n43-
			n13 * n22 * n31 * n44+
			n12 * n23 * n31 * n44+

			n13 * n21 * n32 * n44-
			n11 * n23 * n32 * n44-
			n12 * n21 * n33 * n44+
			n11 * n22 * n33 * n44
		);

	},

	transpose: function () {

		var tmp;

		tmp = this.elements[1]; this.elements[1] = this.elements[4]; this.elements[4] = tmp;
		tmp = this.elements[2]; this.elements[2] = this.elements[8]; this.elements[8] = tmp;
		tmp = this.elements[6]; this.elements[6] = this.elements[9]; this.elements[9] = tmp;

		tmp = this.elements[3]; this.elements[3] = this.elements[12]; this.elements[12] = tmp;
		tmp = this.elements[7]; this.elements[7] = this.elements[13]; this.elements[13] = tmp;
		tmp = this.elements[11]; this.elements[11] = this.elements[14]; this.elements[14] = tmp;

		return this;

	},

	flattenToArray: function ( flat ) {

		flat[ 0 ] = this.elements[0]; flat[ 1 ] = this.elements[1]; flat[ 2 ] = this.elements[2]; flat[ 3 ] = this.elements[3];
		flat[ 4 ] = this.elements[4]; flat[ 5 ] = this.elements[5]; flat[ 6 ] = this.elements[6]; flat[ 7 ] = this.elements[7];
		flat[ 8 ]  = this.elements[8]; flat[ 9 ]  = this.elements[9]; flat[ 10 ] = this.elements[10]; flat[ 11 ] = this.elements[11];
		flat[ 12 ] = this.elements[12]; flat[ 13 ] = this.elements[13]; flat[ 14 ] = this.elements[14]; flat[ 15 ] = this.elements[15];

		return flat;

	},

	flattenToArrayOffset: function( flat, offset ) {

		flat[ offset ] = this.elements[0];
		flat[ offset + 1 ] = this.elements[1];
		flat[ offset + 2 ] = this.elements[2];
		flat[ offset + 3 ] = this.elements[3];

		flat[ offset + 4 ] = this.elements[4];
		flat[ offset + 5 ] = this.elements[5];
		flat[ offset + 6 ] = this.elements[6];
		flat[ offset + 7 ] = this.elements[7];

		flat[ offset + 8 ]  = this.elements[8];
		flat[ offset + 9 ]  = this.elements[9];
		flat[ offset + 10 ] = this.elements[10];
		flat[ offset + 11 ] = this.elements[11];

		flat[ offset + 12 ] = this.elements[12];
		flat[ offset + 13 ] = this.elements[13];
		flat[ offset + 14 ] = this.elements[14];
		flat[ offset + 15 ] = this.elements[15];

		return flat;

	},

	getPosition: function () {

		return THREE.Matrix4.__v1.set( this.elements[12], this.elements[13], this.elements[14] );

	},

	setPosition: function ( v ) {

		this.elements[12] = v.x;
		this.elements[13] = v.y;
		this.elements[14] = v.z;

		return this;

	},

	getColumnX: function () {

		return THREE.Matrix4.__v1.set( this.elements[0], this.elements[1], this.elements[2] );

	},

	getColumnY: function () {

		return THREE.Matrix4.__v1.set( this.elements[4], this.elements[5], this.elements[6] );

	},

	getColumnZ: function() {

		return THREE.Matrix4.__v1.set( this.elements[8], this.elements[9], this.elements[10] );

	},

	getInverse: function ( m ) {

		// based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm

		var n11 = m.elements[0], n12 = m.elements[4], n13 = m.elements[8], n14 = m.elements[12];
		var n21 = m.elements[1], n22 = m.elements[5], n23 = m.elements[9], n24 = m.elements[13];
		var n31 = m.elements[2], n32 = m.elements[6], n33 = m.elements[10], n34 = m.elements[14];
		var n41 = m.elements[3], n42 = m.elements[7], n43 = m.elements[11], n44 = m.elements[15];

		this.elements[0] = n23*n34*n42 - n24*n33*n42 + n24*n32*n43 - n22*n34*n43 - n23*n32*n44 + n22*n33*n44;
		this.elements[4] = n14*n33*n42 - n13*n34*n42 - n14*n32*n43 + n12*n34*n43 + n13*n32*n44 - n12*n33*n44;
		this.elements[8] = n13*n24*n42 - n14*n23*n42 + n14*n22*n43 - n12*n24*n43 - n13*n22*n44 + n12*n23*n44;
		this.elements[12] = n14*n23*n32 - n13*n24*n32 - n14*n22*n33 + n12*n24*n33 + n13*n22*n34 - n12*n23*n34;
		this.elements[1] = n24*n33*n41 - n23*n34*n41 - n24*n31*n43 + n21*n34*n43 + n23*n31*n44 - n21*n33*n44;
		this.elements[5] = n13*n34*n41 - n14*n33*n41 + n14*n31*n43 - n11*n34*n43 - n13*n31*n44 + n11*n33*n44;
		this.elements[9] = n14*n23*n41 - n13*n24*n41 - n14*n21*n43 + n11*n24*n43 + n13*n21*n44 - n11*n23*n44;
		this.elements[13] = n13*n24*n31 - n14*n23*n31 + n14*n21*n33 - n11*n24*n33 - n13*n21*n34 + n11*n23*n34;
		this.elements[2] = n22*n34*n41 - n24*n32*n41 + n24*n31*n42 - n21*n34*n42 - n22*n31*n44 + n21*n32*n44;
		this.elements[6] = n14*n32*n41 - n12*n34*n41 - n14*n31*n42 + n11*n34*n42 + n12*n31*n44 - n11*n32*n44;
		this.elements[10] = n12*n24*n41 - n14*n22*n41 + n14*n21*n42 - n11*n24*n42 - n12*n21*n44 + n11*n22*n44;
		this.elements[14] = n14*n22*n31 - n12*n24*n31 - n14*n21*n32 + n11*n24*n32 + n12*n21*n34 - n11*n22*n34;
		this.elements[3] = n23*n32*n41 - n22*n33*n41 - n23*n31*n42 + n21*n33*n42 + n22*n31*n43 - n21*n32*n43;
		this.elements[7] = n12*n33*n41 - n13*n32*n41 + n13*n31*n42 - n11*n33*n42 - n12*n31*n43 + n11*n32*n43;
		this.elements[11] = n13*n22*n41 - n12*n23*n41 - n13*n21*n42 + n11*n23*n42 + n12*n21*n43 - n11*n22*n43;
		this.elements[15] = n12*n23*n31 - n13*n22*n31 + n13*n21*n32 - n11*n23*n32 - n12*n21*n33 + n11*n22*n33;
		this.multiplyScalar( 1 / m.determinant() );

		return this;

	},

	setRotationFromEuler: function( v, order ) {

		var x = v.x, y = v.y, z = v.z;
		var a = Math.cos( x ), b = Math.sin( x );
		var c = Math.cos( y ), d = Math.sin( y );
		var e = Math.cos( z ), f = Math.sin( z );

		switch ( order ) {

			case 'YXZ':

				var ce = c * e, cf = c * f, de = d * e, df = d * f;

				this.elements[0] = ce + df * b;
				this.elements[4] = de * b - cf;
				this.elements[8] = a * d;

				this.elements[1] = a * f;
				this.elements[5] = a * e;
				this.elements[9] = - b;

				this.elements[2] = cf * b - de;
				this.elements[6] = df + ce * b;
				this.elements[10] = a * c;
				break;

			case 'ZXY':

				var ce = c * e, cf = c * f, de = d * e, df = d * f;

				this.elements[0] = ce - df * b;
				this.elements[4] = - a * f;
				this.elements[8] = de + cf * b;

				this.elements[1] = cf + de * b;
				this.elements[5] = a * e;
				this.elements[9] = df - ce * b;

				this.elements[2] = - a * d;
				this.elements[6] = b;
				this.elements[10] = a * c;
				break;

			case 'ZYX':

				var ae = a * e, af = a * f, be = b * e, bf = b * f;

				this.elements[0] = c * e;
				this.elements[4] = be * d - af;
				this.elements[8] = ae * d + bf;

				this.elements[1] = c * f;
				this.elements[5] = bf * d + ae;
				this.elements[9] = af * d - be;

				this.elements[2] = - d;
				this.elements[6] = b * c;
				this.elements[10] = a * c;
				break;

			case 'YZX':

				var ac = a * c, ad = a * d, bc = b * c, bd = b * d;

				this.elements[0] = c * e;
				this.elements[4] = bd - ac * f;
				this.elements[8] = bc * f + ad;

				this.elements[1] = f;
				this.elements[5] = a * e;
				this.elements[9] = - b * e;

				this.elements[2] = - d * e;
				this.elements[6] = ad * f + bc;
				this.elements[10] = ac - bd * f;
				break;

			case 'XZY':

				var ac = a * c, ad = a * d, bc = b * c, bd = b * d;

				this.elements[0] = c * e;
				this.elements[4] = - f;
				this.elements[8] = d * e;

				this.elements[1] = ac * f + bd;
				this.elements[5] = a * e;
				this.elements[9] = ad * f - bc;

				this.elements[2] = bc * f - ad;
				this.elements[6] = b * e;
				this.elements[10] = bd * f + ac;
				break;

			default: // 'XYZ'

				var ae = a * e, af = a * f, be = b * e, bf = b * f;

				this.elements[0] = c * e;
				this.elements[4] = - c * f;
				this.elements[8] = d;

				this.elements[1] = af + be * d;
				this.elements[5] = ae - bf * d;
				this.elements[9] = - b * c;

				this.elements[2] = bf - ae * d;
				this.elements[6] = be + af * d;
				this.elements[10] = a * c;
				break;

		}

		return this;

	},


	setRotationFromQuaternion: function( q ) {

		var x = q.x, y = q.y, z = q.z, w = q.w;
		var x2 = x + x, y2 = y + y, z2 = z + z;
		var xx = x * x2, xy = x * y2, xz = x * z2;
		var yy = y * y2, yz = y * z2, zz = z * z2;
		var wx = w * x2, wy = w * y2, wz = w * z2;

		this.elements[0] = 1 - ( yy + zz );
		this.elements[4] = xy - wz;
		this.elements[8] = xz + wy;

		this.elements[1] = xy + wz;
		this.elements[5] = 1 - ( xx + zz );
		this.elements[9] = yz - wx;

		this.elements[2] = xz - wy;
		this.elements[6] = yz + wx;
		this.elements[10] = 1 - ( xx + yy );

		return this;

	},

	compose: function ( translation, rotation, scale ) {

		var mRotation = THREE.Matrix4.__m1;
		var mScale = THREE.Matrix4.__m2;

		mRotation.identity();
		mRotation.setRotationFromQuaternion( rotation );

		mScale.makeScale( scale.x, scale.y, scale.z );

		this.multiply( mRotation, mScale );

		this.elements[12] = translation.x;
		this.elements[13] = translation.y;
		this.elements[14] = translation.z;

		return this;

	},

	decompose: function ( translation, rotation, scale ) {

		// grab the axis vectors

		var x = THREE.Matrix4.__v1;
		var y = THREE.Matrix4.__v2;
		var z = THREE.Matrix4.__v3;

		x.set( this.elements[0], this.elements[1], this.elements[2] );
		y.set( this.elements[4], this.elements[5], this.elements[6] );
		z.set( this.elements[8], this.elements[9], this.elements[10] );

		translation = ( translation instanceof THREE.Vector3 ) ? translation : new THREE.Vector3();
		rotation = ( rotation instanceof THREE.Quaternion ) ? rotation : new THREE.Quaternion();
		scale = ( scale instanceof THREE.Vector3 ) ? scale : new THREE.Vector3();

		scale.x = x.length();
		scale.y = y.length();
		scale.z = z.length();

		translation.x = this.elements[12];
		translation.y = this.elements[13];
		translation.z = this.elements[14];

		// scale the rotation part

		var matrix = THREE.Matrix4.__m1;

		matrix.copy( this );

		matrix.elements[0] /= scale.x;
		matrix.elements[1] /= scale.x;
		matrix.elements[2] /= scale.x;

		matrix.elements[4] /= scale.y;
		matrix.elements[5] /= scale.y;
		matrix.elements[6] /= scale.y;

		matrix.elements[8] /= scale.z;
		matrix.elements[9] /= scale.z;
		matrix.elements[10] /= scale.z;

		rotation.setFromRotationMatrix( matrix );

		return [ translation, rotation, scale ];

	},

	extractPosition: function ( m ) {

		this.elements[12] = m.elements[12];
		this.elements[13] = m.elements[13];
		this.elements[14] = m.elements[14];

		return this;

	},

	extractRotation: function ( m ) {

		var vector = THREE.Matrix4.__v1;

		var scaleX = 1 / vector.set( m.elements[0], m.elements[1], m.elements[2] ).length();
		var scaleY = 1 / vector.set( m.elements[4], m.elements[5], m.elements[6] ).length();
		var scaleZ = 1 / vector.set( m.elements[8], m.elements[9], m.elements[10] ).length();

		this.elements[0] = m.elements[0] * scaleX;
		this.elements[1] = m.elements[1] * scaleX;
		this.elements[2] = m.elements[2] * scaleX;

		this.elements[4] = m.elements[4] * scaleY;
		this.elements[5] = m.elements[5] * scaleY;
		this.elements[6] = m.elements[6] * scaleY;

		this.elements[8] = m.elements[8] * scaleZ;
		this.elements[9] = m.elements[9] * scaleZ;
		this.elements[10] = m.elements[10] * scaleZ;

		return this;

	},

	//

	translate: function ( v ) {

		var x = v.x, y = v.y, z = v.z;

		this.elements[12] = this.elements[0] * x + this.elements[4] * y + this.elements[8] * z + this.elements[12];
		this.elements[13] = this.elements[1] * x + this.elements[5] * y + this.elements[9] * z + this.elements[13];
		this.elements[14] = this.elements[2] * x + this.elements[6] * y + this.elements[10] * z + this.elements[14];
		this.elements[15] = this.elements[3] * x + this.elements[7] * y + this.elements[11] * z + this.elements[15];

		return this;

	},

	rotateX: function ( angle ) {

		var m12 = this.elements[4];
		var m22 = this.elements[5];
		var m32 = this.elements[6];
		var m42 = this.elements[7];
		var m13 = this.elements[8];
		var m23 = this.elements[9];
		var m33 = this.elements[10];
		var m43 = this.elements[11];
		var c = Math.cos( angle );
		var s = Math.sin( angle );

		this.elements[4] = c * m12 + s * m13;
		this.elements[5] = c * m22 + s * m23;
		this.elements[6] = c * m32 + s * m33;
		this.elements[7] = c * m42 + s * m43;

		this.elements[8] = c * m13 - s * m12;
		this.elements[9] = c * m23 - s * m22;
		this.elements[10] = c * m33 - s * m32;
		this.elements[11] = c * m43 - s * m42;

		return this;

  	},

	rotateY: function ( angle ) {

		var m11 = this.elements[0];
		var m21 = this.elements[1];
		var m31 = this.elements[2];
		var m41 = this.elements[3];
		var m13 = this.elements[8];
		var m23 = this.elements[9];
		var m33 = this.elements[10];
		var m43 = this.elements[11];
		var c = Math.cos( angle );
		var s = Math.sin( angle );

		this.elements[0] = c * m11 - s * m13;
		this.elements[1] = c * m21 - s * m23;
		this.elements[2] = c * m31 - s * m33;
		this.elements[3] = c * m41 - s * m43;

		this.elements[8] = c * m13 + s * m11;
		this.elements[9] = c * m23 + s * m21;
		this.elements[10] = c * m33 + s * m31;
		this.elements[11] = c * m43 + s * m41;

		return this;

	},

	rotateZ: function ( angle ) {

		var m11 = this.elements[0];
		var m21 = this.elements[1];
		var m31 = this.elements[2];
		var m41 = this.elements[3];
		var m12 = this.elements[4];
		var m22 = this.elements[5];
		var m32 = this.elements[6];
		var m42 = this.elements[7];
		var c = Math.cos( angle );
		var s = Math.sin( angle );

		this.elements[0] = c * m11 + s * m12;
		this.elements[1] = c * m21 + s * m22;
		this.elements[2] = c * m31 + s * m32;
		this.elements[3] = c * m41 + s * m42;

		this.elements[4] = c * m12 - s * m11;
		this.elements[5] = c * m22 - s * m21;
		this.elements[6] = c * m32 - s * m31;
		this.elements[7] = c * m42 - s * m41;

		return this;

	},

	rotateByAxis: function ( axis, angle ) {

		// optimize by checking axis

		if ( axis.x === 1 && axis.y === 0 && axis.z === 0 ) {

			return this.rotateX( angle );

		} else if ( axis.x === 0 && axis.y === 1 && axis.z === 0 ) {

			return this.rotateY( angle );

		} else if ( axis.x === 0 && axis.y === 0 && axis.z === 1 ) {

			return this.rotateZ( angle );

		}

		var x = axis.x, y = axis.y, z = axis.z;
		var n = Math.sqrt(x * x + y * y + z * z);

		x /= n;
		y /= n;
		z /= n;

		var xx = x * x, yy = y * y, zz = z * z;
		var c = Math.cos( angle );
		var s = Math.sin( angle );
		var oneMinusCosine = 1 - c;
		var xy = x * y * oneMinusCosine;
		var xz = x * z * oneMinusCosine;
		var yz = y * z * oneMinusCosine;
		var xs = x * s;
		var ys = y * s;
		var zs = z * s;

		var r11 = xx + (1 - xx) * c;
		var r21 = xy + zs;
		var r31 = xz - ys;
		var r12 = xy - zs;
		var r22 = yy + (1 - yy) * c;
		var r32 = yz + xs;
		var r13 = xz + ys;
		var r23 = yz - xs;
		var r33 = zz + (1 - zz) * c;

		var m11 = this.elements[0], m21 = this.elements[1], m31 = this.elements[2], m41 = this.elements[3];
		var m12 = this.elements[4], m22 = this.elements[5], m32 = this.elements[6], m42 = this.elements[7];
		var m13 = this.elements[8], m23 = this.elements[9], m33 = this.elements[10], m43 = this.elements[11];
		var m14 = this.elements[12], m24 = this.elements[13], m34 = this.elements[14], m44 = this.elements[15];

		this.elements[0] = r11 * m11 + r21 * m12 + r31 * m13;
		this.elements[1] = r11 * m21 + r21 * m22 + r31 * m23;
		this.elements[2] = r11 * m31 + r21 * m32 + r31 * m33;
		this.elements[3] = r11 * m41 + r21 * m42 + r31 * m43;

		this.elements[4] = r12 * m11 + r22 * m12 + r32 * m13;
		this.elements[5] = r12 * m21 + r22 * m22 + r32 * m23;
		this.elements[6] = r12 * m31 + r22 * m32 + r32 * m33;
		this.elements[7] = r12 * m41 + r22 * m42 + r32 * m43;

		this.elements[8] = r13 * m11 + r23 * m12 + r33 * m13;
		this.elements[9] = r13 * m21 + r23 * m22 + r33 * m23;
		this.elements[10] = r13 * m31 + r23 * m32 + r33 * m33;
		this.elements[11] = r13 * m41 + r23 * m42 + r33 * m43;

		return this;

	},

	scale: function ( v ) {

		var x = v.x, y = v.y, z = v.z;

		this.elements[0] *= x; this.elements[4] *= y; this.elements[8] *= z;
		this.elements[1] *= x; this.elements[5] *= y; this.elements[9] *= z;
		this.elements[2] *= x; this.elements[6] *= y; this.elements[10] *= z;
		this.elements[3] *= x; this.elements[7] *= y; this.elements[11] *= z;

		return this;

	},

	//

	makeTranslation: function ( x, y, z ) {

		this.set(

			1, 0, 0, x,
			0, 1, 0, y,
			0, 0, 1, z,
			0, 0, 0, 1

		);

		return this;

	},

	makeRotationX: function ( theta ) {

		var c = Math.cos( theta ), s = Math.sin( theta );

		this.set(

			1, 0,  0, 0,
			0, c, -s, 0,
			0, s,  c, 0,
			0, 0,  0, 1

		);

		return this;

	},

	makeRotationY: function ( theta ) {

		var c = Math.cos( theta ), s = Math.sin( theta );

		this.set(

			 c, 0, s, 0,
			 0, 1, 0, 0,
			-s, 0, c, 0,
			 0, 0, 0, 1

		);

		return this;

	},

	makeRotationZ: function ( theta ) {

		var c = Math.cos( theta ), s = Math.sin( theta );

		this.set(

			c, -s, 0, 0,
			s,  c, 0, 0,
			0,  0, 1, 0,
			0,  0, 0, 1

		);

		return this;

	},

	makeRotationAxis: function ( axis, angle ) {

		// Based on http://www.gamedev.net/reference/articles/article1199.asp

		var c = Math.cos( angle );
		var s = Math.sin( angle );
		var t = 1 - c;
		var x = axis.x, y = axis.y, z = axis.z;
		var tx = t * x, ty = t * y;

		this.set(

		 	tx * x + c, tx * y - s * z, tx * z + s * y, 0,
			tx * y + s * z, ty * y + c, ty * z - s * x, 0,
			tx * z - s * y, ty * z + s * x, t * z * z + c, 0,
			0, 0, 0, 1

		);

		 return this;

	},

	makeScale: function ( x, y, z ) {

		this.set(

			x, 0, 0, 0,
			0, y, 0, 0,
			0, 0, z, 0,
			0, 0, 0, 1

		);

		return this;

	},

	makeFrustum: function ( left, right, bottom, top, near, far ) {

		var x = 2 * near / ( right - left );
		var y = 2 * near / ( top - bottom );

		var a = ( right + left ) / ( right - left );
		var b = ( top + bottom ) / ( top - bottom );
		var c = - ( far + near ) / ( far - near );
		var d = - 2 * far * near / ( far - near );

		this.elements[0] = x;  this.elements[4] = 0;  this.elements[8] = a;   this.elements[12] = 0;
		this.elements[1] = 0;  this.elements[5] = y;  this.elements[9] = b;   this.elements[13] = 0;
		this.elements[2] = 0;  this.elements[6] = 0;  this.elements[10] = c;   this.elements[14] = d;
		this.elements[3] = 0;  this.elements[7] = 0;  this.elements[11] = - 1; this.elements[15] = 0;

		return this;

	},

	makePerspective: function ( fov, aspect, near, far ) {

		var ymax = near * Math.tan( fov * Math.PI / 360 );
		var ymin = - ymax;
		var xmin = ymin * aspect;
		var xmax = ymax * aspect;

		return this.makeFrustum( xmin, xmax, ymin, ymax, near, far );

	},

	makeOrthographic: function ( left, right, top, bottom, near, far ) {

		var w = right - left;
		var h = top - bottom;
		var p = far - near;

		var x = ( right + left ) / w;
		var y = ( top + bottom ) / h;
		var z = ( far + near ) / p;

		this.elements[0] = 2 / w; this.elements[4] = 0;     this.elements[8] = 0;      this.elements[12] = -x;
		this.elements[1] = 0;     this.elements[5] = 2 / h; this.elements[9] = 0;      this.elements[13] = -y;
		this.elements[2] = 0;     this.elements[6] = 0;     this.elements[10] = -2 / p; this.elements[14] = -z;
		this.elements[3] = 0;     this.elements[7] = 0;     this.elements[11] = 0;      this.elements[15] = 1;

		return this;

	},


	clone: function () {

		return new THREE.Matrix4(

			this.elements[0], this.elements[4], this.elements[8], this.elements[12],
			this.elements[1], this.elements[5], this.elements[9], this.elements[13],
			this.elements[2], this.elements[6], this.elements[10], this.elements[14],
			this.elements[3], this.elements[7], this.elements[11], this.elements[15]

		);

	}

};

THREE.Matrix4.__v1 = new THREE.Vector3();
THREE.Matrix4.__v2 = new THREE.Vector3();
THREE.Matrix4.__v3 = new THREE.Vector3();

THREE.Matrix4.__m1 = new THREE.Matrix4();
THREE.Matrix4.__m2 = new THREE.Matrix4();
