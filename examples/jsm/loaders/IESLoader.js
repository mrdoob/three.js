import {
	DataTexture,
	FileLoader,
	FloatType,
	RedFormat,
	MathUtils,
	Loader,
	UnsignedByteType,
	LinearFilter,
	RepeatWrapping,
	HalfFloatType,
	DataUtils
} from 'three';

/**
 * A loader for the IES format.
 *
 * The loaded texture should be assigned to {@link IESSpotLight#map}.
 *
 * ```js
 * const loader = new IESLoader();
 * const texture = await loader.loadAsync( 'ies/007cfb11e343e2f42e3b476be4ab684e.ies' );
 *
 * const spotLight = new THREE.IESSpotLight( 0xff0000, 500 );
 * spotLight.iesMap = texture;
 * ```
 *
 * @augments Loader
 * @three_import import { IESLoader } from 'three/addons/loaders/IESLoader.js';
 */
class IESLoader extends Loader {

	/**
	 * Constructs a new IES loader.
	 *
	 * @param {LoadingManager} [manager] - The loading manager.
	 */
	constructor( manager ) {

		super( manager );

		/**
		 * The texture type.
		 *
		 * @type {(HalfFloatType|FloatType)}
		 * @default HalfFloatType
		 */
		this.type = HalfFloatType;

	}

	_getIESValues( iesLamp, type ) {

		function findIndex( angles, value ) {

			for ( let i = 0; i < angles.length - 2; ++ i ) {

				if ( value < angles[ i + 1 ] ) {

					return i;

				}

			}

			return angles.length - 2;

		}

		function interpolateCandelaValues( azimuth, inclination ) {

			const azimuthIndex = findIndex( iesLamp.horAngles, azimuth );
			const deltaAzimuth = iesLamp.horAngles[ azimuthIndex + 1 ] - iesLamp.horAngles[ azimuthIndex ];
			const tAzimuth = ( azimuth - iesLamp.horAngles[ azimuthIndex ] ) / deltaAzimuth;

			const inclinationIndex = findIndex( iesLamp.verAngles, inclination );
			const deltaInclination = iesLamp.verAngles[ inclinationIndex + 1 ] - iesLamp.verAngles[ inclinationIndex ];
			const tInclination = ( inclination - iesLamp.verAngles[ inclinationIndex ] ) / deltaInclination;

			const v1 = MathUtils.lerp( iesLamp.candelaValues[ azimuthIndex ][ inclinationIndex ], iesLamp.candelaValues[ azimuthIndex ][ inclinationIndex + 1 ], tInclination );
			const v2 = MathUtils.lerp( iesLamp.candelaValues[ azimuthIndex + 1 ][ inclinationIndex ], iesLamp.candelaValues[ azimuthIndex + 1 ][ inclinationIndex + 1 ], tInclination );
			const v = MathUtils.lerp( v1, v2, tAzimuth );
			return v;

		}

		const startAzimuth = iesLamp.horAngles[ 0 ], endAzimuth = iesLamp.horAngles[ iesLamp.numHorAngles - 1 ];
		const startInclination = iesLamp.verAngles[ 0 ], endInclination = iesLamp.verAngles[ iesLamp.numVerAngles - 1 ];

		// compute the best resolution for the IES texture based on the minium sampling angle
		const nh = iesLamp.horAngles.length;
		const nv = iesLamp.verAngles.length;
		let dAzimuth = 360;
		for ( let i = 0; i < nh - 1; ++ i ) {

			dAzimuth = Math.min( dAzimuth, iesLamp.horAngles[ i + 1 ] - iesLamp.horAngles[ i ] );

		}

		dAzimuth = Math.max( dAzimuth, 0.5 );
		let dInclination = 180;
		for ( let i = 0; i < nv - 1; ++ i ) {

			dInclination = Math.min( dInclination, iesLamp.verAngles[ i + 1 ] - iesLamp.verAngles[ i ] );

		}

		dInclination = Math.max( dInclination, 0.5 );

		const rangeAzimuth = iesLamp.horAngles[ nh - 1 ] - iesLamp.horAngles[ 0 ];
		const nAzimuth = Math.round( rangeAzimuth / dAzimuth ) + 1;
		const rangeInclination = iesLamp.verAngles[ nv - 1 ] - iesLamp.verAngles[ 0 ];
		const nInclination = Math.round( rangeInclination / dInclination ) + 1;

		const data = new Array( nAzimuth * nInclination );

		for ( let iAzimuth = 0; iAzimuth < nAzimuth; ++ iAzimuth ) {

			const azimuth = iAzimuth * 360 / ( nAzimuth - 1 );
			if ( azimuth < startAzimuth || azimuth > endAzimuth ) {

				continue;

			}

			for ( let iInclination = 0; iInclination < nInclination; ++ iInclination ) {

				const inclination = iInclination * 180 / ( nInclination - 1 );
				if ( inclination < startInclination || inclination > endInclination ) {

					continue;

				}

				data[ iAzimuth + iInclination * nAzimuth ] = interpolateCandelaValues( azimuth, inclination );

			}

		}

		let result = null;

		if ( type === UnsignedByteType ) result = Uint8Array.from( data.map( v => Math.min( v * 0xFF, 0xFF ) ) );
		else if ( type === HalfFloatType ) result = Uint16Array.from( data.map( v => DataUtils.toHalfFloat( v ) ) );
		else if ( type === FloatType ) result = Float32Array.from( data );
		else console.error( 'IESLoader: Unsupported type:', type );

		return { data: result, width: nAzimuth, height: nInclination };

	}

