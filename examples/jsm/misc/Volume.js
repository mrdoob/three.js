/**
 * This class had been written to handle the output of the NRRD loader.
 * It contains a volume of data and informations about it.
 * For now it only handles 3 dimensional data.
 * See the webgl_loader_nrrd.html example and the loaderNRRD.js file to see how to use this class.
 * @class
 * @author Valentin Demeusy / https://github.com/stity
 * @param   {number}        xLength         Width of the volume
 * @param   {number}        yLength         Length of the volume
 * @param   {number}        zLength         Depth of the volume
 * @param   {string}        type            The type of data (uint8, uint16, ...)
 * @param   {ArrayBuffer}   arrayBuffer     The buffer with volume data
 */

import {
	Matrix3,
	Matrix4,
	Vector3
} from "../../../build/three.module.js";
import { VolumeSlice } from "../misc/VolumeSlice.js";
var Volume = function ( xLength, yLength, zLength, type, arrayBuffer ) {

	if ( arguments.length > 0 ) {

		/**
		 * @member {number} xLength Width of the volume in the IJK coordinate system
		 */
		this.xLength = Number( xLength ) || 1;
		/**
		 * @member {number} yLength Height of the volume in the IJK coordinate system
		 */
		this.yLength = Number( yLength ) || 1;
		/**
		 * @member {number} zLength Depth of the volume in the IJK coordinate system
		 */
		this.zLength = Number( zLength ) || 1;

		/**
		 * @member {TypedArray} data Data of the volume
		 */

		switch ( type ) {

			case 'Uint8' :
			case 'uint8' :
			case 'uchar' :
			case 'unsigned char' :
			case 'uint8_t' :
				this.data = new Uint8Array( arrayBuffer );
				break;
			case 'Int8' :
			case 'int8' :
			case 'signed char' :
			case 'int8_t' :
				this.data = new Int8Array( arrayBuffer );
				break;
			case 'Int16' :
			case 'int16' :
			case 'short' :
			case 'short int' :
			case 'signed short' :
			case 'signed short int' :
			case 'int16_t' :
				this.data = new Int16Array( arrayBuffer );
				break;
			case 'Uint16' :
			case 'uint16' :
			case 'ushort' :
			case 'unsigned short' :
			case 'unsigned short int' :
			case 'uint16_t' :
				this.data = new Uint16Array( arrayBuffer );
				break;
			case 'Int32' :
			case 'int32' :
			case 'int' :
			case 'signed int' :
			case 'int32_t' :
				this.data = new Int32Array( arrayBuffer );
				break;
			case 'Uint32' :
			case 'uint32' :
			case 'uint' :
			case 'unsigned int' :
			case 'uint32_t' :
				this.data = new Uint32Array( arrayBuffer );
				break;
			case 'longlong' :
			case 'long long' :
			case 'long long int' :
			case 'signed long long' :
			case 'signed long long int' :
			case 'int64' :
			case 'int64_t' :
			case 'ulonglong' :
			case 'unsigned long long' :
			case 'unsigned long long int' :
			case 'uint64' :
			case 'uint64_t' :
				throw 'Error in Volume constructor : this type is not supported in JavaScript';
				break;
			case 'Float32' :
			case 'float32' :
			case 'float' :
				this.data = new Float32Array( arrayBuffer );
				break;
			case 'Float64' :
			case 'float64' :
			case 'double' :
				this.data = new Float64Array( arrayBuffer );
				break;
			default :
				this.data = new Uint8Array( arrayBuffer );

		}

		if ( this.data.length !== this.xLength * this.yLength * this.zLength ) {

			throw 'Error in Volume constructor, lengths are not matching arrayBuffer size';

		}

	}

	/**
	 * @member {Array}  spacing Spacing to apply to the volume from IJK to RAS coordinate system
	 */
	this.spacing = [ 1, 1, 1 ];
	/**
	 * @member {Array}  offset Offset of the volume in the RAS coordinate system
	 */
	this.offset = [ 0, 0, 0 ];
	/**
	 * @member {Martrix3} matrix The IJK to RAS matrix
	 */
	this.matrix = new Matrix3();
	this.matrix.identity();
	/**
	 * @member {Martrix3} inverseMatrix The RAS to IJK matrix
	 */
	/**
	 * @member {number} lowerThreshold The voxels with values under this threshold won't appear in the slices.
	 *                      If changed, geometryNeedsUpdate is automatically set to true on all the slices associated to this volume
	 */
	var lowerThreshold = - Infinity;
	Object.defineProperty( this, 'lowerThreshold', {
		get: function () {

			return lowerThreshold;

		},
		set: function ( value ) {

			lowerThreshold = value;
			this.sliceList.forEach( function ( slice ) {

				slice.geometryNeedsUpdate = true;

			} );

		}
	} );
	/**
	 * @member {number} upperThreshold The voxels with values over this threshold won't appear in the slices.
	 *                      If changed, geometryNeedsUpdate is automatically set to true on all the slices associated to this volume
	 */
	var upperThreshold = Infinity;
	Object.defineProperty( this, 'upperThreshold', {
		get: function () {

			return upperThreshold;

		},
		set: function ( value ) {

			upperThreshold = value;
			this.sliceList.forEach( function ( slice ) {

				slice.geometryNeedsUpdate = true;

			} );

		}
	} );


	/**
	 * @member {Array} sliceList The list of all the slices associated to this volume
	 */
	this.sliceList = [];


	/**
	 * @member {Array} RASDimensions This array holds the dimensions of the volume in the RAS space
	 */

};

