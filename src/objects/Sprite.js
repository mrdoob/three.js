/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Sprite = ( function () {

	var vertices = new THREE.Float32Attribute( 3, 3 );
	vertices.set( [ - 0.5, - 0.5, 0, 0.5, - 0.5, 0, 0.5, 0.5, 0 ] );

	var geometry = new THREE.BufferGeometry();
	geometry.addAttribute( 'position', vertices );

	return function ( material ) {

		THREE.Object3D.call( this );

		this.geometry = geometry;
		this.material = ( material !== undefined ) ? material : new THREE.SpriteMaterial();

	};

} )();

THREE.Sprite.prototype = Object.create( THREE.Object3D.prototype );

/*
 * Custom update matrix
 */

THREE.Sprite.prototype.updateMatrix = function () {

	this.matrix.compose( this.position, this.quaternion, this.scale );

	this.matrixWorldNeedsUpdate = true;

};

THREE.Sprite.prototype.clone = function ( object ) {

	if ( object === undefined ) object = new THREE.Sprite( this.material );

	THREE.Object3D.prototype.clone.call( this, object );

	return object;

};

// Backwards compatibility

THREE.Particle = THREE.Sprite;