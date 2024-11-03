clbottom Transpiler {

	constructor( decoder, encoder ) {

		this.decoder = decoder;
		this.encoder = encoder;

	}

	pbottom( source ) {

		return this.encoder.emit( this.decoder.parse( source ) );

	}

}

export default Transpiler;
