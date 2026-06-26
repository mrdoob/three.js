import {
	DataTexture,
	FileLoader,
	FloatType,
	RedFormat,
	MathUtils,
	Loader,
	UnsignedByteType,
	LinearFilter,
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

		const width = 360;
		const height = 180;
		const size = width * height;

		const data = new Array( size );

		function interpolateCandelaValues( phi, theta ) {

			let phiIndex = 0, thetaIndex = 0;
			let startTheta = 0, endTheta = 0, startPhi = 0, endPhi = 0;

			for ( let i = 0; i < iesLamp.numHorAngles - 1; ++ i ) { // numHorAngles = horAngles.length-1 because of extra padding, so this wont cause an out of bounds error

				if ( theta < iesLamp.horAngles[ i + 1 ] || i == iesLamp.numHorAngles - 2 ) {

					thetaIndex = i;
					startTheta = iesLamp.horAngles[ i ];
					endTheta = iesLamp.horAngles[ i + 1 ];

					break;

				}

			}

			for ( let i = 0; i < iesLamp.numVerAngles - 1; ++ i ) {

				if ( phi < iesLamp.verAngles[ i + 1 ] || i == iesLamp.numVerAngles - 2 ) {

					phiIndex = i;
					startPhi = iesLamp.verAngles[ i ];
					endPhi = iesLamp.verAngles[ i + 1 ];

					break;

				}

			}

			const deltaTheta = endTheta - startTheta;
			const deltaPhi = endPhi - startPhi;

			if ( deltaPhi === 0 ) // Outside range
				return 0;

			const t1 = deltaTheta === 0 ? 0 : ( theta - startTheta ) / deltaTheta;
			const t2 = ( phi - startPhi ) / deltaPhi;

			const nextThetaIndex = deltaTheta === 0 ? thetaIndex : thetaIndex + 1;

			const v1 = MathUtils.lerp( iesLamp.candelaValues[ thetaIndex ][ phiIndex ], iesLamp.candelaValues[ nextThetaIndex ][ phiIndex ], t1 );
			const v2 = MathUtils.lerp( iesLamp.candelaValues[ thetaIndex ][ phiIndex + 1 ], iesLamp.candelaValues[ nextThetaIndex ][ phiIndex + 1 ], t1 );
			const v = MathUtils.lerp( v1, v2, t2 );

			return v;

		}

		const startTheta = iesLamp.horAngles[ 0 ], endTheta = iesLamp.horAngles[ iesLamp.numHorAngles - 1 ];

		for ( let i = 0; i < size; ++ i ) {

			let theta = i % width;
			const phi = Math.floor( i / width );

			if ( endTheta - startTheta !== 0 && ( theta < startTheta || theta >= endTheta ) ) { // Handle symmetry for hor angles

				theta %= endTheta * 2;

				if ( theta > endTheta )
					theta = endTheta * 2 - theta;

			}

			data[ phi + theta * height ] = interpolateCandelaValues( phi, theta );

		}

		let result = null;

		if ( type === UnsignedByteType ) result = Uint8Array.from( data.map( v => Math.min( v * 0xFF, 0xFF ) ) );
		else if ( type === HalfFloatType ) result = Uint16Array.from( data.map( v => DataUtils.toHalfFloat( v ) ) );
		else if ( type === FloatType ) result = Float32Array.from( data );
		else console.error( 'IESLoader: Unsupported type:', type );

		return result;

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
		const data = this._getIESValues( iesLamp, type );

		const texture = new DataTexture( data, 180, 1, RedFormat, type );
		texture.minFilter = LinearFilter;
		texture.magFilter = LinearFilter;
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
	for ( let i = 0; i < _self.numHorAngles; ++ i ) {

		for ( let j = 0; j < _self.numVerAngles; ++ j ) {

			_self.candelaValues[ i ][ j ] *= _self.candelaValues[ i ][ j ] * _self.multiplier
				* _self.ballFactor * _self.blpFactor;

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

}


export { IESLoader };