	/**
	 * Starts loading from the given URL and passes the loaded IES texture
	 * to the `onLoad()` callback.
	 *
	 * @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
	 * @param {function(DataTexture)} onLoad - Executed when the loading process has been finished.
	 * @param {onProgressCallback} onProgress - Executed while the loading is in progress.
	 * @param {onErrorCallback} onError - Executed when errors occur.
	 */
	load( url, onLoad, onProgress, onError ) {

		const loader = new FileLoader( this.manager );
		loader.setResponseType( 'text' );
		loader.setCrossOrigin( this.crossOrigin );
		loader.setWithCredentials( this.withCredentials );
		loader.setPath( this.path );
		loader.setRequestHeader( this.requestHeader );

		loader.load( url, text => {

			onLoad( this.parse( text ) );

		}, onProgress, onError );

	}

	/**
	 * Parses the given IES data.
	 *
	 * @param {string} text - The raw IES data.
	 * @return {DataTexture} THE IES data as a texture.
	 */
	parse( text ) {

		const type = this.type;

		const iesLamp = new IESLamp( text );
		const result = this._getIESValues( iesLamp, type );

		const texture = new DataTexture( result.data, result.width, result.height, RedFormat, type );
		texture.minFilter = LinearFilter;
		texture.magFilter = LinearFilter;
		texture.wrapS = RepeatWrapping;
		texture.needsUpdate = true;

		return texture;

	}

}