Volume.prototype = {

	constructor: Volume,

	/**
	 * @member {Function} getData Shortcut for data[access(i,j,k)]
	 * @memberof Volume
	 * @param {number} i    First coordinate
	 * @param {number} j    Second coordinate
	 * @param {number} k    Third coordinate
	 * @returns {number}  value in the data array
	 */
	getData: function ( i, j, k ) {

		return this.data[ k * this.xLength * this.yLength + j * this.xLength + i ];

	},

	/**
	 * @member {Function} access compute the index in the data array corresponding to the given coordinates in IJK system
	 * @memberof Volume
	 * @param {number} i    First coordinate
	 * @param {number} j    Second coordinate
	 * @param {number} k    Third coordinate
	 * @returns {number}  index
	 */
	access: function ( i, j, k ) {

		return k * this.xLength * this.yLength + j * this.xLength + i;

	},

	/**
	 * @member {Function} reverseAccess Retrieve the IJK coordinates of the voxel corresponding of the given index in the data
	 * @memberof Volume
	 * @param {number} index index of the voxel
	 * @returns {Array}  [x,y,z]
	 */
	reverseAccess: function ( index ) {

		var z = Math.floor( index / ( this.yLength * this.xLength ) );
		var y = Math.floor( ( index - z * this.yLength * this.xLength ) / this.xLength );
		var x = index - z * this.yLength * this.xLength - y * this.xLength;
		return [ x, y, z ];

	},

	/**
	 * @member {Function} map Apply a function to all the voxels, be careful, the value will be replaced
	 * @memberof Volume
	 * @param {Function} functionToMap A function to apply to every voxel, will be called with the following parameters :
	 *                                 value of the voxel
	 *                                 index of the voxel
	 *                                 the data (TypedArray)
	 * @param {Object}   context    You can specify a context in which call the function, default if this Volume
	 * @returns {Volume}   this
	 */
	map: function ( functionToMap, context ) {

		var length = this.data.length;
		context = context || this;

		for ( var i = 0; i < length; i ++ ) {

			this.data[ i ] = functionToMap.call( context, this.data[ i ], i, this.data );

		}

		return this;

	},

	/**
	 * @member {Function} extractPerpendicularPlane Compute the orientation of the slice and returns all the information relative to the geometry such as sliceAccess, the plane matrix (orientation and position in RAS coordinate) and the dimensions of the plane in both coordinate system.
	 * @memberof Volume
	 * @param {string}            axis  the normal axis to the slice 'x' 'y' or 'z'
	 * @param {number}            index the index of the slice
	 * @returns {Object} an object containing all the usefull information on the geometry of the slice
	 */
	extractPerpendicularPlane: function ( axis, RASIndex ) {

		var iLength,
			jLength,
			sliceAccess,
			planeMatrix = ( new Matrix4() ).identity(),
			volume = this,
			planeWidth,
			planeHeight,
			firstSpacing,
			secondSpacing,
			positionOffset,
			IJKIndex;

		var axisInIJK = new Vector3(),
			firstDirection = new Vector3(),
			secondDirection = new Vector3();

		var dimensions = new Vector3( this.xLength, this.yLength, this.zLength );


		switch ( axis ) {

			case 'x' :
				axisInIJK.set( 1, 0, 0 );
				firstDirection.set( 0, 0, - 1 );
				secondDirection.set( 0, - 1, 0 );
				firstSpacing = this.spacing[ 2 ];
				secondSpacing = this.spacing[ 1 ];
				IJKIndex = new Vector3( RASIndex, 0, 0 );

				planeMatrix.multiply( ( new Matrix4() ).makeRotationY( Math.PI / 2 ) );
				positionOffset = ( volume.RASDimensions[ 0 ] - 1 ) / 2;
				planeMatrix.setPosition( new Vector3( RASIndex - positionOffset, 0, 0 ) );
				break;
			case 'y' :
				axisInIJK.set( 0, 1, 0 );
				firstDirection.set( 1, 0, 0 );
				secondDirection.set( 0, 0, 1 );
				firstSpacing = this.spacing[ 0 ];
				secondSpacing = this.spacing[ 2 ];
				IJKIndex = new Vector3( 0, RASIndex, 0 );

				planeMatrix.multiply( ( new Matrix4() ).makeRotationX( - Math.PI / 2 ) );
				positionOffset = ( volume.RASDimensions[ 1 ] - 1 ) / 2;
				planeMatrix.setPosition( new Vector3( 0, RASIndex - positionOffset, 0 ) );
				break;
			case 'z' :
			default :
				axisInIJK.set( 0, 0, 1 );
				firstDirection.set( 1, 0, 0 );
				secondDirection.set( 0, - 1, 0 );
				firstSpacing = this.spacing[ 0 ];
				secondSpacing = this.spacing[ 1 ];
				IJKIndex = new Vector3( 0, 0, RASIndex );

				positionOffset = ( volume.RASDimensions[ 2 ] - 1 ) / 2;
				planeMatrix.setPosition( new Vector3( 0, 0, RASIndex - positionOffset ) );
				break;

		}

		firstDirection.applyMatrix4( volume.inverseMatrix ).normalize();
		firstDirection.argVar = 'i';
		secondDirection.applyMatrix4( volume.inverseMatrix ).normalize();
		secondDirection.argVar = 'j';
		axisInIJK.applyMatrix4( volume.inverseMatrix ).normalize();
		iLength = Math.floor( Math.abs( firstDirection.dot( dimensions ) ) );
		jLength = Math.floor( Math.abs( secondDirection.dot( dimensions ) ) );
		planeWidth = Math.abs( iLength * firstSpacing );
		planeHeight = Math.abs( jLength * secondSpacing );

		IJKIndex = Math.abs( Math.round( IJKIndex.applyMatrix4( volume.inverseMatrix ).dot( axisInIJK ) ) );
		var base = [ new Vector3( 1, 0, 0 ), new Vector3( 0, 1, 0 ), new Vector3( 0, 0, 1 ) ];
		var iDirection = [ firstDirection, secondDirection, axisInIJK ].find( function ( x ) {

			return Math.abs( x.dot( base[ 0 ] ) ) > 0.9;

		} );
		var jDirection = [ firstDirection, secondDirection, axisInIJK ].find( function ( x ) {

			return Math.abs( x.dot( base[ 1 ] ) ) > 0.9;

		} );
		var kDirection = [ firstDirection, secondDirection, axisInIJK ].find( function ( x ) {

			return Math.abs( x.dot( base[ 2 ] ) ) > 0.9;

		} );

		sliceAccess = function ( i, j ) {

			var accessI, accessJ, accessK;

			var si = ( iDirection === axisInIJK ) ? IJKIndex : ( iDirection.argVar === 'i' ? i : j );
			var sj = ( jDirection === axisInIJK ) ? IJKIndex : ( jDirection.argVar === 'i' ? i : j );
			var sk = ( kDirection === axisInIJK ) ? IJKIndex : ( kDirection.argVar === 'i' ? i : j );

			// invert indices if necessary

			var accessI = ( iDirection.dot( base[ 0 ] ) > 0 ) ? si : ( volume.xLength - 1 ) - si;
			var accessJ = ( jDirection.dot( base[ 1 ] ) > 0 ) ? sj : ( volume.yLength - 1 ) - sj;
			var accessK = ( kDirection.dot( base[ 2 ] ) > 0 ) ? sk : ( volume.zLength - 1 ) - sk;

			return volume.access( accessI, accessJ, accessK );

		};

		return {
			iLength: iLength,
			jLength: jLength,
			sliceAccess: sliceAccess,
			matrix: planeMatrix,
			planeWidth: planeWidth,
			planeHeight: planeHeight
		};

	},

	/**
	 * @member {Function} extractSlice Returns a slice corresponding to the given axis and index
	 *                        The coordinate are given in the Right Anterior Superior coordinate format
	 * @memberof Volume
	 * @param {string}            axis  the normal axis to the slice 'x' 'y' or 'z'
	 * @param {number}            index the index of the slice
	 * @returns {VolumeSlice} the extracted slice
	 */
	extractSlice: function ( axis, index ) {

		var slice = new VolumeSlice( this, index, axis );
		this.sliceList.push( slice );
		return slice;

	},

	/**
	 * @member {Function} repaintAllSlices Call repaint on all the slices extracted from this volume
	 * @see VolumeSlice.repaint
	 * @memberof Volume
	 * @returns {Volume} this
	 */
	repaintAllSlices: function () {

		this.sliceList.forEach( function ( slice ) {

			slice.repaint();

		} );

		return this;

	},

	/**
	 * @member {Function} computeMinMax Compute the minimum and the maximum of the data in the volume
	 * @memberof Volume
	 * @returns {Array} [min,max]
	 */
	computeMinMax: function () {

		var min = Infinity;
		var max = - Infinity;

		// buffer the length
		var datasize = this.data.length;

		var i = 0;
		for ( i = 0; i < datasize; i ++ ) {

			if ( ! isNaN( this.data[ i ] ) ) {

				var value = this.data[ i ];
				min = Math.min( min, value );
				max = Math.max( max, value );

			}

		}
		this.min = min;
		this.max = max;

		return [ min, max ];

	}

};

export { Volume };
