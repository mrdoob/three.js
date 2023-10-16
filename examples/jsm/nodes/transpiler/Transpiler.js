class Transpiler {

	constructor( encoder, decoder ) {

		this.encoder = encoder;
		this.decoder = decoder;

	}

	parse( source ) {

		return this.decoder.emit( this.encoder.parse( source ) );

	}

}

export default Transpiler;
