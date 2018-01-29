/**
 * @author bhouston / http://clara.io
 * @author WestLangley
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
function SphericalHarmonics3 () {

	this.coefficients = [];

	for( var i = 0; i < 9; i ++ ) {
		this.coefficients.push( new THREE.Color() );
	}

	if ( arguments.length > 0 ) {

		console.error( 'THREE.SphericalHarmonics3: the constructor does not reads arguments. use .set() instead.' );

	}

};

// constants to convert from radiance to hemispheric irradiance
// source: https://graphics.stanford.edu/papers/envmap/envmap.pdf
SphericalHarmonics3.C1 = 0.429043;
SphericalHarmonics3.C2 = 0.511664;
SphericalHarmonics3.C3 = 0.743125;
SphericalHarmonics3.C4 = 0.886227;
SphericalHarmonics3.C5 = 0.247708;

Object.assign( SphericalHarmonics3.prototype, {

	zero: function () {

		for( var i = 0; i < 9; i ++ ) {
			this.coefficients[i].setRGB( 0, 0, 0 );
		}

		return this;

	},

	set: function ( c1, c2, c3, c4, c5, c6, c7, c8, c9 ) {

		this.coefficients[0] = c1;
		this.coefficients[1] = c2;
		this.coefficients[2] = c3;
		this.coefficients[3] = c4;
		this.coefficients[4] = c5;
		this.coefficients[5] = c6;
		this.coefficients[6] = c7;
		this.coefficients[7] = c8;
		this.coefficients[8] = c9;

		return this;

	},

	// adds color contribution in normal direction to the SH coefficients.
	addAt: function( normal, color ) {

		// based on sphericalHarmonicsEvaluateDirection from:
		//    http://www.sunandblackcat.com/tipFullView.php?l=eng&topicid=32
	   var p_0_0 = 0.282094791773878140;
	   var p_1_0 = 0.488602511902919920 * dir.z;
	   var p_1_1 = -0.488602511902919920;
	   var p_2_0 = 0.946174695757560080 * dir.z * dir.z - 0.315391565252520050;
	   var p_2_1 = -1.092548430592079200 * dir.z;
	   var p_2_2 = 0.546274215296039590;

	   this.coefficients[0].addScale( color, p_0_0 );
	   this.coefficients[1].addScale( color, p_1_1 * dir.y );
	   this.coefficients[2].addScale( color, p_1_0 );
	   this.coefficients[3].addScale( color, p_1_1 * dir.x );
	   this.coefficients[4].addScale( color, p_2_2 * (dir.x * dir.y + dir.y * dir.x) );
	   this.coefficients[5].addScale( color, p_2_1 * dir.y );
	   this.coefficients[6].addScale( color, p_2_0 );
	   this.coefficients[7].addScale( color, p_2_1 * dir.x );
	   this.coefficients[8].addScale( color, p_2_2 * (dir.x * dir.x - dir.y * dir.y) );

	},

	copy: function ( sh ) {

		return this.set( sh.coefficients );

	},

	// get the radiance
	// normal is assumed to be unit length!
	getAt: function( normal, optionalResult ) {

		var result = optionalResult || new THREE.Color();

		var x = normal.x, y = normal.y, z = normal.z;
		var coeff = this.coefficients;

		// band 0
		result.copy( coeff[0] );

		// band 1
		result.addScale( coeff[1], y );
		result.addScale( coeff[2], z );
		result.addScale( coeff[3], x );

		// band 2
		result.addScale( coeff[4], x*y );
		result.addScale( coeff[5], y*z );
		result.addScale( coeff[6], 3.0 * z*z - 1.0 );
		result.addScale( coeff[7], x*z );
		result.addScale( coeff[8], ( x*x - y*y ) );

		return result;
	},

	// get the irradiance (radiance convolved with hermispheric smooth lobe)
	// normal is assumed to be unit length!
	getIrradianceAt: function( normal, optionalResult ) {

		var result = optionalResult || new THREE.Color();

		var x = normal.x, y = normal.y, z = normal.z;
		var coeff = this.coefficients;
		var c = SphericalHarmonics3;

		// band 0
		result.copy( coeff[0] );
		result.multiplyScalar( c.C4 );

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

	equals: function ( other ) {

		for( var i = 0; i < 9; i ++ ) {
			if( ! this.coefficients[i].equals( other.coefficients[i] ) ) {
				return false;
			}
		}

		return true;
	},

	clone: function () {

		return new SphericalHarmonics3().copy( this );

	},

	toArray: function () {
		var c = [];
		for( var i=0; i<9; i++ ) {
			c.push( this.coefficients[i].clone() );
		}
		return c;
	}
} );

export { SphericalHarmonics3 };
