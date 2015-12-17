/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.NodeVector2 = function( x, y ) {
	
	THREE.NodeInput.call( this, 'v2', {share:false} );
	
	this.value = new THREE.Vector2( x, y );
	
};

THREE.NodeVector2.prototype = Object.create( THREE.NodeInput.prototype );
THREE.NodeVector2.prototype.constructor = THREE.NodeVector2;

THREE.NodeMaterial.Shortcuts( THREE.NodeVector2.prototype, 'value', [ 'x', 'y' ] );