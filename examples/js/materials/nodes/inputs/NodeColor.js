/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.NodeColor = function( color ) {
	
	THREE.NodeInput.call( this, 'c', {share:false} );
	
	this.value = new THREE.Color( color || 0 );
	
};

THREE.NodeColor.prototype = Object.create( THREE.NodeInput.prototype );
THREE.NodeColor.prototype.constructor = THREE.NodeColor;

THREE.NodeMaterial.Shortcuts( THREE.NodeColor.prototype, 'value', [ 'r', 'g', 'b' ] );