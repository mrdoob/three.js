import {
	FileLoader,
	Loader,
	Matrix4,
	Vector3
} from 'three';
import * as fflate from '../libs/fflate.module.js';
import { Volume } from '../misc/Volume.js';

class NRRDLoader extends Loader {

	constructor( manager ) {

		super( manager );

	}

	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const loader = new FileLoader( scope.manager );
		loader.setPath( scope.path );
		loader.setResponseType( 'arraybuffer' );
		loader.setRequestHeader( scope.requestHeader );
		loader.setWithCredentials( scope.withCredentials );
		loader.load( url, function ( data ) {

			try {

				onLoad( scope.parse( data ) );

			} catch ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					console.error( e );

				}

				scope.manager.itemError( url );

			}

		}, onProgress, onError );

	}

	/**
	 *
	 * @param {boolean} segmentation is a option for user to choose
   	 */
	setSegmentation( segmentation ) {

	    this.segmentation = segmentation;

	}

	parse( data ) {

		// this parser is largely inspired from the XTK NRRD parser : https://github.com/xtk/X

		let _data = data;

		let _dataPointer = 0;

		const _nativeLittleEndian = new Int8Array( new Int16Array( [ 1 ] ).buffer )[ 0 ] > 0;

		const _littleEndian = true;

		const headerObject = {};

		function scan( type, chunks ) {

			if ( chunks === undefined || chunks === null ) {

				chunks = 1;

			}

			let _chunkSize = 1;
			let _array_type = Uint8Array;

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
			let _bytes = new _array_type( _data.slice( _dataPointer,
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

			const u8 = new Uint8Array( array.buffer, array.byteOffset, array.byteLength );
			for ( let i = 0; i < array.byteLength; i += chunkSize ) {

				for ( let j = i + chunkSize - 1, k = i; j > k; j --, k ++ ) {

					const tmp = u8[ k ];
					u8[ k ] = u8[ j ];
					u8[ j ] = tmp;

				}

			}

			return array;

		}

		//parse the header
		function parseHeader( header ) {

			let data, field, fn, i, l, m, _i, _len;
			const lines = header.split( /\r?\n/ );
			for ( _i = 0, _len = lines.length; _i < _len; _i ++ ) {

				l = lines[ _i ];
				if ( l.match( /NRRD\d+/ ) ) {

					headerObject.isNrrd = true;

				} else if ( ! l.match( /^#/ ) && ( m = l.match( /(.*):(.*)/ ) ) ) {

					field = m[ 1 ].trim();
					data = m[ 2 ].trim();
					fn = _fieldFunctions[ field ];
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
				headerObject.vectors = [ ];
				headerObject.vectors.push( [ 1, 0, 0 ] );
				headerObject.vectors.push( [ 0, 1, 0 ] );
				headerObject.vectors.push( [ 0, 0, 1 ] );

				//apply spacing if defined
				if ( headerObject.spacings ) {

					for ( i = 0; i <= 2; i ++ ) {

						if ( ! isNaN( headerObject.spacings[ i ] ) ) {

							for ( let j = 0; j <= 2; j ++ ) {

								headerObject.vectors[ i ][ j ] *= headerObject.spacings[ i ];

							}

						}

					}

				}

			}

		}

		//parse the data when registred as one of this type : 'text', 'ascii', 'txt'
		function parseDataAsText( data, start, end ) {

			let number = '';
			start = start || 0;
			end = end || data.length;
			let value;
			//length of the result is the product of the sizes
			const lengthOfTheResult = headerObject.sizes.reduce( function ( previous, current ) {

				return previous * current;

			}, 1 );

			let base = 10;
			if ( headerObject.encoding === 'hex' ) {

				base = 16;

			}

			const result = new headerObject.__array( lengthOfTheResult );
			let resultIndex = 0;
			let parsingFunction = parseInt;
			if ( headerObject.__array === Float32Array || headerObject.__array === Float64Array ) {

				parsingFunction = parseFloat;

			}

			for ( let i = start; i < end; i ++ ) {

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

		const _bytes = scan( 'uchar', data.byteLength );
		const _length = _bytes.length;
		let _header = null;
		let _data_start = 0;
		let i;
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

		_data = _bytes.subarray( _data_start ); // the data without header
		if ( headerObject.encoding.substring( 0, 2 ) === 'gz' ) {

			// we need to decompress the datastream
			// here we start the unzipping and get a typed Uint8Array back
			_data = fflate.gunzipSync( new Uint8Array( _data ) );

		} else if ( headerObject.encoding === 'ascii' || headerObject.encoding === 'text' || headerObject.encoding === 'txt' || headerObject.encoding === 'hex' ) {

			_data = parseDataAsText( _data );

		} else if ( headerObject.encoding === 'raw' ) {

			//we need to copy the array to create a new array buffer, else we retrieve the original arraybuffer with the header
			const _copy = new Uint8Array( _data.length );

			for ( let i = 0; i < _data.length; i ++ ) {

				_copy[ i ] = _data[ i ];

			}

			_data = _copy;

		}

		// .. let's use the underlying array buffer
		_data = _data.buffer;

		const volume = new Volume();
		volume.header = headerObject;
		volume.segmentation = this.segmentation;
		//
		// parse the (unzipped) data to a datastream of the correct type
		//
		volume.data = new headerObject.__array( _data );
		// get the min and max intensities
		const min_max = volume.computeMinMax();
		const min = min_max[ 0 ];
		const max = min_max[ 1 ];
		// attach the scalar range to the volume
		volume.windowLow = min;
		volume.windowHigh = max;

		// get the image dimensions
		volume.dimensions = [ headerObject.sizes[ 0 ], headerObject.sizes[ 1 ], headerObject.sizes[ 2 ] ];
		volume.xLength = volume.dimensions[ 0 ];
		volume.yLength = volume.dimensions[ 1 ];
		volume.zLength = volume.dimensions[ 2 ];

		// Identify axis order in the space-directions matrix from the header if possible.
		if ( headerObject.vectors ) {

			const xIndex = headerObject.vectors.findIndex( vector => vector[ 0 ] !== 0 );
			const yIndex = headerObject.vectors.findIndex( vector => vector[ 1 ] !== 0 );
			const zIndex = headerObject.vectors.findIndex( vector => vector[ 2 ] !== 0 );

			const axisOrder = [];

			if ( xIndex !== yIndex && xIndex !== zIndex && yIndex !== zIndex ) {

				axisOrder[ xIndex ] = 'x';
				axisOrder[ yIndex ] = 'y';
				axisOrder[ zIndex ] = 'z';

			} else {

				axisOrder[ 0 ] = 'x';
				axisOrder[ 1 ] = 'y';
				axisOrder[ 2 ] = 'z';

			}

			volume.axisOrder = axisOrder;

		} else {

			volume.axisOrder = [ 'x', 'y', 'z' ];

		}

		// spacing
		const spacingX = new Vector3().fromArray( headerObject.vectors[ 0 ] ).length();
		const spacingY = new Vector3().fromArray( headerObject.vectors[ 1 ] ).length();
		const spacingZ = new Vector3().fromArray( headerObject.vectors[ 2 ] ).length();
		volume.spacing = [ spacingX, spacingY, spacingZ ];


		// Create IJKtoRAS matrix
		volume.matrix = new Matrix4();

		const transitionMatrix = new Matrix4();

		if ( headerObject.space === 'left-posterior-superior' ) {

			transitionMatrix.set(
				- 1, 0, 0, 0,
				0, - 1, 0, 0,
				0, 0, 1, 0,
				0, 0, 0, 1
			);

		} else if ( headerObject.space === 'left-anterior-superior' ) {

			transitionMatrix.set(
				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, - 1, 0,
				0, 0, 0, 1
			);

		}


		if ( ! headerObject.vectors ) {

			volume.matrix.set(
				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				0, 0, 0, 1 );

		} else {

			const v = headerObject.vectors;

			const ijk_to_transition = new Matrix4().set(
				v[ 0 ][ 0 ], v[ 1 ][ 0 ], v[ 2 ][ 0 ], 0,
				v[ 0 ][ 1 ], v[ 1 ][ 1 ], v[ 2 ][ 1 ], 0,
				v[ 0 ][ 2 ], v[ 1 ][ 2 ], v[ 2 ][ 2 ], 0,
				0, 0, 0, 1
			);

			const transition_to_ras = new Matrix4().multiplyMatrices( ijk_to_transition, transitionMatrix );

			volume.matrix = transition_to_ras;

		}

		volume.inverseMatrix = new Matrix4();
		volume.inverseMatrix.copy( volume.matrix ).invert();
		
		volume.RASDimensions = [
			Math.floor( volume.xLength * spacingX ), 
			Math.floor( volume.yLength * spacingY ), 
			Math.floor( volume.zLength * spacingZ )
		];

		// .. and set the default threshold
		// only if the threshold was not already set
		if ( volume.lowerThreshold === - Infinity ) {

			volume.lowerThreshold = min;

		}

		if ( volume.upperThreshold === Infinity ) {

			volume.upperThreshold = max;

		}

		return volume;

	}

	parseChars( array, start, end ) {

		// without borders, use the whole array
		if ( start === undefined ) {

			start = 0;

		}

		if ( end === undefined ) {

			end = array.length;

		}

		let output = '';
		// create and append the chars
		let i = 0;
		for ( i = start; i < end; ++ i ) {

			output += String.fromCharCode( array[ i ] );

		}

		return output;

	}

}

const _fieldFunctions = {

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

		let i;
		return this.sizes = ( function () {

			const _ref = data.split( /\s+/ );
			const _results = [];

			for ( let _i = 0, _len = _ref.length; _i < _len; _i ++ ) {

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

		return this.space_origin = data.split( '(' )[ 1 ].split( ')' )[ 0 ].split( ',' );

	},

	'space directions': function ( data ) {

		let f, v;
		const parts = data.match( /\(.*?\)/g );
		return this.vectors = ( function () {

			const _results = [];

			for ( let _i = 0, _len = parts.length; _i < _len; _i ++ ) {

				v = parts[ _i ];
				_results.push( ( function () {

					const _ref = v.slice( 1, - 1 ).split( /,/ );
					const _results2 = [];

					for ( let _j = 0, _len2 = _ref.length; _j < _len2; _j ++ ) {

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

		let f;
		const parts = data.split( /\s+/ );
		return this.spacings = ( function () {

			const _results = [];

			for ( let _i = 0, _len = parts.length; _i < _len; _i ++ ) {

				f = parts[ _i ];
				_results.push( parseFloat( f ) );

			}

			return _results;

		} )();

	}

};

export { NRRDLoader };
