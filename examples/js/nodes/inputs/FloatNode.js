/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.FloatNode = function( value ) {

	THREE.InputNode.call( this, 'fv1', { share: false } );

	this.value = [ value || 0 ];

};

THREE.FloatNode.prototype = Object.create( THREE.InputNode.prototype );
THREE.FloatNode.prototype.constructor = THREE.FloatNode;

Object.defineProperties( THREE.FloatNode.prototype, {
	number: {
		get: function() {

			return this.value[ 0 ];

		},
		set: function( val ) {

			this.value[ 0 ] = val;

		}
	}
} );
