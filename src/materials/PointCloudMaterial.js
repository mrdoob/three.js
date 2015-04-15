/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *  map: new THREE.Texture( <Image> ),
 *
 *  size: <float>,
 *  sizeAttenuation: <bool>,
 *
 *  blending: THREE.NormalBlending,
 *  depthTest: <bool>,
 *  depthWrite: <bool>,
 *
 *  vertexColors: <bool>,
 *
 *  fog: <bool>
 * }
 */

THREE.PointCloudMaterial = function ( parameters ) {

	THREE.Material.call( this );

	this.type = 'PointCloudMaterial';

	this.color = new THREE.Color( 0xffffff );

	this.map = null;

	this.size = 1;
	this.sizeAttenuation = true;

	this.vertexColors = THREE.NoColors;

	this.fog = true;

	this.setValues( parameters );

};

THREE.PointCloudMaterial.prototype = Object.create( THREE.Material.prototype );
THREE.PointCloudMaterial.prototype.constructor = THREE.PointCloudMaterial;

THREE.PointCloudMaterial.prototype.clone = function () {

	var material = new THREE.PointCloudMaterial();

	THREE.Material.prototype.clone.call( this, material );

	material.color.copy( this.color );

	material.map = this.map;

	material.size = this.size;
	material.sizeAttenuation = this.sizeAttenuation;

	material.vertexColors = this.vertexColors;

	material.fog = this.fog;

	return material;

};

THREE.PointCloudMaterial.prototype.toJSON = function () {

	var data = THREE.Material.prototype.toJSON.call( this );

	data.size	= this.size;
	data.sizeAttenuation = this.sizeAttenuation;
	data.color = this.color.getHex();

	if ( this.vertexColors !== THREE.NoColors ) data.vertexColors = this.vertexColors;
	if ( this.blending !== THREE.NormalBlending ) data.blending = this.blending;

	return data;

};

// backwards compatibility

THREE.ParticleBasicMaterial = function ( parameters ) {

	THREE.warn( 'THREE.ParticleBasicMaterial has been renamed to THREE.PointCloudMaterial.' );
	return new THREE.PointCloudMaterial( parameters );

};

THREE.ParticleSystemMaterial = function ( parameters ) {

	THREE.warn( 'THREE.ParticleSystemMaterial has been renamed to THREE.PointCloudMaterial.' );
	return new THREE.PointCloudMaterial( parameters );

};
