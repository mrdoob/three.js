( function () {

	const suite = Bench.newSuite( 'Vector 3 Components' );

	THREE = {};

	THREE.Vector3 = function ( x, y, z ) {

		this.x = x || 0;
		this.y = y || 0;
		this.z = z || 0;

	};

	THREE.Vector3.prototype = {
		constructor: THREE.Vector3,
		setComponent: function ( index, value ) {

			this[ THREE.Vector3.__indexToName[ index ] ] = value;

		},

		getComponent: function ( index ) {

			return this[ THREE.Vector3.__indexToName[ index ] ];

		},

		setComponent2: function ( index, value ) {

			switch ( index ) {

				case 0:
					this.x = value;
					break;
				case 1:
					this.y = value;
					break;
				case 2:
					this.z = value;
					break;
				default:
					throw new Error( 'index is out of range: ' + index );

			}

		},

		getComponent2: function ( index ) {

			switch ( index ) {

				case 0:
					return this.x;
				case 1:
					return this.y;
				case 2:
					return this.z;
				default:
					throw new Error( 'index is out of range: ' + index );

			}

		},


		getComponent3: function ( index ) {

			if ( index === 0 ) return this.x;
			if ( index === 1 ) return this.y;
			if ( index === 2 ) return this.z;
			throw new Error( 'index is out of range: ' + index );

		},

		getComponent4: function ( index ) {

			if ( index === 0 ) return this.x; else if ( index === 1 ) return this.y; else if ( index === 2 ) return this.z;
			else
				throw new Error( 'index is out of range: ' + index );

		}
	};


	THREE.Vector3.__indexToName = {
		0: 'x',
		1: 'y',
		2: 'z'
	};

	const data = [];
	for ( let i = 0; i < 100000; i ++ ) {

		data[ i ] = new THREE.Vector3( i * 0.01, i * 2, i * - 1.3 );

	}


	suite.add( 'IndexToName', function () {

		let result = 0;
		for ( let i = 0; i < 100000; i ++ ) {

			result += data[ i ].getComponent( i % 3 );

		}

		return result;

	} );

	suite.add( 'SwitchStatement', function () {

		let result = 0;
		for ( let i = 0; i < 100000; i ++ ) {

			result += data[ i ].getComponent2( i % 3 );

		}

		return result;

	} );

	suite.add( 'IfAndReturnSeries', function () {

		let result = 0;
		for ( let i = 0; i < 100000; i ++ ) {

			result += data[ i ].getComponent3( i % 3 );

		}

		return result;

	} );

	suite.add( 'IfReturnElseSeries', function () {

		let result = 0;
		for ( let i = 0; i < 100000; i ++ ) {

			result += data[ i ].getComponent4( i % 3 );

		}

		return result;

	} );

} )();
