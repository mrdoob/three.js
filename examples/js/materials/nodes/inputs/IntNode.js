/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.IntNode = function( value ) {

	THREE.InputNode.call( this, 'fv1', { share: false } );

	this.value = [ Math.floor( value || 0 ) ];

};

THREE.IntNode.prototype = Object.create( THREE.InputNode.prototype );
THREE.IntNode.prototype.constructor = THREE.IntNode;

Object.defineProperties( THREE.IntNode.prototype, {
	number: {
		get: function() {

			return this.value[ 0 ];

		},
		set: function( val ) {

			this.value[ 0 ] = Math.floor( val );

		}
	}
} );
