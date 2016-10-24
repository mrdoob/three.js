/**
 * @author mrdoob / http://mrdoob.com/
 */

function Uniform( value ) {

	if ( typeof value === 'string' ) {

		console.warn( 'THREE.Uniform: Type parameter is no longer needed.' );
		value = arguments[ 1 ];

	}

	this._value = value;

	this.needsUpdate = true;

}

Uniform.prototype = {

	constructor: Uniform,

	get value() {

		return this._value;

	},

	set value( value ) {

		if ( this.needsUpdate === false && value !== this._value ) {

			this.needsUpdate = true;

		}

		this._value = value;

	}

};

export { Uniform };
