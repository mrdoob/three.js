import {
	DataTextureLoader,
	HalfFloatType,
	RGBAFormat
} from 'three';
import UTIF from '../libs/utif.module.js';

class LogLuvLoader extends DataTextureLoader {

	constructor( manager ) {

		super( manager );

		this.type = HalfFloatType;

	}

	parse( buffer ) {

		const ifds = UTIF.decode( buffer );
		UTIF.decodeImage( buffer, ifds[ 0 ] );
		const rgba = UTIF.toRGBA( ifds[ 0 ], this.type );

		return {
			width: ifds[ 0 ].width,
			height: ifds[ 0 ].height,
			data: rgba,
			format: RGBAFormat,
			type: this.type,
			flipY: true
		};

	}

	setDataType( value ) {

		this.type = value;
		return this;

	}

}

export { LogLuvLoader };
