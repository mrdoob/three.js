/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Sprite = function ( material ) {

	THREE.Object3D.call( this );

	this.material = ( material !== undefined ) ? material : new THREE.SpriteMaterial();

	this.rotation3d = this.rotation;
	this.rotation = 0;

};

THREE.Sprite.prototype = Object.create( THREE.Object3D.prototype );

/*
 * Custom update matrix
 */

THREE.Sprite.prototype.updateMatrix = function () {

	this.matrix.setPosition( this.position );

	this.rotation3d.set( 0, 0, this.rotation );
	this.matrix.setRotationFromEuler( this.rotation3d );

	if ( this.scale.x !== 1 || this.scale.y !== 1 ) {

		this.matrix.scale( this.scale );

	}

	this.matrixWorldNeedsUpdate = true;

};

THREE.Sprite.prototype.clone = function ( object ) {

	if ( object === undefined ) object = new THREE.Sprite( this.material );

	THREE.Object3D.prototype.clone.call( this, object );

	return object;

};

