class Transpiler {

	constructor( decoder, encoder ) {

		this.decoder = decoder;
		this.encoder = encoder;

	}

	parse( source ) {

		return this.encoder.emit( this.decoder.parse( source ) );

	}

}

export default Transpiler;
