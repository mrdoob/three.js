/**
 * @author mrdoob / http://mrdoob.com/
 */

function Uniform ( value ) {
	this.isUniform = true;

	if ( typeof value === 'string' ) {

		console.warn( 'THREE.Uniform: Type parameter is no longer needed.' );
		value = arguments[ 1 ];

	}

	this.value = value;

	this.dynamic = false;

};

Uniform.prototype = {

	constructor: Uniform,

	onUpdate: function ( callback ) {

		this.dynamic = true;
		this.onUpdateCallback = callback;

		return this;

	}

};


export { Uniform };