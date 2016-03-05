/**
 * @author bhouston / http://clara.io
 * @author WestLangley / http://github.com/WestLangley
 */

THREE.Spherical = function ( phi, theta ) {

	this.phi = ( phi !== undefined ) ? phi : 0; // up / down towards top and bottom pole
	this.theta = ( theta !== undefined ) ? theta : 0; // around the equator of the sphere

	return this;

};

THREE.Spherical.prototype = {

	constructor: THREE.Spherical,

	set: function ( phi, theta ) {

    this.phi = phi;
    this.theta = theta;

  },

	clone: function () {

		return new this.constructor().copy( this );

	},

	copy: function ( other ) {

		this.phi.copy( other.phi );
		this.theta.copy( other.theta );

		return this;

	},

  add: function ( other ) {

    this.phi += other.phi;
    this.theta += other.theta;

    return this;

  },

  multiplyScalar: function( scalar ) {

    this.phi *= scalar;
    this.theta *= scalar;

    return this;
  },

	// restrict phi to be betwee EPS and PI-EPS
	makeSafe: function() {

		var EPS = 0.000001;
		this.phi = Math.max( EPS, Math.min( Math.PI - EPS, this.phi ) );

	},

  fromDirection: function( direction ) {

    this.theta = Math.atan2( direction.x, direction.z ); // equator angle around y-up axis
    this.phi = Math.atan2( Math.sqrt( direction.x * direction.x + direction.z * direction.z ), direction.y ); // polar angle

    return this;

  },

  direction: function( optionalTarget ) {

    var result = optionalTarget || new THREE.Vector3();
		var sinPhi = Math.sin( this.phi );
    result.set(
      sinPhi * Math.sin( this.theta ),
      Math.cos( this.phi ),
      sinPhi * Math.cos( this.theta )
    );

    return result;

  }

};
