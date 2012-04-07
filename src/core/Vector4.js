/**
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author philogb / http://blog.thejit.org/
 * @author mikael emtinger / http://gomo.se/
 * @author egraether / http://egraether.com/
 * @author WestLangley / https://github.com/WestLangley
 */

THREE.Vector4 = function ( x, y, z, w ) {

	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
	this.w = ( w !== undefined ) ? w : 1;

};

THREE.Vector4.prototype = {

	constructor: THREE.Vector4,

	set: function ( x, y, z, w ) {

		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;

		return this;

	},

	copy: function ( v ) {

		this.x = v.x;
		this.y = v.y;
		this.z = v.z;
		this.w = ( v.w !== undefined ) ? v.w : 1;

		return this;

	},

	add: function ( a, b ) {

		this.x = a.x + b.x;
		this.y = a.y + b.y;
		this.z = a.z + b.z;
		this.w = a.w + b.w;

		return this;

	},

	addSelf: function ( v ) {

		this.x += v.x;
		this.y += v.y;
		this.z += v.z;
		this.w += v.w;

		return this;

	},

	sub: function ( a, b ) {

		this.x = a.x - b.x;
		this.y = a.y - b.y;
		this.z = a.z - b.z;
		this.w = a.w - b.w;

		return this;

	},

	subSelf: function ( v ) {

		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;
		this.w -= v.w;

		return this;

	},

	multiplyScalar: function ( s ) {

		this.x *= s;
		this.y *= s;
		this.z *= s;
		this.w *= s;

		return this;

	},

	divideScalar: function ( s ) {

		if ( s ) {

			this.x /= s;
			this.y /= s;
			this.z /= s;
			this.w /= s;

		} else {

			this.x = 0;
			this.y = 0;
			this.z = 0;
			this.w = 1;

		}

		return this;

	},


	negate: function() {

		return this.multiplyScalar( -1 );

	},

	dot: function ( v ) {

		return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;

	},

	lengthSq: function () {

		return this.dot( this );

	},

	length: function () {

		return Math.sqrt( this.lengthSq() );

	},

	normalize: function () {

		return this.divideScalar( this.length() );

	},

	setLength: function ( l ) {

		return this.normalize().multiplyScalar( l );

	},

	lerpSelf: function ( v, alpha ) {

		this.x += ( v.x - this.x ) * alpha;
		this.y += ( v.y - this.y ) * alpha;
		this.z += ( v.z - this.z ) * alpha;
		this.w += ( v.w - this.w ) * alpha;

		return this;

	},

	clone: function () {

		return new THREE.Vector4( this.x, this.y, this.z, this.w );

	},
	
	setAxisAngleFromQuaternion: function ( q ) {

		// http://www.euclideanspace.com/maths/geometry/rotations/conversions/quaternionToAngle/index.htm
		
		// q is assumed to be normalized
		
		this.w = 2 * Math.acos( q.w );
		
		var s = Math.sqrt( 1 - q.w * q.w );
		
		if ( s < 0.0001 ) {
		
			 this.x = 1;
			 this.y = 0;
			 this.z = 0;
		 
		} else {
		
			 this.x = q.x / s;
			 this.y = q.y / s;
			 this.z = q.z / s;
		 
		}
	
		return this;

	},

	setAxisAngleFromRotationMatrix: function ( m ) {

		// http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToAngle/index.htm
		
		// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)
		
		var angle, x, y, z,		// variables for result
			epsilon = 0.01,		// margin to allow for rounding errors
			epsilon2 = 0.1;		// margin to distinguish between 0 and 180 degrees
		
		if ( ( Math.abs( m.n12 - m.n21 ) < epsilon )
		  && ( Math.abs( m.n13 - m.n31 ) < epsilon )
		  && ( Math.abs( m.n23 - m.n32 ) < epsilon ) ) {
			
			// singularity found
			// first check for identity matrix which must have +1 for all terms
			// in leading diagonal and zero in other terms
			
			if ( ( Math.abs( m.n12 + m.n21 ) < epsilon2 )
			  && ( Math.abs( m.n13 + m.n31 ) < epsilon2 )
			  && ( Math.abs( m.n23 + m.n32 ) < epsilon2 )
			  && ( Math.abs( m.n11 + m.n22 + m.n33 - 3 ) < epsilon2 ) ) {
				
				// this singularity is identity matrix so angle = 0
				
				this.set( 1, 0, 0, 0 );
				
				return this; // zero angle, arbitrary axis
				
			}
			
			// otherwise this singularity is angle = 180
			
			angle = Math.PI;
			
			var xx = ( m.n11 + 1 ) / 2;
			var yy = ( m.n22 + 1 ) / 2;
			var zz = ( m.n33 + 1 ) / 2;
			var xy = ( m.n12 + m.n21 ) / 4;
			var xz = ( m.n13 + m.n31 ) / 4;
			var yz = ( m.n23 + m.n32 ) / 4;
			
			if ( ( xx > yy ) && ( xx > zz ) ) { // m.n11 is the largest diagonal term
			
				if ( xx < epsilon ) {
				
					x = 0;
					y = 0.707106781;
					z = 0.707106781;
					
				} else {
				
					x = Math.sqrt( xx );
					y = xy / x;
					z = xz / x;
					
				}
				
			} else if ( yy > zz ) { // m.n22 is the largest diagonal term
			
				if ( yy < epsilon ) {
				
					x = 0.707106781;
					y = 0;
					z = 0.707106781;
					
				} else {
				
					y = Math.sqrt( yy );
					x = xy / y;
					z = yz / y;
					
				}	
				
			} else { // m.n33 is the largest diagonal term so base result on this
			
				if ( zz < epsilon ) {
				
					x = 0.707106781;
					y = 0.707106781;
					z = 0;
					
				} else {
				
					z = Math.sqrt( zz );
					x = xz / z;
					y = yz / z;
					
				}
				
			}
			
			this.set( x, y, z, angle );
			
			return this; // return 180 deg rotation
	
		}
		
		// as we have reached here there are no singularities so we can handle normally
		
		var s = Math.sqrt( ( m.n32 - m.n23 ) * ( m.n32 - m.n23 )
						 + ( m.n13 - m.n31 ) * ( m.n13 - m.n31 )
						 + ( m.n21 - m.n12 ) * ( m.n21 - m.n12 ) ); // used to normalize
			
		if ( Math.abs( s ) < 0.001 ) s = 1; 
		
		// prevent divide by zero, should not happen if matrix is orthogonal and should be
		// caught by singularity test above, but I've left it in just in case
		
		this.x = ( m.n32 - m.n23 ) / s;
		this.y = ( m.n13 - m.n31 ) / s;
		this.z = ( m.n21 - m.n12 ) / s;
		this.w = Math.acos( ( m.n11 + m.n22 + m.n33 - 1 ) / 2 );
	
		return this;

	}

};
