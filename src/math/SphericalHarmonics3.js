/**
 * @author bhouston / http://clara.io
 *
 * Primary theory reference:
 *   https://graphics.stanford.edu/papers/envmap/envmap.pdf
 *
 * Good secondary references:
 *   http://www1.cs.columbia.edu/~cs4162/slides/spherical-harmonic-lighting.pdf
 *   http://www.ppsloan.org/publications/StupidSH36.pdf
 *   http://www.sunandblackcat.com/tipFullView.php?l=eng&topicid=32
 */


// The 3 in the name refernces to this structure storing the first 3 bands of the harmonics in 9 coefficients.
THREE.SphericalHarmonics3 = function () {

	this.coefficients = [];

	for( var i = 0; i < 9; i ++ ) {
		this.coefficients.push( new THREE.Color() );
	}

};

// constants from http://www.yaldex.com/open-gl/ch12lev1sec3.html and
THREE.SphericalHarmonics3.C1 = 0.429043;
THREE.SphericalHarmonics3.C2 = 0.511664;
THREE.SphericalHarmonics3.C3 = 0.743125;
THREE.SphericalHarmonics3.C4 = 0.886227;
THREE.SphericalHarmonics3.C5 = 0.247708;

THREE.SphericalHarmonics3.prototype = {

	constructor: THREE.SphericalHarmonics3,

	zero: function () {

		for( var i = 0; i < 9; i ++ ) {
			this.coefficients[i].set( 0, 0, 0 );
		}

		return this;

	},

	set: function ( coefficients ) {

		for( var i = 0; i < 9; i ++ ) {
			this.coefficients[i].set( coefficients[i] );
		}

		return this;

	},

	copy: function ( sh ) {

		return this.set( sh.coefficients );

	},

	// normal is assumed to be unit length!
	evaluate: function( normal, optionalResult ) {

		var result = optionalResult || new THREE.Color();

		var c = THREE.SphericalHarmonics3;

		var x = normal.x, y = normal.y, z = normal.z;
		var coeff = this.coefficients;

		// band 0
		result.copy( coeff[0], c.C4 );

		// band 1
		result.addScale( coeff[1], 2.0 * c.C2 * y );
		result.addScale( coeff[2], 2.0 * c.C2 * z );
		result.addScale( coeff[3], 2.0 * c.C2 * x );

		// band 2
		result.addScale( coeff[4], 2.0 * c.C1 * x*y );
		result.addScale( coeff[5], 2.0 * c.C1 * y*z );
		result.addScale( coeff[6], c.C3 * z*z - c.C5 );
		result.addScale( coeff[7], 2.0 * c.C1 * x*z );
		result.addScale( coeff[8], c.C1 * ( x*x - y*y ) );

		return result;
	},

	add: function( other ) {

		for( var i = 0; i < 9; i ++ ) {
			this.coefficients[i].add( other.coefficients[i] );
		}

		return this;
	},


	scale: function( s ) {

		for( var i = 0; i < 9; i ++ ) {
			this.coefficients[i].multiplyScalar( s );
		}

		return this;
	},

	lerp: function( other, alpha ) {

		for( var i = 0; i < 9; i ++ ) {
			this.coefficients[i].lerp( other.coefficients[i], alpha );
		}

		return this;

	},

	clone: function () {

		return new THREE.SphericalHarmonics3().copy( this );

	}

};

//
// Debevec's light probe gallery examples.  Source: http://www.yaldex.com/open-gl/ch12lev1sec3.html
//

THREE.SphericalHarmoncs3.EucalyptusGroove = new THREE.SphericalHarmoncs3().set(
    new THREE.Color( 0.3783264,  0.4260425,  0.4504587),
    new THREE.Color( 0.2887813,  0.3586803,  0.4147053),
    new THREE.Color( 0.0379030,  0.0295216,  0.0098567),
    new THREE.Color(-0.1033028, -0.1031690, -0.0884924),
    new THREE.Color(-0.0621750, -0.0554432, -0.0396779),
    new THREE.Color( 0.0077820, -0.0148312, -0.0471301),
    new THREE.Color(-0.0935561, -0.1254260, -0.1525629),
    new THREE.Color(-0.0572703, -0.0502192, -0.0363410),
    new THREE.Color( 0.0203348, -0.0044201, -0.0452180)
);

THREE.SphericalHarmoncs3.FunstoneBeachSunset = new THREE.SphericalHarmoncs3().set(
    new THREE.Color( 0.6841148,  0.6929004,  0.7069543),
    new THREE.Color( 0.3173355,  0.3694407,  0.4406839),
    new THREE.Color(-0.1747193, -0.1737154, -0.1657420),
    new THREE.Color(-0.4496467, -0.4155184, -0.3416573),
    new THREE.Color(-0.1690202, -0.1703022, -0.1525870),
    new THREE.Color(-0.0837808, -0.0940454, -0.1027518),
    new THREE.Color(-0.0319670, -0.0214051, -0.0147691),
    new THREE.Color( 0.1641816,  0.1377558,  0.1010403),
    new THREE.Color( 0.3697189,  0.3097930,  0.2029923)
);

THREE.SphericalHarmoncs3.GalileoTomb = new THREE.SphericalHarmoncs3().set(
    new THREE.Color( 1.0351604,  0.7603549,  0.7074635),
    new THREE.Color( 0.4442150,  0.3430402,  0.3403777),
    new THREE.Color(-0.2247797, -0.1828517, -0.1705181),
    new THREE.Color( 0.7110400,  0.5423169,  0.5587956),
    new THREE.Color( 0.6430452,  0.4971454,  0.5156357),
    new THREE.Color(-0.1150112, -0.0936603, -0.0839287),
    new THREE.Color(-0.3742487, -0.2755962, -0.2875017),
    new THREE.Color(-0.1694954, -0.1343096, -0.1335315),
    new THREE.Color( 0.5515260,  0.4222179,  0.4162488)
);