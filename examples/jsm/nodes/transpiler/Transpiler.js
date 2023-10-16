class Transpiler {

	constructor( encoder, decoder ) {

		this.encoder = encoder;
		this.decoder = decoder;

	}

	transpile() {

		return this.decoder.emit( this.encoder.parse() );

	}

}

export default Transpiler;
