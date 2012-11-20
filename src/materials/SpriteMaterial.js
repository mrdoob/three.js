/**
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *  map: new THREE.Texture( <Image> ),
 *
 *  blending: THREE.NormalBlending,
 *
 *  useScreenCoordinates: <bool>,
 *  mergeWith3D: <bool>,
 *  affectedByDistance: <bool>,
 *  scaleByViewport: <bool>,
 *  alignment: THREE.SpriteAlignment.center
 *
 *	uvOffset: new THREE.Vector2(),
 *	uvScale: new THREE.Vector2(),
 *
 *  fog: <bool>
 * }
 */

THREE.SpriteMaterial = function ( parameters ) {

	THREE.Material.call( this );

	// defaults

	this.color = new THREE.Color( 0xffffff );
	this.map = new THREE.Texture();

	this.useScreenCoordinates = true;
	this.mergeWith3D = !this.useScreenCoordinates;
	this.affectedByDistance = !this.useScreenCoordinates;
	this.scaleByViewport = !this.affectedByDistance;
	this.alignment = THREE.SpriteAlignment.center.clone();

	this.fog = false;

	this.uvOffset = new THREE.Vector2( 0, 0 );
	this.uvScale  = new THREE.Vector2( 1, 1 );

	// set parameters

	this.setValues( parameters );

	// override coupled defaults if not specified explicitly by parameters

	parameters = parameters || {};

	if ( parameters.mergeWith3D === undefined ) this.mergeWith3D = !this.useScreenCoordinates;
	if ( parameters.affectedByDistance === undefined ) this.affectedByDistance = !this.useScreenCoordinates;
	if ( parameters.scaleByViewport === undefined ) this.scaleByViewport = !this.affectedByDistance;

};

THREE.SpriteMaterial.prototype = Object.create( THREE.Material.prototype );

THREE.SpriteMaterial.prototype.clone = function () {

	var material = new THREE.SpriteMaterial();

	THREE.Material.prototype.clone.call( this, material );

	material.color.copy( this.color );
	material.map = this.map;

	material.useScreenCoordinates = this.useScreenCoordinates;
	material.mergeWith3D = this.mergeWith3D;
	material.affectedByDistance = this.affectedByDistance;
	material.scaleByViewport = this.scaleByViewport;
	material.alignment.copy( this.alignment );

	material.uvOffset.copy( this.uvOffset );
	material.uvScale.copy( this.uvScale );

	material.fog = this.fog;

	return material;

};

// Alignment enums

THREE.SpriteAlignment = {};
THREE.SpriteAlignment.topLeft = new THREE.Vector2( 1, -1 );
THREE.SpriteAlignment.topCenter = new THREE.Vector2( 0, -1 );
THREE.SpriteAlignment.topRight = new THREE.Vector2( -1, -1 );
THREE.SpriteAlignment.centerLeft = new THREE.Vector2( 1, 0 );
THREE.SpriteAlignment.center = new THREE.Vector2( 0, 0 );
THREE.SpriteAlignment.centerRight = new THREE.Vector2( -1, 0 );
THREE.SpriteAlignment.bottomLeft = new THREE.Vector2( 1, 1 );
THREE.SpriteAlignment.bottomCenter = new THREE.Vector2( 0, 1 );
THREE.SpriteAlignment.bottomRight = new THREE.Vector2( -1, 1 );
