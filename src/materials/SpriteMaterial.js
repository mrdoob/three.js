/**
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *  map: new THREE.Texture( <Image> ),
 *
 *  blending: THREE.NormalBlending,
 *  depthTest: <bool>,
 *  depthWrite: <bool>,
 *
 *  useScreenCoordinates: <bool>,
 *  sizeAttenuation: <bool>,
 *  scaleByViewport: <bool>,
 *  alignment: THREE.SpriteAlignment.center,
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
	this.depthTest = !this.useScreenCoordinates;
	this.sizeAttenuation = !this.useScreenCoordinates;
	this.scaleByViewport = !this.sizeAttenuation;
	this.alignment = THREE.SpriteAlignment.center.clone();

	this.fog = false;

	this.uvOffset = new THREE.Vector2( 0, 0 );
	this.uvScale  = new THREE.Vector2( 1, 1 );

	// set parameters

	this.setValues( parameters );

	// override coupled defaults if not specified explicitly by parameters

	parameters = parameters || {};

	if ( parameters.depthTest === undefined ) this.depthTest = !this.useScreenCoordinates;
	if ( parameters.sizeAttenuation === undefined ) this.sizeAttenuation = !this.useScreenCoordinates;
	if ( parameters.scaleByViewport === undefined ) this.scaleByViewport = !this.sizeAttenuation;

};

THREE.SpriteMaterial.prototype = Object.create( THREE.Material.prototype );

THREE.SpriteMaterial.prototype.clone = function () {

	var material = new THREE.SpriteMaterial();

	THREE.Material.prototype.clone.call( this, material );

	material.color.copy( this.color );
	material.map = this.map;

	material.useScreenCoordinates = this.useScreenCoordinates;
	material.sizeAttenuation = this.sizeAttenuation;
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
