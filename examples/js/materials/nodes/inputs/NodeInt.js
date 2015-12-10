/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.NodeInt = function( value ) {
	
	THREE.NodeInput.call( this, 'fv1', {share:false} );
	
	this.value = [ Math.floor(value || 0) ];
	
};

THREE.NodeInt.prototype = Object.create( THREE.NodeInput.prototype );
THREE.NodeInt.prototype.constructor = THREE.NodeInt;

Object.defineProperties( THREE.NodeInt.prototype, {
	number: {
		get: function () { return this.value[0]; },
		set: function ( val ) { this.value[0] = Math.floor(val); }
	}
});
