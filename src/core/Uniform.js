function Uniform( value ) {

	if ( typeof value === 'string' ) {

		console.warn( 'THREE.Uniform: Type parameter is no longer needed.' );
		value = arguments[ 1 ];

	}

	this.value = value;

}

Uniform.prototype.clone = function () {

	return new Uniform( this.value.clone === undefined ? this.value : this.value.clone() );

};

export { Uniform };
