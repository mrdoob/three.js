THREE.NRRDLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;


};

THREE.NRRDLoader.prototype = {

	constructor: THREE.NRRDLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.FileLoader( scope.manager );
		loader.setResponseType( 'arraybuffer' );
		loader.load( url, function ( data ) {

			onLoad( scope.parse( data ) );

		}, onProgress, onError );

	},

	parse: function ( data ) {

		// this parser is largely inspired from the XTK NRRD parser : https://github.com/xtk/X

		var _data = data;

		var _dataPointer = 0;

		var _nativeLittleEndian = new Int8Array( new Int16Array( [ 1 ] ).buffer )[ 0 ] > 0;

		var _littleEndian = true;

		var headerObject = {};

		function scan( type, chunks ) {

			if ( chunks === undefined || chunks === null ) {

				chunks = 1;

			}

			var _chunkSize = 1;
			var _array_type = Uint8Array;

			switch ( type ) {

			// 1 byte data types
				case 'uchar':
					break;
				case 'schar':
					_array_type = Int8Array;
					break;
					// 2 byte data types
				case 'ushort':
					_array_type = Uint16Array;
					_chunkSize = 2;
					break;
				case 'sshort':
					_array_type = Int16Array;
					_chunkSize = 2;
					break;
					// 4 byte data types
				case 'uint':
					_array_type = Uint32Array;
					_chunkSize = 4;
					break;
				case 'sint':
					_array_type = Int32Array;
					_chunkSize = 4;
					break;
				case 'float':
					_array_type = Float32Array;
					_chunkSize = 4;
					break;
				case 'complex':
					_array_type = Float64Array;
					_chunkSize = 8;
					break;
				case 'double':
					_array_type = Float64Array;
					_chunkSize = 8;
					break;

			}

			// increase the data pointer in-place
			var _bytes = new _array_type( _data.slice( _dataPointer,
				_dataPointer += chunks * _chunkSize ) );

			// if required, flip the endianness of the bytes
			if ( _nativeLittleEndian != _littleEndian ) {

				// we need to flip here since the format doesn't match the native endianness
				_bytes = flipEndianness( _bytes, _chunkSize );

			}

			if ( chunks == 1 ) {

				// if only one chunk was requested, just return one value
				return _bytes[ 0 ];

			}

			// return the byte array
			return _bytes;

		}

		//Flips typed array endianness in-place. Based on https://github.com/kig/DataStream.js/blob/master/DataStream.js.

		function flipEndianness( array, chunkSize ) {

			var u8 = new Uint8Array( array.buffer, array.byteOffset, array.byteLength );
			for ( var i = 0; i < array.byteLength; i += chunkSize ) {

				for ( var j = i + chunkSize - 1, k = i; j > k; j --, k ++ ) {

					var tmp = u8[ k ];
					u8[ k ] = u8[ j ];
					u8[ j ] = tmp;

				}

			}

			return array;

		}

		//parse the header
		function parseHeader( header ) {

			var data, field, fn, i, l, lines, m, _i, _len;
			lines = header.split( /\r?\n/ );
			for ( _i = 0, _len = lines.length; _i < _len; _i ++ ) {

				l = lines[ _i ];
				if ( l.match( /NRRD\d+/ ) ) {

					headerObject.isNrrd = true;

				} else if ( l.match( /^#/ ) ) {
				} else if ( m = l.match( /(.*):(.*)/ ) ) {

					field = m[ 1 ].trim();
					data = m[ 2 ].trim();
					fn = THREE.NRRDLoader.prototype.fieldFunctions[ field ];
					if ( fn ) {

						fn.call( headerObject, data );

					} else {

						headerObject[ field ] = data;

					}

				}

			}
			if ( ! headerObject.isNrrd ) {

				throw new Error( 'Not an NRRD file' );

			}
			if ( headerObject.encoding === 'bz2' || headerObject.encoding === 'bzip2' ) {

				throw new Error( 'Bzip is not supported' );

			}
			if ( ! headerObject.vectors ) {

				//if no space direction is set, let's use the identity
				headerObject.vectors = [ new THREE.Vector3( 1, 0, 0 ), new THREE.Vector3( 0, 1, 0 ), new THREE.Vector3( 0, 0, 1 ) ];
				//apply spacing if defined
				if ( headerObject.spacings ) {

					for ( i = 0; i <= 2; i ++ ) {

						if ( ! isNaN( headerObject.spacings[ i ] ) ) {

							headerObject.vectors[ i ].multiplyScalar( headerObject.spacings[ i ] );

						}

					}

				}

			}

		}

		//parse the data when registred as one of this type : 'text', 'ascii', 'txt'
		function parseDataAsText( data, start, end ) {

			var number = '';
			start = start || 0;
			end = end || data.length;
			var value;
			//length of the result is the product of the sizes
			var lengthOfTheResult = headerObject.sizes.reduce( function ( previous, current ) {

				return previous * current;

			}, 1 );

			var base = 10;
			if ( headerObject.encoding === 'hex' ) {

				base = 16;

			}

			var result = new headerObject.__array( lengthOfTheResult );
			var resultIndex = 0;
			var parsingFunction = parseInt;
			if ( headerObject.__array === Float32Array || headerObject.__array === Float64Array ) {

				parsingFunction = parseFloat;

			}
			for ( var i = start; i < end; i ++ ) {

				value = data[ i ];
				//if value is not a space
				if ( ( value < 9 || value > 13 ) && value !== 32 ) {

					number += String.fromCharCode( value );

				} else {

					if ( number !== '' ) {

						result[ resultIndex ] = parsingFunction( number, base );
						resultIndex ++;

					}
					number = '';

				}

			}
			if ( number !== '' ) {

				result[ resultIndex ] = parsingFunction( number, base );
				resultIndex ++;

			}
			return result;

		}

		var _bytes = scan( 'uchar', data.byteLength );
		var _length = _bytes.length;
		var _header = null;
		var _data_start = 0;
		var i;
		for ( i = 1; i < _length; i ++ ) {

			if ( _bytes[ i - 1 ] == 10 && _bytes[ i ] == 10 ) {

				// we found two line breaks in a row
				// now we know what the header is
				_header = this.parseChars( _bytes, 0, i - 2 );
				// this is were the data starts
				_data_start = i + 1;
				break;

			}

		}
		// parse the header
		parseHeader( _header );

		var _data = _bytes.subarray( _data_start ); // the data without header
		if ( headerObject.encoding === 'gzip' || headerObject.encoding === 'gz' ) {

			// we need to decompress the datastream
			// here we start the unzipping and get a typed Uint8Array back
			var inflate = new Zlib.Gunzip( new Uint8Array( _data ) ); // eslint-disable-line no-undef
			_data = inflate.decompress();

		} else if ( headerObject.encoding === 'ascii' || headerObject.encoding === 'text' || headerObject.encoding === 'txt' || headerObject.encoding === 'hex' ) {

			_data = parseDataAsText( _data );

		} else if ( headerObject.encoding === 'raw' ) {

			//we need to copy the array to create a new array buffer, else we retrieve the original arraybuffer with the header
			var _copy = new Uint8Array( _data.length );

			for ( var i = 0; i < _data.length; i ++ ) {

				_copy[ i ] = _data[ i ];

			}

			_data = _copy;

		}
		// .. let's use the underlying array buffer
		_data = _data.buffer;

		var volume = new THREE.Volume();
		volume.header = headerObject;
		//
		// parse the (unzipped) data to a datastream of the correct type
		//
		volume.data = new headerObject.__array( _data );
		// get the min and max intensities
		var min_max = volume.computeMinMax();
		var min = min_max[ 0 ];
		var max = min_max[ 1 ];
		// attach the scalar range to the volume
		volume.windowLow = min;
		volume.windowHigh = max;

		// get the image dimensions
		volume.dimensions = [ headerObject.sizes[ 0 ], headerObject.sizes[ 1 ], headerObject.sizes[ 2 ] ];
		volume.xLength = volume.dimensions[ 0 ];
		volume.yLength = volume.dimensions[ 1 ];
		volume.zLength = volume.dimensions[ 2 ];
		// spacing
		var spacingX = ( new THREE.Vector3( headerObject.vectors[ 0 ][ 0 ], headerObject.vectors[ 0 ][ 1 ],
			headerObject.vectors[ 0 ][ 2 ] ) ).length();
		var spacingY = ( new THREE.Vector3( headerObject.vectors[ 1 ][ 0 ], headerObject.vectors[ 1 ][ 1 ],
			headerObject.vectors[ 1 ][ 2 ] ) ).length();
		var spacingZ = ( new THREE.Vector3( headerObject.vectors[ 2 ][ 0 ], headerObject.vectors[ 2 ][ 1 ],
			headerObject.vectors[ 2 ][ 2 ] ) ).length();
		volume.spacing = [ spacingX, spacingY, spacingZ ];


		// Create IJKtoRAS matrix
		volume.matrix = new THREE.Matrix4();

		var _spaceX = 1;
		var _spaceY = 1;
		var _spaceZ = 1;

		if ( headerObject.space == "left-posterior-superior" ) {

			_spaceX = - 1;
			_spaceY = - 1;

		} else if ( headerObject.space === 'left-anterior-superior' ) {

			_spaceX = - 1;

		}


		if ( ! headerObject.vectors ) {

			volume.matrix.set(
				_spaceX, 0, 0, 0,
				0, _spaceY, 0, 0,
				0, 0, _spaceZ, 0,
				0, 0, 0, 1 );

		} else {

			var v = headerObject.vectors;

			volume.matrix.set(
				_spaceX * v[ 0 ][ 0 ], _spaceX * v[ 1 ][ 0 ], _spaceX * v[ 2 ][ 0 ], 0,
				_spaceY * v[ 0 ][ 1 ], _spaceY * v[ 1 ][ 1 ], _spaceY * v[ 2 ][ 1 ], 0,
				_spaceZ * v[ 0 ][ 2 ], _spaceZ * v[ 1 ][ 2 ], _spaceZ * v[ 2 ][ 2 ], 0,
				0, 0, 0, 1 );

		}

		volume.inverseMatrix = new THREE.Matrix4();
		volume.inverseMatrix.getInverse( volume.matrix );
		volume.RASDimensions = ( new THREE.Vector3( volume.xLength, volume.yLength, volume.zLength ) ).applyMatrix4( volume.matrix ).round().toArray().map( Math.abs );

		// .. and set the default threshold
		// only if the threshold was not already set
		if ( volume.lowerThreshold === - Infinity ) {

			volume.lowerThreshold = min;

		}
		if ( volume.upperThreshold === Infinity ) {

			volume.upperThreshold = max;

		}

		return volume;

	},

	parseChars: function ( array, start, end ) {

		// without borders, use the whole array
		if ( start === undefined ) {

			start = 0;

		}
		if ( end === undefined ) {

			end = array.length;

		}

		var output = '';
		// create and append the chars
		var i = 0;
		for ( i = start; i < end; ++ i ) {

			output += String.fromCharCode( array[ i ] );

		}

		return output;

	},

	fieldFunctions: {

		type: function ( data ) {

			switch ( data ) {

				case 'uchar':
				case 'unsigned char':
				case 'uint8':
				case 'uint8_t':
					this.__array = Uint8Array;
					break;
				case 'signed char':
				case 'int8':
				case 'int8_t':
					this.__array = Int8Array;
					break;
				case 'short':
				case 'short int':
				case 'signed short':
				case 'signed short int':
				case 'int16':
				case 'int16_t':
					this.__array = Int16Array;
					break;
				case 'ushort':
				case 'unsigned short':
				case 'unsigned short int':
				case 'uint16':
				case 'uint16_t':
					this.__array = Uint16Array;
					break;
				case 'int':
				case 'signed int':
				case 'int32':
				case 'int32_t':
					this.__array = Int32Array;
					break;
				case 'uint':
				case 'unsigned int':
				case 'uint32':
				case 'uint32_t':
					this.__array = Uint32Array;
					break;
				case 'float':
					this.__array = Float32Array;
					break;
				case 'double':
					this.__array = Float64Array;
					break;
				default:
					throw new Error( 'Unsupported NRRD data type: ' + data );

			}

			return this.type = data;

		},

		endian: function ( data ) {

			return this.endian = data;

		},

		encoding: function ( data ) {

			return this.encoding = data;

		},

		dimension: function ( data ) {

			return this.dim = parseInt( data, 10 );

		},

		sizes: function ( data ) {

			var i;
			return this.sizes = ( function () {

				var _i, _len, _ref, _results;
				_ref = data.split( /\s+/ );
				_results = [];
				for ( _i = 0, _len = _ref.length; _i < _len; _i ++ ) {

					i = _ref[ _i ];
					_results.push( parseInt( i, 10 ) );

				}
				return _results;

			} )();

		},

		space: function ( data ) {

			return this.space = data;

		},

		'space origin': function ( data ) {

			return this.space_origin = data.split( "(" )[ 1 ].split( ")" )[ 0 ].split( "," );

		},

		'space directions': function ( data ) {

			var f, parts, v;
			parts = data.match( /\(.*?\)/g );
			return this.vectors = ( function () {

				var _i, _len, _results;
				_results = [];
				for ( _i = 0, _len = parts.length; _i < _len; _i ++ ) {

					v = parts[ _i ];
					_results.push( ( function () {

						var _j, _len2, _ref, _results2;
						_ref = v.slice( 1, - 1 ).split( /,/ );
						_results2 = [];
						for ( _j = 0, _len2 = _ref.length; _j < _len2; _j ++ ) {

							f = _ref[ _j ];
							_results2.push( parseFloat( f ) );

						}
						return _results2;

					} )() );

				}
				return _results;

			} )();

		},

		spacings: function ( data ) {

			var f, parts;
			parts = data.split( /\s+/ );
			return this.spacings = ( function () {

				var _i, _len, _results = [];

				for ( _i = 0, _len = parts.length; _i < _len; _i ++ ) {

					f = parts[ _i ];
					_results.push( parseFloat( f ) );

				}
				return _results;

			} )();

		}
	}

};