function IESLamp( text ) {

	const _self = this;

	const textArray = text.split( '\n' );

	let lineNumber = 0;
	let line;

	_self.verAngles = [ ];
	_self.horAngles = [ ];

	_self.candelaValues = [ ];

	_self.tiltData = { };
	_self.tiltData.angles = [ ];
	_self.tiltData.mulFactors = [ ];

	function textToArray( text ) {

		text = text.replace( /^\s+|\s+$/g, '' ); // remove leading or trailing spaces
		text = text.replace( /,/g, ' ' ); // replace commas with spaces
		text = text.replace( /\s\s+/g, ' ' ); // replace white space/tabs etc by single whitespace

		const array = text.split( ' ' );

		return array;

	}

	function readArray( count, array ) {

		while ( true ) {

			const line = textArray[ lineNumber ++ ];
			const lineData = textToArray( line );

			for ( let i = 0; i < lineData.length; ++ i ) {

				array.push( Number( lineData[ i ] ) );

			}

			if ( array.length === count )
				break;

		}

	}

	function readTilt() {

		let line = textArray[ lineNumber ++ ];
		let lineData = textToArray( line );

		_self.tiltData.lampToLumGeometry = Number( lineData[ 0 ] );

		line = textArray[ lineNumber ++ ];
		lineData = textToArray( line );

		_self.tiltData.numAngles = Number( lineData[ 0 ] );

		readArray( _self.tiltData.numAngles, _self.tiltData.angles );
		readArray( _self.tiltData.numAngles, _self.tiltData.mulFactors );

	}

	function readLampValues() {

		const values = [ ];
		readArray( 10, values );

		_self.count = Number( values[ 0 ] );
		_self.lumens = Number( values[ 1 ] );
		_self.multiplier = Number( values[ 2 ] );
		_self.numVerAngles = Number( values[ 3 ] );
		_self.numHorAngles = Number( values[ 4 ] );
		_self.gonioType = Number( values[ 5 ] );
		_self.units = Number( values[ 6 ] );
		_self.width = Number( values[ 7 ] );
		_self.length = Number( values[ 8 ] );
		_self.height = Number( values[ 9 ] );

	}

	function readLampFactors() {

		const values = [ ];
		readArray( 3, values );

		_self.ballFactor = Number( values[ 0 ] );
		_self.blpFactor = Number( values[ 1 ] );
		_self.inputWatts = Number( values[ 2 ] );

	}

	function _unrollTypeA() {

		if ( _self.horAngles.at( 0 ) == 0 ) {

			const candelaValues = [];
			const horAngles = [];
			for ( let i = _self.numHorAngles - 1; i > 0; -- i ) {

				candelaValues.push( _self.candelaValues[ i ].slice() );
				horAngles.push( - _self.horAngles[ i ] );

			}

			_self.candelaValues = candelaValues.concat( _self.candelaValues );
			_self.horAngles = horAngles.concat( _self.horAngles );

		}

		for ( let iv = 0; iv < _self.verAngles.length; ++ iv ) {

			_self.verAngles[ iv ] += 90;

		}

	}

	function _unrollTypeB() {

		console.log( 'Type B : this type is not supported correctly, sorry.' );
		if ( _self.horAngles.at( 0 ) == 0 ) {

			const candelaValues = [];
			const horAngles = [];
			for ( let i = _self.numHorAngles - 1; i > 0; -- i ) {

				candelaValues.push( _self.candelaValues[ i ].slice() );
				horAngles.push( - _self.horAngles[ i ] );

			}

			_self.candelaValues = candelaValues.concat( _self.candelaValues );
			_self.horAngles = horAngles.concat( _self.horAngles );

		}

		for ( let iv = 0; iv < _self.verAngles.length; ++ iv ) {

			_self.verAngles[ iv ] += 90;

		}

	}

	function _unrollTypeC() {

		if ( _self.horAngles.at( - 1 ) == 0 ) {

			_self.candelaValues.push( _self.candelaValues.at( - 1 ).slice() );
			_self.horAngles.push( 360 );
			_self.numHorAngles = 2;

		}

		if ( _self.horAngles.at( - 1 ) == 90 ) {

			for ( let i = _self.numHorAngles - 2; i >= 0; -- i ) {

				_self.candelaValues.push( _self.candelaValues[ i ].slice() );
				_self.horAngles.push( 180 - _self.horAngles[ i ] );

			}

			_self.numHorAngles = 2 * _self.numHorAngles - 1;

		}

		if ( _self.horAngles.at( - 1 ) == 180 ) {

			for ( let i = _self.numHorAngles - 2; i >= 0; -- i ) {

				_self.candelaValues.push( _self.candelaValues[ i ].slice() );
				_self.horAngles.push( 360 - _self.horAngles[ i ] );

			}

			_self.numHorAngles = 2 * _self.numHorAngles - 1;

		}

		if ( _self.horAngles.at( - 1 ) != 360 ) {

			//do nothing
			console.log( 'Type C : There is an issue in the horizontal angles.' );

		}

	}

	function unroll() {

		if ( _self.gonioType == 1 ) {

			_unrollTypeC();

		} else if ( _self.gonioType == 3 ) {

			_unrollTypeA();

		} else if ( _self.gonioType == 2 ) {

			_unrollTypeB();

		}

	}

	while ( true ) {

		line = textArray[ lineNumber ++ ];

		if ( line.includes( 'TILT' ) ) {

			break;

		}

	}

	if ( ! line.includes( 'NONE' ) ) {

		if ( line.includes( 'INCLUDE' ) ) {

			readTilt();

		} else {

			// TODO:: Read tilt data from a file

		}

	}

	readLampValues();

	readLampFactors();

	// Initialize candela value array
	for ( let i = 0; i < _self.numHorAngles; ++ i ) {

		_self.candelaValues.push( [ ] );

	}

	// Parse Angles
	readArray( _self.numVerAngles, _self.verAngles );
	readArray( _self.numHorAngles, _self.horAngles );



	// Parse Candela values
	for ( let i = 0; i < _self.numHorAngles; ++ i ) {

		readArray( _self.numVerAngles, _self.candelaValues[ i ] );

	}

	// Calculate actual candela values, and normalize.
	const factor = _self.multiplier * _self.ballFactor * _self.blpFactor;
	for ( let i = 0; i < _self.numHorAngles; ++ i ) {

		for ( let j = 0; j < _self.numVerAngles; ++ j ) {

			_self.candelaValues[ i ][ j ] *= factor;

		}

	}

	let maxVal = - 1;
	for ( let i = 0; i < _self.numHorAngles; ++ i ) {

		for ( let j = 0; j < _self.numVerAngles; ++ j ) {

			const value = _self.candelaValues[ i ][ j ];
			maxVal = maxVal < value ? value : maxVal;

		}

	}

	const bNormalize = true;
	if ( bNormalize && maxVal > 0 ) {

		for ( let i = 0; i < _self.numHorAngles; ++ i ) {

			for ( let j = 0; j < _self.numVerAngles; ++ j ) {

				_self.candelaValues[ i ][ j ] /= maxVal;

			}

		}

	}

	unroll();

}


export { IESLoader };
