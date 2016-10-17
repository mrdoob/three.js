/**
 * @author mrdoob / http://mrdoob.com/
 */

function Uniform( value ) {

	if ( typeof value === 'string' ) {

		console.warn( 'THREE.Uniform: Type parameter is no longer needed.' );
		value = arguments[ 1 ];

	}

	this.value = value;

}

export { Uniform };
