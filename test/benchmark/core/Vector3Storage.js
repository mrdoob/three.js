( function () {

	const THREE = {};

	THREE.Vector3 = function ( x, y, z ) {

		this.x = x || 0;
		this.y = y || 0;
		this.z = z || 0;

	};

	THREE.Vector3.prototype = {

		constructor: THREE.Vector3,

		length: function () {

			return Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z );

		}

	};

	THREE.Vector3X = function ( x, y, z ) {

		const elements = this.elements = new Float32Array( 3 );
		elements[ 0 ] = x || 0;
		elements[ 1 ] = y || 1;
		elements[ 2 ] = z || 2;

	};

	THREE.Vector3X.prototype = {

		constructor: THREE.Vector3X,

		length: function () {

			return Math.sqrt( this.elements[ 0 ] * this.elements[ 0 ] + this.elements[ 1 ] * this.elements[ 1 ] + this.elements[ 2 ] * this.elements[ 2 ] );

		}

	};


	THREE.Vector3Y = function ( x, y, z ) {

		this.elements = [ x || 0, y || 1, z || 2 ];

	};

	THREE.Vector3Y.prototype = {

		constructor: THREE.Vector3Y,

		length: function () {

			return Math.sqrt( this.elements[ 0 ] * this.elements[ 0 ] + this.elements[ 1 ] * this.elements[ 1 ] + this.elements[ 2 ] * this.elements[ 2 ] );

		}

	};


	const suite = Bench.newSuite( 'Vector 3 Storage' );

	suite.add( 'Vector3-Set', function () {

		const array = [];
		for ( let i = 0; i < 100000; i ++ ) {

			const v = new THREE.Vector3( i, i, i );
			array.push( v );

		}

		let result = 0;
		for ( let i = 0; i < 100000; i ++ ) {

			const v = array[ i ];
			result += v.length();

		}

		return result;

	} );

	suite.add( 'Vector3-Float32Array', function () {

		const array = [];
		for ( let i = 0; i < 100000; i ++ ) {

			const v = new THREE.Vector3X( i, i, i );
			array.push( v );

		}

		let result = 0;
		for ( let i = 0; i < 100000; i ++ ) {

			const v = array[ i ];
			result += v.length();

		}

		return result;

	} );

	suite.add( 'Vector3-Array', function () {

		const array = [];
		for ( let i = 0; i < 100000; i ++ ) {

			const v = new THREE.Vector3Y( i, i, i );
			array.push( v );

		}

		let result = 0;
		for ( let i = 0; i < 100000; i ++ ) {

			const v = array[ i ];
			result += v.length();

		}

		return result;

	} );

} )();
