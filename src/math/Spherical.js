/**
 * @author bhouston / http://clara.io
 * @author WestLangley / http://github.com/WestLangley
 *
 * Ref: https://en.wikipedia.org/wiki/Spherical_coordinate_system
 *
 * The poles (phi) are at the positive and negative y axis.
 * The equator starts at positive z.
 *
 */

THREE.Spherical = function ( radius, phi, theta ) {

	this.radius = ( radius !== undefined ) ? radius : 1.0;
	this.phi = ( phi !== undefined ) ? phi : 0; // up / down towards top and bottom pole
	this.theta = ( theta !== undefined ) ? theta : 0; // around the equator of the sphere

	return this;

};

THREE.Spherical.prototype = {

	constructor: THREE.Spherical,

	set: function ( radius, phi, theta ) {

		this.radius = radius;
    this.phi = phi;
    this.theta = theta;

  },

	clone: function () {

		return new this.constructor().copy( this );

	},

	copy: function ( other ) {

		this.radius.copy( other.radius );
		this.phi.copy( other.phi );
		this.theta.copy( other.theta );

		return this;

	},

  add: function ( other ) {

		this.radius += other.radius;
    this.phi += other.phi;
    this.theta += other.theta;

    return this;

  },

  multiplyScalar: function( scalar ) {

		this.radius *= scalar;
    this.phi *= scalar;
    this.theta *= scalar;

    return this;
  },

	// restrict phi to be betwee EPS and PI-EPS
	makeSafe: function() {

		var EPS = 0.000001;
		this.phi = Math.max( EPS, Math.min( Math.PI - EPS, this.phi ) );

	},

  fromVector3: function( vec3 ) {

		this.radius = vec3.length();
		if( this.radius === 0 ) {
			this.theta = 0;
			this.phi = 0;
		}
		else {
    	this.theta = Math.atan2( vec3.x, vec3.z ); // equator angle around y-up axis
    	this.phi = Math.acos( vec3.y / this.radius ); // polar angle
		}

    return this;

  },

  toVector3: function( optionalTarget ) {

    var result = optionalTarget || new THREE.Vector3();
		var sinPhiRadius = Math.sin( this.phi ) * this.radius;
    result.set(
      sinPhiRadius * Math.sin( this.theta ),
      Math.cos( this.phi ) * this.radius,
      sinPhiRadius * Math.cos( this.theta )
    );

    return result;

  }

};
