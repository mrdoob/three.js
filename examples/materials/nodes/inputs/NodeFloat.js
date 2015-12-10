/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.NodeFloat = function( value ) {
	
	THREE.NodeInput.call( this, 'fv1', {share:false} );
	
	this.value = [ value || 0 ];
	
};

THREE.NodeFloat.prototype = Object.create( THREE.NodeInput.prototype );
THREE.NodeFloat.prototype.constructor = THREE.NodeFloat;

Object.defineProperties( THREE.NodeFloat.prototype, {
	number: {
		get: function () { return this.value[0]; },
		set: function ( val ) { this.value[0] = val; }
	}
});